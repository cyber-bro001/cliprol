import json
import logging
import os
import time
from dotenv import load_dotenv
from google import genai
from google.genai import types
from moviepy import VideoFileClip
import asyncio
from services.blocking import run_blocking

load_dotenv()

GEMINI = os.getenv("GEMINI_API_KEY")
FILE_PROCESSING_TIMEOUT_SECONDS = float(os.getenv("GEMINI_FILE_PROCESSING_TIMEOUT_SECONDS", "3600"))
GEMINI_HTTP_TIMEOUT_MS = int(os.getenv("GEMINI_HTTP_TIMEOUT_MS", "1200000"))
logger = logging.getLogger(__name__)


async def detect_moments_with_progress(video_path):
    """
    Analyze the video and yield progress updates in real time.

    Yields tuples:
        ("progress", message) - a progress message to forward to the client
        ("result", moments)   - the final detected moments
    """
    client = genai.Client(
        api_key=GEMINI,
        http_options=types.HttpOptions(timeout=GEMINI_HTTP_TIMEOUT_MS),
    )

    yield ("progress", "Uploading video for analysis")

    # Measure the source duration so Gemini returns in-range timestamps.
    src = VideoFileClip(video_path)
    try:
        duration = src.duration
    finally:
        src.close()

    stage_started = time.perf_counter()
    video_file = await run_blocking(client.files.upload, file=video_path)
    logger.info("Gemini video upload completed in %.1f seconds", time.perf_counter() - stage_started)

    yield ("progress", "Analyzing video content...")

    stage_started = time.perf_counter()
    last_progress = stage_started
    while video_file.state.name == "PROCESSING":
        elapsed = time.perf_counter() - stage_started
        if elapsed >= FILE_PROCESSING_TIMEOUT_SECONDS:
            raise TimeoutError(
                f"Gemini did not finish processing the video within "
                f"{FILE_PROCESSING_TIMEOUT_SECONDS:g} seconds"
            )
        await asyncio.sleep(5)
        video_file = await run_blocking(client.files.get, name=video_file.name)
        now = time.perf_counter()
        if now - last_progress >= 30:
            logger.info("Gemini is still processing video (%.1f seconds elapsed)", now - stage_started)
            last_progress = now

    if video_file.state.name != "ACTIVE":
        raise RuntimeError(f"Gemini video processing ended in state {video_file.state.name}")
    logger.info("Gemini video processing completed in %.1f seconds", time.perf_counter() - stage_started)


    prompt = f"""
You are an expert short-form video editor.

Analyze this video and identify the most interesting moments
that should become short clips for social media.

The video is {duration:.1f} seconds long.

Look for:
- important moments
- emotional reactions
- funny moments
- surprising moments
- strong opinions
- valuable explanations
- moments that would make someone stop scrolling

For each moment return:

- start time in seconds
- end time in seconds
- why this moment is interesting

Rules:
- Do not include boring introductions
- Do not include greetings
- Do not include dead space
- Keep clips between 30 and 60 seconds
- Choose only the strongest moments
- ALL start/end times MUST be within 0 and {duration:.1f} seconds
- start MUST be strictly less than end

Return ONLY valid JSON.

Format:

[
  {{
    "start": 120,
    "end": 155,
    "reason": "The speaker explains a surprising idea"
  }}
]
"""

    yield ("progress", "Generating the best moments")

    stage_started = time.perf_counter()
    response = await run_blocking(
        client.models.generate_content,
        model="gemini-2.5-flash",
        contents=[
            video_file,
            prompt
        ]
    )
    logger.info("Gemini moment analysis completed in %.1f seconds", time.perf_counter() - stage_started)

    result = response.text

    refined_result = result.replace("```json", "").replace("```", "").strip()

    moments = json.loads(refined_result)

    yield ("result", moments)

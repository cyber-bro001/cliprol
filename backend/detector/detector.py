import json
import os
from dotenv import load_dotenv
from google import genai
from moviepy import VideoFileClip
import asyncio

load_dotenv()

GEMINI = os.getenv("GEMINI_API_KEY")


async def detect_moments_with_progress(video_path):
    """
    Analyze the video and yield progress updates in real time.

    Yields tuples:
        ("progress", message) - a progress message to forward to the client
        ("result", moments)   - the final detected moments
    """
    client = genai.Client(api_key=GEMINI)

    yield ("progress", "Uploading video for analysis")

    # Measure the source duration so Gemini returns in-range timestamps.
    src = VideoFileClip(video_path)
    try:
        duration = src.duration
    finally:
        src.close()

    video_file = await asyncio.to_thread(client.files.upload, file=video_path)

    yield ("progress", "Analyzing video content...")

    while video_file.state.name == "PROCESSING":
        await asyncio.sleep(5)
        video_file = await asyncio.to_thread(client.files.get, name=video_file.name)


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

    response = await asyncio.to_thread(
        client.models.generate_content,
        model="gemini-2.5-flash",
        contents=[
            video_file,
            prompt
        ]
    )

    result = response.text

    refined_result = result.replace("```json", "").replace("```", "").strip()

    moments = json.loads(refined_result)

    yield ("result", moments)

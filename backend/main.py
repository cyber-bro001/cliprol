from logging import DEBUG

from fastapi import FastAPI, UploadFile, File, Request
from fastapi.responses import StreamingResponse
from fastapi.sse import ServerSentEvent
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel
import uuid
import os
import asyncio
from dotenv import load_dotenv
import json

from downloader.downloader import download_video
from editor.editor import create_clip
from detector.detector import detect_moments_with_progress
from helpers.error_stream_helper import error_stream_generator

load_dotenv()

DEFAULT_STORAGE = os.path.join(os.path.dirname(__file__), "storage", "videos")
BASE_STORAGE = os.path.abspath(os.getenv("STORAGE_PATH", DEFAULT_STORAGE))
os.makedirs(BASE_STORAGE, exist_ok=True)

app = FastAPI()

# Clips stay on disk under BASE_STORAGE, but are exposed through this route so
# the URLs returned to the browser can be loaded and downloaded directly.
app.mount("/videos", StaticFiles(directory=BASE_STORAGE), name="videos")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class ProcessRequest(BaseModel):
    url: str


def serialize_sse_event(event: ServerSentEvent) -> str:
    """
    Convert ServerSentEvent to SSE wire format string
    """
    lines = []

    if event.comment:
        lines.append(f": {event.comment}")

    if event.event:
        lines.append(f"event: {event.event}")

    if event.id:
        lines.append(f"id: {event.id}")

    if event.retry:
        lines.append(f"retry: {event.retry}")

    if event.data is not None:
        data_str = json.dumps(event.data)
        lines.append(f"data: {data_str}")
    elif event.raw_data:
        lines.append(f"data: {event.raw_data}")

    return "\n".join(lines) + "\n\n"


async def process_pipeline(video, folder, asset_base_url):
    try:
        yield ServerSentEvent(event="progress", data={"message": "Preparing video"})

        try:
            moments = None
            async for kind, payload in detect_moments_with_progress(video):
                if kind == "progress":
                    yield ServerSentEvent(event="progress", data={"message": payload})
                elif kind == "result":
                    moments = payload
        except Exception as e:
            error_msg = "Unable to analyze video. This may be due to video format, duration, or content restrictions. Please try a different video."
            yield ServerSentEvent(event="error", data={"message": error_msg})
            return

        if not moments:
            if os.path.exists(video):
                os.remove(video)
            yield ServerSentEvent(event="error", data={"message": "No interesting moments found in this video. Try uploading a longer video with more varied content."})
            return

        clips = []

        for index, moment in enumerate(moments):
            start_time = moment["start"]
            end_time = moment["end"]

            yield ServerSentEvent(
                event="progress",
                data={
                    "message": f"Creating clip {index + 1} of {len(moments)}"},
            )

            try:
                clip_path = await asyncio.to_thread(
                    create_clip, video, start_time, end_time, folder
                )
                if clip_path:
                    # Only the API knows how its local storage is exposed. Keep
                    # the editor filesystem-focused and turn its output into a
                    # browser URL here while preserving the moment metadata.
                    relative_clip_path = os.path.relpath(
                        clip_path, BASE_STORAGE)
                    clip_url = f"{asset_base_url}/{relative_clip_path.replace(os.sep, '/')}"
                    clips.append({
                        "video": clip_url,
                        "start": start_time,
                        "end": end_time,
                        "reason": moment.get("reason", ""),
                    })
            except Exception as e:
                yield ServerSentEvent(event="error", data={"message": "Failed to create clips. This may be a temporary issue. Please try again."})
                return

        if not clips:
            if os.path.exists(video):
                os.remove(video)
            yield ServerSentEvent(event="error", data={"message": "No valid clips could be created from the detected moments. Please try a different video."})
            return

        yield ServerSentEvent(event="progress", data={"message": "Finalizing"})

        if os.path.exists(video):
            os.remove(video)

        yield ServerSentEvent(event="success", data={
            "status": "success",
            "moments_detected": len(moments),
            "clips": clips,
            "moments": moments
        })

    except Exception as e:
        yield ServerSentEvent(event="error", data={"message": "An unexpected error occurred. Please try again later."})


async def sse_stream_generator(video, folder, asset_base_url):
    """Wrapper that converts async generator to SSE stream"""
    async for event in process_pipeline(video, folder, asset_base_url):
        yield serialize_sse_event(event)


@app.post("/process-url")
async def process_video(request: ProcessRequest, http_request: Request):
    try:
        job_id = str(uuid.uuid4())
        folder = f"{BASE_STORAGE}/{job_id}"
        os.makedirs(folder, exist_ok=True)

        try:
            video = await asyncio.to_thread(download_video, request.url, folder)
        except Exception:
            error_msg = "Could not download video. Please check the URL is valid and try again."

            async def error_stream():
                async for event in error_stream_generator(error_msg):
                    yield serialize_sse_event(event)

            return StreamingResponse(
                error_stream(),
                media_type="text/event-stream",
                headers={"Cache-Control": "no-cache"}
            )

        return StreamingResponse(
            sse_stream_generator(video, folder, str(
                http_request.base_url).rstrip("/") + "/videos"),
            media_type="text/event-stream",
            headers={"Cache-Control": "no-cache"}
        )

    except Exception as e:
        async def error_stream():
            async for event in error_stream_generator("An error occurred while processing your request. Please try again."):
                yield serialize_sse_event(event)

        return StreamingResponse(
            error_stream(),
            media_type="text/event-stream",
            headers={"Cache-Control": "no-cache"}
        )


@app.post("/upload-video")
async def process_upload(http_request: Request, file: UploadFile = File(...)):
    try:
        job_id = str(uuid.uuid4())
        folder = f"{BASE_STORAGE}/{job_id}"
        os.makedirs(folder, exist_ok=True)

        video_path = f"{folder}/final.mp4"

        contents = await file.read()

        with open(video_path, "wb") as f:
            f.write(contents)

        return StreamingResponse(
            sse_stream_generator(video_path, folder, str(
                http_request.base_url).rstrip("/") + "/videos"),
            media_type="text/event-stream",
            headers={"Cache-Control": "no-cache"}
        )

    except Exception as e:
        async def error_stream():
            async for event in error_stream_generator("Failed to upload file. Please try again."):
                yield serialize_sse_event(event)

        return StreamingResponse(
            error_stream(),
            media_type="text/event-stream",
            headers={"Cache-Control": "no-cache"}
        )

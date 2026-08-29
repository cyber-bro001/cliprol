from logging import DEBUG

from fastapi import FastAPI, UploadFile, File
from fastapi.responses import StreamingResponse
from fastapi.sse import ServerSentEvent
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import uuid
import os
import asyncio
from dotenv import load_dotenv
import json

from downloader.downloader import download_video
from editor.editor import create_clip
from detector.detector import moment_detection
from helpers.error_stream_helper import error_stream_generator

load_dotenv()

BASE_STORAGE = os.getenv("STORAGE_PATH", "storage/videos")

app = FastAPI()

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


async def process_pipeline(video, folder):
    try:
        yield ServerSentEvent(event="progress", data={"message": "Preparing video"})

        try:
            moments = await asyncio.to_thread(moment_detection, video)
        except Exception as e:
            error_msg = "Unable to analyze video. This may be due to video format, duration, or content restrictions. Please try a different video."
            yield ServerSentEvent(event="error", data={"message": error_msg})
            return

        yield ServerSentEvent(event="progress", data={"message": "Analyzing content"})

        if not moments:
            if os.path.exists(video):
                os.remove(video)
            yield ServerSentEvent(event="error", data={"message": "No interesting moments found in this video. Try uploading a longer video with more varied content."})
            return

        yield ServerSentEvent(event="progress", data={"message": "Finding key moments"})

        clips = []
        yield ServerSentEvent(event="progress", data={"message": "Creating clips"})

        for moment in moments:
            start_time = moment["start"]
            end_time = moment["end"]

            try:
                clip = await asyncio.to_thread(create_clip, video, start_time, end_time, folder)
                clips.append(clip)
            except Exception as e:
                yield ServerSentEvent(event="error", data={"message": "Failed to create clips. This may be a temporary issue. Please try again."})
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


async def sse_stream_generator(video, folder):
    """Wrapper that converts async generator to SSE stream"""
    async for event in process_pipeline(video, folder):
        yield serialize_sse_event(event)


@app.post("/process-url")
async def process_video(request: ProcessRequest):
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
            sse_stream_generator(video, folder),
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
async def process_upload(file: UploadFile = File(...)):
    try:
        job_id = str(uuid.uuid4())
        folder = f"{BASE_STORAGE}/{job_id}"
        os.makedirs(folder, exist_ok=True)

        video_path = f"{folder}/final.mp4"

        contents = await file.read()

        with open(video_path, "wb") as f:
            f.write(contents)

        return StreamingResponse(
            sse_stream_generator(video_path, folder),
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

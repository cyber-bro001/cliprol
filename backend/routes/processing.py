"""HTTP routes for video processing."""

import os
import shutil

from fastapi import APIRouter, File, Header, UploadFile
from fastapi.responses import StreamingResponse
from pydantic import BaseModel

from helpers.sse import stream_sse_events
from services.processing_service import create_job_folder, process_url_video
from services.project_service import get_authorized_project_user

router = APIRouter()
SSE_HEADERS = {"Cache-Control": "no-cache"}


class ProcessRequest(BaseModel):
    url: str
    project_id: str


def error_events(message: str):
    async def generate():
        yield ("error", {"message": message})
    return generate()


def sse_response(events):
    return StreamingResponse(
        stream_sse_events(events),
        media_type="text/event-stream",
        headers=SSE_HEADERS,
    )


def extract_bearer_token(authorization: str) -> str:
    scheme, token = authorization.split(" ", 1)
    if scheme.lower() != "bearer" or not token:
        raise ValueError("Invalid authorization scheme")
    return token


@router.post("/process-url")
async def process_video(request: ProcessRequest, authorization: str = Header(...)):
    try:
        user = get_authorized_project_user(
            extract_bearer_token(authorization), request.project_id
        )
    except Exception:
        return sse_response(error_events("You are not authenticated."))

    return sse_response(process_url_video(request.url, user.id, request.project_id))


@router.post("/upload-video")
async def process_upload(file: UploadFile = File(...)):
    """Keep the legacy upload endpoint isolated until its project contract is designed."""
    folder = create_job_folder()
    video_path = os.path.join(folder, "final.mp4")
    try:
        contents = await file.read()
        with open(video_path, "wb") as destination:
            destination.write(contents)
    except Exception:
        return sse_response(error_events("Failed to upload file. Please try again."))
    finally:
        # The endpoint has no authenticated project/user contract yet, so it
        # cannot safely send clips to private project storage. Do not retain
        # a local upload while that separate design work is pending.
        shutil.rmtree(folder, ignore_errors=True)

    return sse_response(
        error_events("Upload processing is not configured for project-backed processing yet.")
    )

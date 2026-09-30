"""HTTP routes for video processing."""

from contextlib import aclosing
from uuid import UUID

from fastapi import APIRouter, File, Form, Header, UploadFile
from fastapi.responses import StreamingResponse
from pydantic import BaseModel

from helpers.sse import stream_sse_events
from services.processing_service import process_uploaded_video, process_url_video
from services.project_service import get_authorized_project_user

router = APIRouter()
SSE_HEADERS = {"Cache-Control": "no-cache"}


class ProcessRequest(BaseModel):
    url: str
    project_id: UUID


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
    project_id = str(request.project_id)
    try:
        user = get_authorized_project_user(
            extract_bearer_token(authorization), project_id, required_status='processing'
        )
    except Exception:
        return sse_response(error_events("You are not authenticated."))

    return sse_response(process_url_video(request.url, user.id, project_id))


@router.post("/upload-video")
async def process_upload(
    file: UploadFile = File(...),
    project_id: UUID = Form(...),
    authorization: str = Header(...),
):
    project_id = str(project_id)
    try:
        user = get_authorized_project_user(
            extract_bearer_token(authorization), project_id, required_status='processing'
        )
    except Exception:
        await file.close()
        return sse_response(error_events("You are not authenticated or do not have access to this project."))

    async def events():
        try:
            async with aclosing(process_uploaded_video(
                file.file, user.id, project_id, file.filename or "source.mp4"
            )) as processing:
                async for event in processing:
                    yield event
        finally:
            await file.close()

    return sse_response(events())

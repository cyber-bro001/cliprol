"""HTTP routes for video processing."""

import os
from contextlib import aclosing
from uuid import UUID

from fastapi import APIRouter, File, Form, Header, HTTPException, UploadFile
from fastapi.responses import StreamingResponse
from pydantic import BaseModel

from helpers.sse import stream_sse_events
from services.processing_service import process_uploaded_video, process_url_video
from services.http_errors import authentication_http_error
from services.project_service import (
    ProjectStateConflictError,
    ProjectUnavailableError,
    get_authorized_project_user,
)
from supabase_folder.supabase_client import create_user_client

router = APIRouter()
SSE_HEADERS = {"Cache-Control": "no-cache"}
MAX_UPLOAD_BYTES = int(os.getenv("MAX_UPLOAD_BYTES", str(3 * 1024 * 1024 * 1024)))


class ProcessRequest(BaseModel):
    url: str
    project_id: UUID


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


def authorize_processing_project(authorization: str, project_id: str):
    try:
        token = extract_bearer_token(authorization)
    except ValueError as exc:
        raise HTTPException(401, "Sign in to access this project.", headers={"Cache-Control": "no-store"}) from exc

    try:
        client = create_user_client(token)
        user = get_authorized_project_user(
            token, project_id, required_status="processing", client=client
        )
    except ProjectUnavailableError as exc:
        raise HTTPException(404, "Project not found or unavailable.", headers={"Cache-Control": "no-store"}) from exc
    except ProjectStateConflictError as exc:
        raise HTTPException(409, "This project is not ready for processing.", headers={"Cache-Control": "no-store"}) from exc
    except Exception as exc:
        raise authentication_http_error(exc, project_id=project_id) from exc
    return user, client


@router.post("/process-url")
async def process_video(request: ProcessRequest, authorization: str = Header(...)):
    project_id = str(request.project_id)
    user, client = authorize_processing_project(authorization, project_id)

    return sse_response(process_url_video(request.url, user.id, project_id, client=client))


@router.post("/upload-video")
async def process_upload(
    file: UploadFile = File(...),
    project_id: UUID = Form(...),
    authorization: str = Header(...),
):
    project_id = str(project_id)
    if file.size is not None and file.size > MAX_UPLOAD_BYTES:
        await file.close()
        raise HTTPException(413, "Uploaded video exceeds the size limit.")
    try:
        user, client = authorize_processing_project(authorization, project_id)
    except HTTPException:
        await file.close()
        raise

    async def events():
        try:
            async with aclosing(process_uploaded_video(
                file.file, user.id, project_id, file.filename or "source.mp4", client=client
            )) as processing:
                async for event in processing:
                    yield event
        finally:
            await file.close()

    return sse_response(events())

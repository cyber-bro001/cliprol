"""Owner-authorized access to persisted private clips."""

import logging
from uuid import UUID

from fastapi import APIRouter, Header, HTTPException, Response
from postgrest.exceptions import APIError
from supabase_auth.errors import AuthError

from routes.processing import extract_bearer_token
from supabase_folder.supabase_client import create_user_client
from services.clip_service import get_project_clips
from services.http_errors import authentication_http_error, upstream_http_error
from services.project_service import (
    ProjectStateConflictError,
    ProjectUnavailableError,
    get_authorized_project_user,
)
from services.supabase_storage import create_clip_access

router = APIRouter()
NO_STORE = {"Cache-Control": "no-store"}
logger = logging.getLogger(__name__)


@router.get("/projects/{project_id}/clips")
def project_clips(project_id: UUID, response: Response, authorization: str = Header(default="")):
    project_id = str(project_id)
    try:
        token = extract_bearer_token(authorization)
    except ValueError as exc:
        logger.exception("Token extraction failed for project %s", project_id)
        raise HTTPException(401, "Sign in to access this project.", headers=NO_STORE) from exc
    try:
        client = create_user_client(token)
        user = get_authorized_project_user(token, project_id, required_status='done', client=client)
    except HTTPException:
        raise
    except ProjectUnavailableError:
        raise HTTPException(404, "Project not found or unavailable.", headers=NO_STORE)
    except ProjectStateConflictError:
        raise HTTPException(409, "Only completed projects can be viewed here.", headers=NO_STORE)
    except Exception as exc:
        if isinstance(exc, AuthError):
            failed_step = "get_user"
        elif isinstance(exc, APIError):
            failed_step = "project query"
        else:
            failed_step = "get_user/project query"
        logger.exception("%s failed for project %s", failed_step, project_id)
        raise authentication_http_error(exc, project_id=project_id) from exc

    failed_step = "clip query"
    try:
        clips = []
        project_clips = get_project_clips(project_id, client=client)
        for clip in project_clips:
            failed_step = "clip validation"
            if clip["project_id"] != project_id:
                raise ValueError("Unexpected clip project")
            failed_step = "signed URL creation"
            clips.append({
                "id": clip["id"], "storagePath": clip["clip_url"],
                "start": clip["start_time"], "end": clip["end_time"],
                "reason": clip.get("reason") or "",
                "media": create_clip_access(clip["clip_url"], user.id, project_id),
            })
    except HTTPException:
        raise
    except Exception as exc:
        logger.exception("%s failed for project %s", failed_step, project_id)
        raise upstream_http_error(exc, operation="Private clip retrieval or signing", project_id=project_id) from exc

    response.headers.update(NO_STORE)
    return {"clips": clips}

"""Owner-authorized access to persisted private clips."""

from uuid import UUID

from fastapi import APIRouter, Header, HTTPException, Response

from routes.processing import extract_bearer_token
from services.clip_service import get_project_clips
from services.project_service import get_authorized_project_user
from services.supabase_storage import create_clip_access

router = APIRouter()
NO_STORE = {"Cache-Control": "no-store"}


@router.get("/projects/{project_id}/clips")
def project_clips(project_id: UUID, response: Response, authorization: str = Header(...)):
    project_id = str(project_id)
    try:
        token = extract_bearer_token(authorization)
        user = get_authorized_project_user(token, project_id, required_status='done')
    except Exception:
        raise HTTPException(403, "You do not have access to this project.", headers=NO_STORE)

    try:
        clips = []
        for clip in get_project_clips(project_id):
            if clip["project_id"] != project_id:
                raise ValueError("Unexpected clip project")
            clips.append({
                "id": clip["id"], "storagePath": clip["clip_url"],
                "start": clip["start_time"], "end": clip["end_time"],
                "reason": clip.get("reason") or "",
                "media": create_clip_access(clip["clip_url"], user.id, project_id),
            })
    except Exception:
        raise HTTPException(502, "Unable to load private clips. Please reload the page.", headers=NO_STORE)

    response.headers.update(NO_STORE)
    return {"clips": clips}

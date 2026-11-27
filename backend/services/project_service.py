"""Project authorization and processing lifecycle database operations."""
import logging

logger = logging.getLogger(__name__)


class ProjectUnavailableError(Exception):
    """Project is absent or not owned by the authenticated user."""


class ProjectStateConflictError(Exception):
    """Owned project is not currently in the required state."""


def update_project_status(project_id: str, user_id: str, status: str, thumbnail_path: str | None = None, title: str | None = None, *, client):
    """Update an owned project and require confirmation of the stored status."""
    if status not in {"processing", "done", "error"}:
        raise ValueError("Invalid processing status")

    response = (
        client.table("projects")
        .update({"status": status,
                 **({"thumbnail_path": thumbnail_path} if thumbnail_path is not None else {}),
                 **({"title": title} if title is not None else {})})
        .eq("id", project_id)
        .eq("user_id", user_id)
        .execute()
    )
    if not response.data or len(response.data) != 1 or response.data[0]["status"] != status:
        raise RuntimeError("Project status update was not confirmed")
    return response.data[0]

def get_authorized_project_user(access_token: str, project_id: str, required_status: str | None = None, *, client=None):
    """Return the authenticated owner after verifying access to a project."""
    from supabase_folder.supabase_client import create_user_client, get_user_from_token

    user = get_user_from_token(access_token)
    if client is None:
        client = create_user_client(access_token)
    project = (
        client
        .from_("projects")
        .select("id,status")
        .eq("id", project_id)
        .eq("user_id", user.id)
        .execute()
    )

    if not project.data or len(project.data) != 1:
        logger.info("Project unavailable to authenticated owner check: %s", project_id)
        raise ProjectUnavailableError("Project not found or unavailable")

    if required_status is not None and project.data[0]['status'] != required_status:
        logger.info("Project %s is not in required status %s", project_id, required_status)
        raise ProjectStateConflictError("Project is not in the required state")

    return user


def project_completed(project_id: str, user_id: str, *, client) -> bool:
    """Read back an ambiguous completion write before destructive cleanup."""
    result = client.table('projects').select('status').eq('id', project_id).eq('user_id', user_id).execute()
    if result.data is None:
        raise RuntimeError('Completion could not be verified')
    return bool(result.data and result.data[0]['status'] == 'done')


def require_processing_project(project_id: str, user_id: str, *, client):
    """Recheck after acquiring the operation guard, before any write/cleanup."""
    result = client.table('projects').select('status').eq('id', project_id).eq('user_id', user_id).execute()
    if not result.data or len(result.data) != 1 or result.data[0]['status'] != 'processing':
        raise ValueError('Project is no longer available for processing')

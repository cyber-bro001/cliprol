"""Owned media signing and deletion; project listing remains in Supabase/RLS."""
import logging
from uuid import UUID

from fastapi import APIRouter, Header, HTTPException, Response
from pydantic import BaseModel, Field

from routes.processing import extract_bearer_token
from services.project_cleanup import cleanup_project
from services.project_operations import project_operation, ProjectBusy
from services.supabase_storage import create_thumbnail_access

router = APIRouter()
logger = logging.getLogger(__name__)
NO_STORE = {'Cache-Control': 'no-store'}


def authenticate(authorization):
    from supabase_folder.supabase_client import get_user_from_token
    try:
        return get_user_from_token(extract_bearer_token(authorization))
    except Exception:
        raise HTTPException(401, 'Sign in to access this project.', headers=NO_STORE)


class ThumbnailRequest(BaseModel):
    project_ids: list[UUID] = Field(max_length=100)


@router.post('/projects/thumbnail-access')
def thumbnail_access(request: ThumbnailRequest, response: Response, authorization: str = Header(...)):
    from supabase_folder.supabase_client import supabase
    user = authenticate(authorization)
    ids = list({str(value) for value in request.project_ids})
    response.headers.update(NO_STORE)
    if not ids:
        return {'thumbnails': {}}
    try:
        rows = supabase.table('projects').select('id,thumbnail_path').eq('user_id', user.id).eq('status', 'done').in_('id', ids).execute().data
        if rows is None:
            raise RuntimeError('Project query failed')
    except Exception:
        raise HTTPException(502, 'Unable to load thumbnails.', headers=NO_STORE)
    thumbnails = {}
    for row in rows:
        thumbnails[row['id']] = None
        if not row.get('thumbnail_path'):
            continue
        try:
            with project_operation(row['id']):
                thumbnails[row['id']] = create_thumbnail_access(row['thumbnail_path'], user.id, row['id'])
        except Exception:
            logger.warning('Thumbnail unavailable for project %s', row['id'], exc_info=True)
    return {'thumbnails': thumbnails}


@router.delete('/projects/{project_id}', status_code=204)
def delete_project(project_id: UUID, authorization: str = Header(...)):
    from supabase_folder.supabase_client import supabase
    user = authenticate(authorization)
    project_id = str(project_id)
    try:
        with project_operation(project_id):
            rows = supabase.table('projects').select('id,status').eq('id', project_id).eq('user_id', user.id).execute().data
            if rows is None:
                raise RuntimeError('Ownership query failed')
            if not rows:
                # Identical response for foreign and absent IDs; no deletion.
                raise HTTPException(404, 'Project not found or unavailable.', headers=NO_STORE)
            if rows[0]['status'] != 'done':
                raise HTTPException(409, 'Only completed projects can be deleted here.', headers=NO_STORE)
            cleanup_project(user.id, project_id)
    except HTTPException:
        raise
    except ProjectBusy:
        raise HTTPException(409, 'A project operation is already running.', headers=NO_STORE)
    except Exception:
        logger.exception('Project deletion incomplete for %s', project_id)
        raise HTTPException(502, 'Deletion could not be completed. Some files may already have been removed. Please refresh before trying again.', headers=NO_STORE)
    return Response(status_code=204, headers=NO_STORE)

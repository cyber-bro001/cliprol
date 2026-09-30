from datetime import datetime, timedelta, timezone

MEDIA_ACCESS_SECONDS = 3600


def upload_clip(file_path: str, storage_path: str):
    from supabase_folder.supabase_client import supabase

    with open(file_path, "rb") as file:
        result = supabase.storage.from_("clips").upload(
            storage_path,
            file,
            {"content-type": "video/mp4"}
        )

    return result


def upload_thumbnail(file_path: str, storage_path: str):
    from supabase_folder.supabase_client import supabase
    with open(file_path, 'rb') as file:
        return supabase.storage.from_('clips').upload(storage_path, file, {'content-type': 'image/jpeg'})


def create_thumbnail_access(storage_path: str, user_id: str, project_id: str):
    from services.project_cleanup import validate_project_path, project_prefix
    from supabase_folder.supabase_client import supabase
    validate_project_path(storage_path, user_id, project_id)
    if storage_path != project_prefix(user_id, project_id) + 'thumbnail.jpg':
        raise ValueError('Invalid thumbnail path')
    result = supabase.storage.from_('clips').create_signed_url(storage_path, MEDIA_ACCESS_SECONDS)
    if not result.get('signedURL'):
        raise RuntimeError('Thumbnail signing failed')
    return {'url': result['signedURL'], 'expiresAt': (datetime.now(timezone.utc) + timedelta(seconds=MEDIA_ACCESS_SECONDS)).isoformat()}


def create_clip_access(storage_path: str, user_id: str, project_id: str):
    """Sign only a canonical object path inside this owner's project."""
    prefix = f"{user_id}/{project_id}/"
    if (not storage_path.startswith(prefix)
            or any(part in {"", ".", ".."} for part in storage_path.split("/"))
            or any(character in storage_path for character in "\\%?#")
            or any(ord(character) < 32 for character in storage_path)
            or not storage_path.endswith(".mp4")):
        raise ValueError("Clip storage path does not belong to the authorized project")

    from supabase_folder.supabase_client import supabase

    filename = storage_path.rsplit("/", 1)[-1]
    expires_at = datetime.now(timezone.utc) + timedelta(seconds=MEDIA_ACCESS_SECONDS)
    bucket = supabase.storage.from_("clips")
    preview = bucket.create_signed_url(storage_path, MEDIA_ACCESS_SECONDS)
    download = bucket.create_signed_url(storage_path, MEDIA_ACCESS_SECONDS, {"download": filename})
    if not preview.get("signedURL") or not download.get("signedURL"):
        raise RuntimeError("Clip access could not be generated")
    return {
        "previewUrl": preview["signedURL"], "downloadUrl": download["signedURL"],
        "expiresAt": expires_at.isoformat(), "filename": filename,
    }

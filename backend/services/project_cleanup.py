"""Storage first, then cascading metadata deletion. No client-supplied paths."""
from uuid import UUID


def project_prefix(user_id: str, project_id: str) -> str:
    return f"{UUID(user_id)}/{UUID(project_id)}/"


def validate_project_path(path: str, user_id: str, project_id: str) -> str:
    prefix = project_prefix(user_id, project_id)
    if (not isinstance(path, str) or not path.startswith(prefix)
            or any(part in {'', '.', '..'} for part in path.split('/'))
            or any(c in path for c in '\\%?#') or any(ord(c) < 32 for c in path)):
        raise ValueError('Invalid project Storage path')
    return path


def list_project_objects(bucket, user_id: str, project_id: str) -> list[str]:
    """Enumerate before deleting so offsets cannot skip objects during removal."""
    root = project_prefix(user_id, project_id).rstrip('/')
    paths = []
    pending = [root]
    while pending:
        folder = pending.pop()
        offset = 0
        while True:
            entries = bucket.list(folder, {'limit': 100, 'offset': offset, 'sortBy': {'column': 'name', 'order': 'asc'}})
            if not isinstance(entries, list):
                raise RuntimeError('Storage enumeration failed')
            for entry in entries:
                name = entry['name']
                if '/' in name:
                    raise ValueError('Unexpected Storage entry')
                path = validate_project_path(f'{folder}/{name}', user_id, project_id)
                if entry.get('id') is None:
                    pending.append(path)
                else:
                    paths.append(path)
            if len(entries) < 100:
                break
            offset += len(entries)
    return paths


def cleanup_project(user_id: str, project_id: str, attempted_paths=(), *, client):
    """Caller supplies verified identity; independently recheck ownership.

    Missing project is idempotent. Never delete metadata after Storage failure.
    The migration supplies the clips -> projects ON DELETE CASCADE contract.
    """
    project_prefix(user_id, project_id)
    rows = client.table('projects').select('id,user_id').eq('id', project_id).execute().data
    if rows is None:
        raise RuntimeError('Could not verify project ownership')
    if not rows:
        return
    if len(rows) != 1 or rows[0]['user_id'] != user_id:
        raise PermissionError('Project is not owned by this user')
    # The clips bucket policy deliberately denies direct authenticated access.
    from supabase_folder.supabase_client import supabase as storage_client
    bucket = storage_client.storage.from_('clips')
    paths = set(list_project_objects(bucket, user_id, project_id))
    paths.update(validate_project_path(path, user_id, project_id) for path in attempted_paths)
    paths = sorted(paths)
    for offset in range(0, len(paths), 100):
        bucket.remove(paths[offset:offset + 100])
    if list_project_objects(bucket, user_id, project_id):
        raise RuntimeError('Some project Storage objects remain')
    client.table('projects').delete().eq('id', project_id).eq('user_id', user_id).execute()
    remaining = client.table('projects').select('id').eq('id', project_id).eq('user_id', user_id).execute().data
    if remaining is None or remaining:
        raise RuntimeError('Project metadata deletion was not confirmed')

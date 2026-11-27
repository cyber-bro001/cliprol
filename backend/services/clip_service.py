"""Database operations for generated clip metadata."""


def get_project_clips(project_id: str, *, client):
    response = (client.table("clips").select("id,project_id,clip_url,start_time,end_time,reason")
                .eq("project_id", project_id).order("created_at").execute())
    if response.data is None:
        raise RuntimeError("Unable to retrieve project clips")
    return response.data


def persist_clip(project_id: str, storage_path: str, start_time: int, end_time: int, reason: str, *, client):
    response = client.table("clips").insert({
        "project_id": project_id,
        "clip_url": storage_path,
        "start_time": start_time,
        "end_time": end_time,
        "reason": reason,
    }).execute()
    if not response.data or len(response.data) != 1:
        raise RuntimeError("Clip metadata persistence was not confirmed")
    return response.data[0]

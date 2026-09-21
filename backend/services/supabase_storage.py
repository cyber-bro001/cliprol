def upload_clip(file_path: str, storage_path: str):
    from supabase_folder.supabase_client import supabase

    with open(file_path, "rb") as file:
        result = supabase.storage.from_("clips").upload(
            storage_path,
            file,
            {"content-type": "video/mp4"}
        )

    return result

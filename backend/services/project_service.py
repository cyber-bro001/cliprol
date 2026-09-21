"""Project authorization and future project database operations."""

def get_authorized_project_user(access_token: str, project_id: str):
    """Return the authenticated owner after verifying access to a project."""
    from supabase_folder.supabase_client import get_user_from_token, supabase

    user = get_user_from_token(access_token)
    project = (
        supabase
        .from_("projects")
        .select("id")
        .eq("id", project_id)
        .eq("user_id", user.id)
        .single()
        .execute()
    )

    if not project.data:
        raise ValueError("Project not found or unauthorized")

    return user

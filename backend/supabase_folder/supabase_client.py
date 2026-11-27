import os
from supabase import Client, create_client
from supabase_auth.errors import AuthInvalidCredentialsError
from dotenv import load_dotenv

load_dotenv()

SUPABASE_URL: str = os.getenv("SUPABASE_URL")
SUPABASE_SERVICE_ROLE_KEY: str = os.getenv("SUPABASE_SERVICE_ROLE_KEY")
SUPABASE_PUBLISHABLE_KEY: str = os.getenv("SUPABASE_PUBLISHABLE_KEY") or SUPABASE_SERVICE_ROLE_KEY

supabase: Client = create_client(
    SUPABASE_URL,
    SUPABASE_SERVICE_ROLE_KEY
)


def create_user_client(access_token: str) -> Client:
    """Create a request-local client whose database and Storage calls use this user JWT."""
    client = create_client(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY)
    # PostgREST and Storage share this request-local headers mapping. Do not
    # mutate the module-level client: requests can run concurrently.
    client.options.headers["Authorization"] = f"Bearer {access_token}"
    return client


def get_user_from_token(access_token: str):
    response = supabase.auth.get_user(access_token)

    if not response.user:
        raise AuthInvalidCredentialsError("Invalid authentication token")

    return response.user

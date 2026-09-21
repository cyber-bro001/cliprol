import os
from supabase import Client, create_client
from dotenv import load_dotenv

load_dotenv()

SUPABASE_URL: str = os.getenv("SUPABASE_URL")
SUPABASE_SERVICE_ROLE_KEY: str = os.getenv("SUPABASE_SERVICE_ROLE_KEY")

supabase: Client = create_client(
    SUPABASE_URL,
    SUPABASE_SERVICE_ROLE_KEY
)


def get_user_from_token(access_token: str):
    response = supabase.auth.get_user(access_token)

    if not response.user:
        raise Exception("Invalid authentication token")

    return response.user


print("Supabase client initialized:", supabase is not None)

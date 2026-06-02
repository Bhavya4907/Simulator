from supabase import create_client, Client
from dotenv import load_dotenv
import os

load_dotenv()

url = os.getenv("SUPABASE_URL")
key = os.getenv("SUPABASE_KEY")

if not url or not key:
    raise RuntimeError(
        "Missing Supabase credentials. "
        "Make sure SUPABASE_URL and SUPABASE_KEY are set in your .env file."
    )

supabase: Client = create_client(url, key)
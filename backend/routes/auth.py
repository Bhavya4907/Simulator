from fastapi import APIRouter, HTTPException
from database.supabase import supabase
from middleware.auth import create_access_token
from models.user import RegisterRequest, LoginRequest, TokenResponse

router = APIRouter(prefix="/auth", tags=["Auth"])


@router.post("/register", response_model=TokenResponse)
def register(request: RegisterRequest):
    """
    Creates a new user account via Supabase Auth,
    then stores additional profile info in a 'profiles' table.
    """
    try:
        # Create user in Supabase Auth
        auth_response = supabase.auth.sign_up({
            "email": request.email,
            "password": request.password,
        })
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Auth error: {str(e)}")

    if not auth_response.user:
        raise HTTPException(
            status_code=400,
            detail="Registration failed. Email may already be in use."
        )

    user_id = auth_response.user.id

    # Save username to profiles table
    # Make sure you have a `profiles` table in Supabase:
    # id (uuid, FK to auth.users), username (text), created_at (timestamptz)
    try:
        supabase.table("profiles").insert({
            "id": user_id,
            "username": request.username,
        }).execute()
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to save profile: {str(e)}")

    token = create_access_token(user_id=user_id, username=request.username)

    return TokenResponse(
        access_token=token,
        user_id=user_id,
        username=request.username,
    )


@router.post("/login", response_model=TokenResponse)
def login(request: LoginRequest):
    """
    Authenticates an existing user and returns a JWT token.
    """
    try:
        auth_response = supabase.auth.sign_in_with_password({
            "email": request.email,
            "password": request.password,
        })
    except Exception as e:
        raise HTTPException(
            status_code=401,
            detail="Invalid email or password"
        )

    if not auth_response.user:
        raise HTTPException(status_code=401, detail="Invalid email or password")

    user_id = auth_response.user.id

    # Fetch username from profiles
    try:
        profile = (
            supabase.table("profiles")
            .select("username")
            .eq("id", user_id)
            .execute()
        )
        username = profile.data[0]["username"] if profile.data else "user"
    except Exception:
        username = "user"

    token = create_access_token(user_id=user_id, username=username)

    return TokenResponse(
        access_token=token,
        user_id=user_id,
        username=username,
    )
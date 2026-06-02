from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from jose import JWTError, jwt
from datetime import datetime, timedelta, timezone
from dotenv import load_dotenv
import os

load_dotenv()

SECRET_KEY = os.getenv("JWT_SECRET_KEY")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 24 * 7  # 7 days

if not SECRET_KEY:
    raise RuntimeError(
        "Missing JWT_SECRET_KEY in .env. "
        "Generate one with: python -c \"import secrets; print(secrets.token_hex(32))\""
    )

bearer_scheme = HTTPBearer()


def create_access_token(user_id: str, username: str) -> str:
    """Creates a signed JWT token for a given user."""
    expire = datetime.now(timezone.utc) + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    payload = {
        "sub": user_id,
        "username": username,
        "exp": expire,
    }
    return jwt.encode(payload, SECRET_KEY, algorithm=ALGORITHM)


def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(bearer_scheme),
) -> dict:
    """
    Dependency — inject into any route to require authentication.

    Usage:
        @router.get("/protected")
        def protected(user=Depends(get_current_user)):
            return {"user_id": user["user_id"]}
    """
    token = credentials.credentials

    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Invalid or expired token",
        headers={"WWW-Authenticate": "Bearer"},
    )

    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id: str = payload.get("sub")
        username: str = payload.get("username")

        if not user_id:
            raise credentials_exception

        return {"user_id": user_id, "username": username}

    except JWTError:
        raise credentials_exception
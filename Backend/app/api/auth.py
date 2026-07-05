"""
app/api/auth.py
--------------
Authentication using Clerk JWTs verified via Clerk's JWKS endpoint.
- The frontend sends Clerk's JWT as the Bearer token.
- The backend fetches Clerk's public keys and verifies the token.
- User is looked up (or created) in Neon DB by clerk_id.
- No localStorage or custom HS256 tokens needed.
"""
from datetime import datetime, timedelta
from typing import Optional
import os
import httpx

from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from jose import JWTError, jwt

from app.db import crud, schemas, database, models

router = APIRouter()

# --- Clerk JWT Setup ---
CLERK_PUBLISHABLE_KEY = os.getenv("CLERK_PUBLISHABLE_KEY", "")
CLERK_SECRET_KEY      = os.getenv("CLERK_SECRET_KEY", "")

# Derive the JWKS URL from the publishable key's frontend API URL
# pk_test_ZW1lcmdpbmctbGVlY2gtNC5jbGVyay5hY2NvdW50cy5kZXYk ->
# "emerging-leech-4.clerk.accounts.dev" -> https://emerging-leech-4.clerk.accounts.dev/.well-known/jwks.json
def _get_clerk_jwks_url() -> str:
    """Decode the domain from the Clerk publishable key."""
    try:
        import base64
        # Strip the 'pk_test_' or 'pk_live_' prefix
        b64_part = CLERK_PUBLISHABLE_KEY.split("_", 2)[-1]
        # Add padding if needed
        padded = b64_part + "=" * (-len(b64_part) % 4)
        domain = base64.b64decode(padded).decode("utf-8").rstrip("$")
        return f"https://{domain}/.well-known/jwks.json"
    except Exception:
        # Fallback JWKS url
        return "https://clerk.dev/.well-known/jwks.json"

_jwks_cache: Optional[dict] = None

def _get_clerk_public_keys():
    """Fetch and cache Clerk's JWKS public keys."""
    global _jwks_cache
    if _jwks_cache:
        return _jwks_cache
    jwks_url = _get_clerk_jwks_url()
    try:
        resp = httpx.get(jwks_url, timeout=5.0)
        resp.raise_for_status()
        _jwks_cache = resp.json()
        return _jwks_cache
    except Exception as e:
        raise HTTPException(
            status_code=503,
            detail=f"Could not fetch Clerk JWKS keys: {e}"
        )

# Keep oauth2_scheme for FastAPI's dependency injection / Swagger UI
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/auth/login")


def _verify_clerk_token(token: str) -> dict:
    """Verify a Clerk JWT and return the decoded payload."""
    jwks = _get_clerk_public_keys()
    # Get the unverified header to find the key ID
    try:
        header = jwt.get_unverified_header(token)
    except JWTError as e:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail=f"Invalid token header: {e}")

    kid = header.get("kid")
    # Find the matching key in JWKS
    key = None
    for k in jwks.get("keys", []):
        if k.get("kid") == kid:
            key = k
            break

    if key is None:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="JWT key ID not found in Clerk JWKS")

    try:
        payload = jwt.decode(token, key, algorithms=["RS256"], options={"verify_aud": False})
        return payload
    except JWTError as e:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail=f"Token validation failed: {e}")


async def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(database.get_db)):
    """
    Authenticate by validating a Clerk JWT.
    Extracts clerk_id from 'sub', looks up or auto-creates user in Neon DB.
    """
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = _verify_clerk_token(token)
        clerk_id: str = payload.get("sub")
        email_payload = payload.get("email", None)
        if clerk_id is None:
            raise credentials_exception
    except HTTPException:
        raise credentials_exception

    # Look up user in Neon DB by clerk_id
    user = crud.get_user_by_clerk_id(db, clerk_id=clerk_id)
    if user is None:
        # Auto-sync: create the user from the Clerk token payload
        email_addr = email_payload
        if not email_addr:
            # Clerk puts emails under email_addresses, but sub is clerk_id
            # We'll create a placeholder and let the full sync update it
            raise credentials_exception
        new_user = schemas.UserSync(
            clerk_id=clerk_id,
            email=email_addr,
            full_name=payload.get("name", "User"),
        )
        user = crud.sync_clerk_user(db=db, clerk_user=new_user)

    if user is None:
        raise credentials_exception
    return user


# --- Legacy Endpoints (kept for backward compatibility) ---

@router.post("/register", response_model=schemas.UserResponse)
def register_user(user: schemas.UserCreate, db: Session = Depends(database.get_db)):
    db_user = crud.get_user_by_email(db, email=user.email)
    if db_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    return crud.create_user(db=db, user=user)


@router.post("/sync", response_model=schemas.UserResponse)
def sync_user(clerk_user: schemas.UserSync, db: Session = Depends(database.get_db)):
    """Sync Clerk user info to Neon DB. Returns UserResponse (no token needed anymore)."""
    return crud.sync_clerk_user(db=db, clerk_user=clerk_user)


@router.get("/me", response_model=schemas.UserResponse)
def read_users_me(current_user: models.User = Depends(get_current_user)):
    return current_user

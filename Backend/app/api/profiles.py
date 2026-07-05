from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List

from app.db import crud, schemas, database, models
from app.api.auth import get_current_user

router = APIRouter()

@router.get("/profiles", response_model=List[schemas.ProfileResponse])
def read_profiles(
    db: Session = Depends(database.get_db),
    current_user: models.User = Depends(get_current_user)
):
    """
    Returns all health profiles for the current user.
    """
    return crud.get_user_profiles(db, user_id=current_user.id)

@router.post("/profiles", response_model=schemas.ProfileResponse)
def create_profile(
    profile: schemas.ProfileCreate,
    db: Session = Depends(database.get_db),
    current_user: models.User = Depends(get_current_user)
):
    """
    Creates a new health profile for a family member.
    """
    return crud.create_profile(db=db, profile=profile, user_id=current_user.id)

@router.delete("/profiles/{profile_id}")
def delete_profile(
    profile_id: int,
    db: Session = Depends(database.get_db),
    current_user: models.User = Depends(get_current_user)
):
    """
    Deletes a health profile.
    """
    profile = crud.delete_profile(db=db, profile_id=profile_id, user_id=current_user.id)
    if not profile:
        raise HTTPException(status_code=404, detail="Profile not found or not authorized")
    return {"detail": "Profile deleted successfully"}

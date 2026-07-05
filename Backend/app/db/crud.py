from sqlalchemy.orm import Session
from passlib.context import CryptContext
from . import models, schemas
import json

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def get_password_hash(password: str) -> str:
    return pwd_context.hash(password)

def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)

# --- Users ---
def get_user_by_email(db: Session, email: str):
    return db.query(models.User).filter(models.User.email == email).first()

def get_user_by_clerk_id(db: Session, clerk_id: str):
    return db.query(models.User).filter(models.User.clerk_id == clerk_id).first()

def create_user(db: Session, user: schemas.UserCreate):
    hashed_password = get_password_hash(user.password) if user.password else None
    db_user = models.User(
        email=user.email,
        clerk_id=user.clerk_id,
        password_hash=hashed_password,
        full_name=user.full_name
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user

def sync_clerk_user(db: Session, clerk_user: schemas.UserSync):
    db_user = get_user_by_clerk_id(db, clerk_user.clerk_id)
    if db_user:
        # Update existing user if email changed or name updated
        db_user.email = clerk_user.email
        db_user.full_name = clerk_user.full_name
        db.commit()
        db.refresh(db_user)
        return db_user
    
    # Check if user exists by email but not linked to clerk_id
    db_user = get_user_by_email(db, clerk_user.email)
    if db_user:
        db_user.clerk_id = clerk_user.clerk_id
        db_user.full_name = clerk_user.full_name
        db.commit()
        db.refresh(db_user)
        return db_user
    
    # Create new user
    db_user = models.User(
        email=clerk_user.email,
        clerk_id=clerk_user.clerk_id,
        full_name=clerk_user.full_name,
        password_hash=None
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user

# --- Profiles ---
def get_user_profiles(db: Session, user_id: int):
    profiles = db.query(models.Profile).filter(models.Profile.user_id == user_id).all()
    # Add report count for each profile (serialized as report_count)
    for p in profiles:
        p.report_count = {"reports": db.query(models.Report).filter(models.Report.profile_id == p.id).count()}
    return profiles

def create_profile(db: Session, profile: schemas.ProfileCreate, user_id: int):
    db_profile = models.Profile(**profile.model_dump(), user_id=user_id)
    db.add(db_profile)
    db.commit()
    db.refresh(db_profile)
    return db_profile

def delete_profile(db: Session, profile_id: int, user_id: int):
    db_profile = db.query(models.Profile).filter(models.Profile.id == profile_id, models.Profile.user_id == user_id).first()
    if db_profile:
        db.delete(db_profile)
        db.commit()
    return db_profile

# --- Reports ---
def create_report(db: Session, report: schemas.ReportCreate, user_id: int):
    db_report = models.Report(**report.model_dump(), user_id=user_id)
    db.add(db_report)
    db.commit()
    db.refresh(db_report)
    return db_report

def get_user_reports(db: Session, user_id: int):
    return db.query(models.Report).filter(models.Report.user_id == user_id).order_by(models.Report.created_at.desc()).all()

# --- Metrics ---
def create_report_metrics(db: Session, report_id: int, metrics: list[schemas.MetricBase]):
    db_metrics = [models.Metric(**metric.dict(), report_id=report_id) for metric in metrics]
    db.add_all(db_metrics)
    db.commit()
    return db_metrics

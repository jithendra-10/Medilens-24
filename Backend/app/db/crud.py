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

def create_user(db: Session, user: schemas.UserCreate):
    hashed_password = get_password_hash(user.password)
    db_user = models.User(
        email=user.email,
        password_hash=hashed_password,
        full_name=user.full_name
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user

# --- Reports ---
def create_report(db: Session, report: schemas.ReportCreate, user_id: int):
    db_report = models.Report(**report.dict(), user_id=user_id)
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

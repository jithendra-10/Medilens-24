from sqlalchemy import Column, Integer, String, Float, ForeignKey, DateTime
from sqlalchemy.orm import relationship
from datetime import datetime
from .database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    clerk_id = Column(String, unique=True, index=True, nullable=True)
    email = Column(String, unique=True, index=True, nullable=False)
    password_hash = Column(String, nullable=True)
    full_name = Column(String)
    created_at = Column(DateTime, default=datetime.utcnow)

    reports = relationship("Report", back_populates="owner")
    profiles = relationship("Profile", back_populates="owner")

class Profile(Base):
    __tablename__ = "profiles"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    name = Column(String)
    age = Column(Integer, nullable=True)
    gender = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    owner = relationship("User", back_populates="profiles")
    reports = relationship("Report", back_populates="profile")

class Report(Base):
    __tablename__ = "reports"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), index=True)
    profile_id = Column(Integer, ForeignKey("profiles.id"), nullable=True, index=True)
    type = Column(String) # E.g., "Lipid Panel", "Complete Blood Count"
    date = Column(DateTime, default=datetime.utcnow)
    status = Column(String, default="Analyzed") # E.g., "Analyzed", "Archived"
    risk = Column(String, default="Stable") # E.g., "Stable", "Mild Concern", "High Risk"
    pdf_file_path = Column(String, nullable=True) # Optional storage path
    structured_data_json = Column(String, nullable=True) # Serialized JSON of the full analysis
    created_at = Column(DateTime, default=datetime.utcnow)

    owner = relationship("User", back_populates="reports")
    profile = relationship("Profile", back_populates="reports")
    metrics = relationship("Metric", back_populates="report", cascade="all, delete-orphan")

class Metric(Base):
    __tablename__ = "metrics"

    id = Column(Integer, primary_key=True, index=True)
    report_id = Column(Integer, ForeignKey("reports.id"))
    name = Column(String, index=True)
    value = Column(Float, nullable=True)
    unit = Column(String, nullable=True)
    ref_range = Column(String, nullable=True)
    status = Column(String, default="Normal") # "Normal", "High", "Low"
    trend = Column(String, default="stable") # "up", "down", "stable"
    percent_change = Column(Float, nullable=True)

    report = relationship("Report", back_populates="metrics")

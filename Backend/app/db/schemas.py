from pydantic import BaseModel, EmailStr
from typing import List, Optional
from datetime import datetime

# --- Token ---
class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    email: Optional[str] = None

# --- User ---
class UserBase(BaseModel):
    email: EmailStr
    full_name: Optional[str] = None

class UserCreate(UserBase):
    password: str

class UserResponse(UserBase):
    id: int
    created_at: datetime

    class Config:
        orm_mode = True

# --- Metric ---
class MetricBase(BaseModel):
    name: str
    value: Optional[float] = None
    unit: Optional[str] = None
    ref_range: Optional[str] = None
    status: Optional[str] = "Normal"
    trend: Optional[str] = "stable"
    percent_change: Optional[float] = None

class MetricResponse(MetricBase):
    id: int
    report_id: int

    class Config:
        orm_mode = True

# --- Report ---
class ReportBase(BaseModel):
    type: str
    status: Optional[str] = "Analyzed"
    risk: Optional[str] = "Stable"
    pdf_file_path: Optional[str] = None
    structured_data_json: Optional[str] = None

class ReportCreate(ReportBase):
    pass

class ReportResponse(ReportBase):
    id: int
    user_id: int
    date: datetime
    created_at: datetime
    metrics: List[MetricResponse] = []

    class Config:
        orm_mode = True

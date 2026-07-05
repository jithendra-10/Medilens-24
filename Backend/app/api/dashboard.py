from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Optional

from app.db import crud, schemas, database, models
from app.api.auth import get_current_user

router = APIRouter()

@router.get("/metrics", response_model=List[schemas.MetricResponse])
def get_dashboard_metrics(
    db: Session = Depends(database.get_db),
    current_user: models.User = Depends(get_current_user)
):
    """
    Returns all recent metrics for the dashboard view.
    Currently grabbing the most recent report's metrics.
    """
    reports = crud.get_user_reports(db, user_id=current_user.id)
    if not reports:
        return []
    
    latest_report = reports[0]
    return latest_report.metrics

@router.get("/reports", response_model=List[schemas.ReportResponse])
def get_user_reports_list(
    db: Session = Depends(database.get_db),
    current_user: models.User = Depends(get_current_user),
    profileId: Optional[str] = Query(None),
):
    """
    Returns reports for the current user.
    Optionally filter by profileId (family member profile) via ?profileId=xxx.
    """
    reports = crud.get_user_reports(db, user_id=current_user.id)
    if profileId:
        filtered = [r for r in reports if str(getattr(r, "profile_id", None)) == str(profileId)]
        # Fallback: return all if profile_id column not populated
        return filtered if filtered else []
    return reports

@router.patch("/reports/{report_id}")
def update_report_profile(
    report_id: int,
    profile_id: Optional[int] = Query(None),
    db: Session = Depends(database.get_db),
    current_user: models.User = Depends(get_current_user),
):
    """
    Updates the profile association for a specific report.
    """
    report = db.query(models.Report).filter(models.Report.id == report_id, models.Report.user_id == current_user.id).first()
    if not report:
        raise HTTPException(status_code=404, detail="Report not found or not authorized")
    
    report.profile_id = profile_id
    db.commit()
    db.refresh(report)
    return {"detail": "Report successfully linked to profile", "report_id": report_id}

@router.delete("/reports/{report_id}")
def delete_report(
    report_id: int,
    db: Session = Depends(database.get_db),
    current_user: models.User = Depends(get_current_user)
):
    """
    Deletes a specific report owned by the user.
    """
    report = db.query(models.Report).filter(models.Report.id == report_id, models.Report.user_id == current_user.id).first()
    if not report:
        raise HTTPException(status_code=404, detail="Report not found or not authorized to delete")
    
    db.delete(report)
    db.commit()
    return {"detail": "Report deleted successfully"}

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

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
    current_user: models.User = Depends(get_current_user)
):
    """
    """
    return crud.get_user_reports(db, user_id=current_user.id)

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

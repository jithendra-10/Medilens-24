"""
app/api/upload.py  (v2 — dynamic LLM extraction + range analysis)
------------------------------------------------------------------
POST /api/upload — Full dynamic pipeline:
  1. Extract text from PDF
  2. LLM structures patient_info + panels
  3. Dynamic range analysis → highlight_map + risk

Returns structured_data suitable for both the dashboard and
the existing flat-tests analytics pipeline.
"""
from fastapi import APIRouter, UploadFile, File, HTTPException, Depends, Query
from sqlalchemy.orm import Session
from typing import Optional, List
import json

from app.db import crud, schemas, database, models
from app.api.auth import get_current_user

from app.services.pdf_parser       import parse_lab_pdf
from app.services.dynamic_analyzer import analyze_panels

router = APIRouter()


@router.post("/upload")
async def upload_reports(
    current_report:  UploadFile          = File(...),
    previous_report: Optional[UploadFile] = File(None),
    profileId:       Optional[str]        = Query(None),
    db: Session = Depends(database.get_db),
    current_user: models.User = Depends(get_current_user)
):
    """
    Upload 1 or 2 PDF lab reports.
    Saves the full structured results (including dynamic analysis & trends)
    into structured_data_json for on-the-fly PDF generation.
    """
    result = {
        "tests":            {},
        "patient_info":     {},
        "panels":           [],
        "dynamic_analysis": {},
        "trend":            None,
        "parse_warnings":   [],
    }

    # 1. Parse Current Report
    try:
        current_bytes = await current_report.read()
        tests_flat, structured, warnings = parse_lab_pdf(current_bytes)
        result["tests"] = tests_flat
        result["patient_info"] = structured.get("patient_info", {})
        result["panels"] = structured.get("panels", [])
        result["parse_warnings"].extend(warnings)

        if result["panels"]:
            result["dynamic_analysis"] = analyze_panels(result["panels"])

    except Exception as e:
        raise HTTPException(status_code=422, detail=f"Failed to process current report: {str(e)}")

    # 2. Parse Previous Report & Calculate Trend
    if previous_report:
        try:
            prev_bytes = await previous_report.read()
            prev_tests, _, prev_warnings = parse_lab_pdf(prev_bytes)
            result["parse_warnings"].extend([f"[Previous] {w}" for w in prev_warnings])
            
            trends = []
            for test_name, curr_data in tests_flat.items():
                if test_name in prev_tests:
                    prev_data = prev_tests[test_name]
                    try:
                        c_val, p_val = curr_data.get("value"), prev_data.get("value")
                        if c_val is not None and p_val is not None:
                            c_num, p_num = float(c_val), float(p_val)
                            diff = c_num - p_num
                            pct = round((diff / p_num) * 100, 1) if p_num != 0 else 0
                        else: pct = None
                    except (ValueError, TypeError): pct = None

                    trends.append({
                        "test": test_name,
                        "current_value": curr_data.get("value"),
                        "previous_value": prev_data.get("value"),
                        "unit": curr_data.get("unit"),
                        "change_pct": pct,
                        "assessment": "Improved" if pct and pct < 0 else "Worsened" if pct and pct > 0 else "Stable"
                    })
            if trends:
                improved_count = sum(1 for t in trends if t["assessment"] == "Improved")
                worsened_count = sum(1 for t in trends if t["assessment"] == "Worsened")
                
                summary = "Your health markers are generally stable."
                if improved_count > worsened_count:
                    summary = f"Your health markers are showing positive progress, with {improved_count} parameters improving compared to your last report."
                elif worsened_count > improved_count:
                    summary = f"We noticed {worsened_count} parameters have worsened since your last report. We recommend discussing these specific trends with your doctor."
                elif improved_count > 0:
                    summary = "Your health markers show a mix of improvements and some areas needing attention. Overall, progress is steady."
                
                result["trend"] = {
                    "trends": trends,
                    "summary": summary
                }
        except Exception as e:
            result["parse_warnings"].append(f"Failed to process previous report: {str(e)}")

    # 3. Determine Risk & Title
    report_title = "Lab Report"
    if result["patient_info"] and "Report Title" in result["patient_info"]:
        report_title = result["patient_info"]["Report Title"]

    risk = "Stable"
    abnormal_count = sum(1 for data in result["tests"].values() if data.get("status") in ("High", "Low", "CRITICAL", "BORDERLINE"))
    if abnormal_count > 3: risk = "High Risk"
    elif abnormal_count > 0: risk = "Mild Concern"

    # 4. Save to Database (Full Analysis JSON + Profile Link)
    try:
        db_report = crud.create_report(
            db=db,
            report=schemas.ReportCreate(
                type=report_title,
                status="Analyzed",
                risk=risk,
                profile_id=int(profileId) if profileId and profileId.isdigit() else None,
                structured_data_json=json.dumps(result) # SAVE THE WHOLE RESULT!
            ),
            user_id=current_user.id
        )

        # Save individual metrics for legacy dashboard views if needed
        metrics_to_create = []
        for name, data in result["tests"].items():
            metrics_to_create.append(schemas.MetricBase(
                name=name,
                value=float(data.get("value")) if data.get("value") and str(data.get("value")).replace('.','',1).isdigit() else None,
                unit=data.get("unit"),
                ref_range=data.get("reference_range"),
                status=data.get("status", "Normal")
            ))
        crud.create_report_metrics(db=db, report_id=db_report.id, metrics=metrics_to_create)
        result["report_id"] = db_report.id

    except Exception as e:
        db.rollback()
        print(f"DB Error during upload: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to save report to database: {str(e)}")

    return result

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
from fastapi import APIRouter, UploadFile, File, HTTPException, Depends
from sqlalchemy.orm import Session
from typing import Optional
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
    db: Session = Depends(database.get_db),
    current_user: models.User = Depends(get_current_user)
):
    """
    Upload 1 or 2 PDF lab reports.
    Returns:
      - tests (flat dict for analytics pipeline)
      - structured_data (patient_info + panels)
      - dynamic_analysis (range analysis + highlight_map)
      - previous (same structure for prev report, or null)
      - parse_warnings
    """
    result = {
        "tests":            {},
        "structured_data":  {"patient_info": {}, "panels": []},
        "dynamic_analysis": {},
        "previous":         None,
        "parse_warnings":   [],
    }

    # ── Current Report ──────────────────────────────────────────────────────
    try:
        current_bytes = await current_report.read()
        tests_flat, structured, warnings = parse_lab_pdf(current_bytes)
        result["tests"]           = tests_flat
        result["structured_data"] = structured
        result["parse_warnings"].extend(warnings)

        # Dynamic range analysis (STEP 2)
        if structured.get("panels"):
            result["dynamic_analysis"] = analyze_panels(structured["panels"])

        # Determine report type and risk based on extraction
        report_title = "Lab Report"
        if structured.get("patient_info") and "Report Title" in structured["patient_info"]:
             report_title = structured["patient_info"]["Report Title"]

        # Calculate a rough risk based on status abnormalities (mocking the LLM outcome for DB state)
        risk = "Stable"
        abnormal_count = sum(1 for data in tests_flat.values() if data.get("status") in ("High", "Low"))
        if abnormal_count > 3: risk = "High Risk"
        elif abnormal_count > 0: risk = "Mild Concern"

        # Save the Report to the Database
        db_report = crud.create_report(
            db=db,
            report=schemas.ReportCreate(
                type=report_title,
                status="Analyzed",
                risk=risk,
                structured_data_json=json.dumps(structured)
            ),
            user_id=current_user.id
        )

        # Build Metric objects
        metrics_to_create = []
        for name, data in tests_flat.items():
            metrics_to_create.append(schemas.MetricBase(
                name=name,
                value=float(data.get("value")) if data.get("value") and str(data.get("value")).replace('.','',1).isdigit() else None,
                unit=data.get("unit"),
                ref_range=data.get("reference_range"),
                status=data.get("status", "Normal")
            ))
        
        crud.create_report_metrics(db=db, report_id=db_report.id, metrics=metrics_to_create)

    except Exception as e:
        raise HTTPException(status_code=422, detail=f"Failed to process current report: {str(e)}")

    # ── Previous Report (optional) ──────────────────────────────────────────
    if previous_report:
        try:
            prev_bytes = await previous_report.read()
            prev_tests, prev_structured, prev_warnings = parse_lab_pdf(prev_bytes)
            result["previous"] = {
                "tests":           prev_tests,
                "structured_data": prev_structured,
            }
            result["parse_warnings"].extend([f"[Previous] {w}" for w in prev_warnings])
            
            # Calculate Trend
            trends = []
            for test_name, curr_data in tests_flat.items():
                if test_name in prev_tests:
                    prev_data = prev_tests[test_name]
                    try:
                        c_val = curr_data.get("value")
                        p_val = prev_data.get("value")
                        if c_val is not None and p_val is not None:
                            c_num = float(c_val)
                            p_num = float(p_val)
                            diff = c_num - p_num
                            pct = round((diff / p_num) * 100, 1) if p_num != 0 else 0
                        else:
                            pct = None
                    except (ValueError, TypeError):
                        pct = None

                    trends.append({
                        "test": test_name,
                        "current_value": curr_data.get("value"),
                        "previous_value": prev_data.get("value"),
                        "unit": curr_data.get("unit"),
                        "change_pct": pct,
                        "current_status": curr_data.get("status", "Unknown") # Fallback to Status if mapped, else Unknown
                    })
            if trends:
                result["trend"] = {"trends": trends}
                
        except Exception as e:
            result["parse_warnings"].append(f"Could not process previous report: {e}")

    return result

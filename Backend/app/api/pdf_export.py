"""
app/api/pdf_export.py
---------------------
POST /api/generate-pdf — Generate a formatted PDF health report.
"""
from fastapi import APIRouter, HTTPException
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from typing import Optional
import io

from app.services.pdf_generator import generate_health_pdf
from rag_engine.explanation_engine import generate_report_explanation

router = APIRouter()


class PDFRequest(BaseModel):
    patient_age: int
    patient_gender: str
    tests: dict
    analytics: dict
    alert: dict
    confidence: dict
    explanation: str
    priority_list: Optional[list] = None
    trend: Optional[dict] = None
    language: str = "English"
    mode: str = "patient"


@router.post("/generate-pdf")
async def generate_pdf(req: PDFRequest):
    """Generate and return a downloadable PDF health report."""
    try:
        data = req.model_dump()
        
        # If explanation is missing or just the fallback, properly invoke the LLM RAG engine here
        if not data.get("explanation") or data["explanation"] == "Analysis completed." or "Lab-flagged" in data["explanation"]:
            overall_risk = data.get("alert", {}).get("overall_risk", "Moderate")
            
            # Format trend data as previous_tests if needed by the engine to write the comparison
            prev_tests = None
            if data.get("trend") and data["trend"].get("trends"):
                prev_tests = {}
                for t in data["trend"]["trends"]:
                    prev_tests[t["test"]] = {"value": t["previous_value"], "unit": t["unit"]}
                    
            explanation_result = generate_report_explanation(
                patient_age=data["patient_age"],
                patient_gender=data["patient_gender"],
                tests=data["tests"],
                overall_risk_level=overall_risk,
                mode=data["mode"],
                language=data["language"],
                previous_tests=prev_tests
            )
            data["explanation"] = explanation_result.get("explanation", "")
            
        pdf_bytes = generate_health_pdf(data)
        return StreamingResponse(
            io.BytesIO(pdf_bytes),
            media_type="application/pdf",
            headers={"Content-Disposition": "attachment; filename=MediLens_Health_Report.pdf"},
        )
    except Exception as e:
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"PDF generation error: {str(e)}")

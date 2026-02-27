"""
app/api/chat.py
---------------
POST /api/chat — Interactive Q&A about an uploaded report.

The endpoint receives:
  - user question
  - report context (tests, analytics, alert, explanation)

It replies using a constrained interactive agent prompt grounded
in the report data only. No hallucination. No diagnosis.
"""
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional
from rag_engine.grok_client import call_grok

router = APIRouter()


class ChatRequest(BaseModel):
    question: str
    tests: dict                         # structured lab results (flat)
    analytics: dict                     # deterministic analytics
    alert: dict                         # alert level + flags
    explanation: str = ""               # prior AI explanation (for context)
    language: str = "English"
    history: Optional[list[dict]] = []  # [{role, content}, ...] prior turns
    # Dynamic extraction fields (from PDF pipeline)
    patient_info: Optional[dict] = {}   # name, age, gender, lab, doctor
    panels: Optional[list] = []         # full panel structure with ref ranges
    dynamic_analysis: Optional[dict] = {}  # highlight_map, risk


SAFETY_KEYWORDS = [
    "diagnose", "diagnosis", "what disease", "which disease",
    "do i have", "what illness", "prescribe", "medication",
    "which medicine", "what drug", "dosage", "treatment plan",
    "cure", "surgery",
]

def _is_unsafe(query: str) -> bool:
    q = query.lower()
    return any(k in q for k in SAFETY_KEYWORDS)


def _build_chat_prompt(req: ChatRequest) -> str:
    # --- Patient info block ---
    patient_info = req.patient_info or {}
    pname  = patient_info.get("name") or ""
    pdoc   = patient_info.get("doctor") or ""
    plab   = patient_info.get("lab_name") or ""
    pdate  = patient_info.get("report_date") or ""
    patient_block = (
        f"  Patient : {pname}  |  Lab: {plab}  |  Date: {pdate}  |  Doctor: {pdoc}\n"
        if any([pname, plab, pdate, pdoc]) else ""
    )

    # --- Tests / panels block ---
    if req.panels:
        test_lines = []
        for panel in req.panels:
            test_lines.append(f"\n  [{panel.get('panel_name','General')}]")
            for t in panel.get("tests", []):
                ref   = t.get("reference_range") or "N/A"
                flag  = t.get("lab_flag") or ""
                flag_str = f" ← {flag}" if flag else ""
                test_lines.append(
                    f"    {t.get('parameter','?')}: {t.get('value','?')} "
                    f"{t.get('unit') or ''}  [Ref: {ref}]{flag_str}"
                )
        tests_str = "\n".join(test_lines)
    else:
        test_lines = []
        for name, d in req.tests.items():
            test_lines.append(
                f"  - {name}: {d.get('value')} {d.get('unit','')} [{d.get('status','Normal')}]"
            )
        tests_str = "\n".join(test_lines) or "  (no tests)"

    # --- Dynamic risk analysis ---
    dyn = req.dynamic_analysis or {}
    dyn_summary = dyn.get("analysis_summary", {})
    dyn_risk = dyn_summary.get("overall_risk", "")
    dyn_str  = (
        f"  Dynamic Risk: {dyn_risk}  |  "
        f"Abnormal: {dyn_summary.get('abnormal_count','?')}  |  "
        f"Critical: {dyn_summary.get('critical_count','?')}\n"
        if dyn_risk else ""
    )

    # Abnormal summary
    high = req.analytics.get("high_tests", [])
    low  = req.analytics.get("low_tests",  [])
    critical = req.alert.get("critical_tests", [])
    abnormal_lines = []
    for t in high:     abnormal_lines.append(f"  - {t}: HIGH")
    for t in low:      abnormal_lines.append(f"  - {t}: LOW")
    for t in critical: abnormal_lines.append(f"  - {t}: CRITICAL (threshold breach)")
    abnormal_str = "\n".join(abnormal_lines) or "  None"

    alert_level = req.alert.get("alert_level", "NORMAL")
    emergency   = req.alert.get("emergency_flag", False)
    lang        = req.language

    # History (last 4 turns max)
    history_str = ""
    if req.history:
        turns = req.history[-4:]
        history_str = "\n".join(
            f"{'User' if t['role']=='user' else 'Assistant'}: {t['content']}"
            for t in turns
        )
        history_str = f"\nCONVERSATION HISTORY (last turns):\n{history_str}\n"

    emergency_block = (
        "\n⚠️  EMERGENCY FLAG IS ACTIVE: At least one parameter has breached a critical threshold.\n"
        "MUST include in your reply: 'Immediate evaluation is strongly recommended. "
        "Delay may increase the risk of complications.'\n"
        if emergency else ""
    )

    lang_instruction = (
        f"\nIMPORTANT: Respond entirely in {lang}. All output must be in {lang}.\n"
        if lang != "English" else ""
    )

    return f"""You are an INTERACTIVE MEDICAL REPORT ASSISTANT operating in Q&A MODE.

STRICT RULES (NON-NEGOTIABLE):
1. You are NOT a doctor. You do NOT diagnose diseases.
2. You do NOT prescribe or suggest medications.
3. You ONLY answer using the report data provided below.
4. If the question is unrelated to the report, say: "Please ask questions related to your uploaded report."
5. If asked for diagnosis or medication, refuse politely and recommend professional consultation.
6. If unsure, clearly state uncertainty.
7. Keep answers SHORT, CLEAR, and CALM.
8. Always recommend professional consultation for HIGH or CRITICAL findings.
9. NEVER invent lab values not present below.
{emergency_block}{lang_instruction}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
PATIENT & REPORT INFORMATION
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
{patient_block}
PATIENT'S FULL LAB REPORT (with Reference Ranges)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
{tests_str}

{dyn_str}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
ABNORMAL PARAMETERS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
{abnormal_str}

OVERALL ALERT LEVEL: {alert_level}
EMERGENCY FLAG: {"YES — immediate care needed" if emergency else "No"}
{history_str}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
USER QUESTION: {req.question}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Answer the user's question concisely, grounded only in the report data above.
Do NOT add any medical claims beyond the data provided.
End with a consultation reminder if the answer involves abnormal values.
""".strip()


@router.post("/chat")
async def chat(req: ChatRequest):
    """Interactive Q&A about an uploaded report. Grounded, safe, no diagnosis."""
    if not req.question.strip():
        raise HTTPException(status_code=400, detail="Question cannot be empty.")

    # Safety check
    if _is_unsafe(req.question):
        return {
            "answer": (
                "I'm not able to provide a medical diagnosis, prescribe medications, or recommend "
                "specific treatments. This AI assistant provides informational support only. "
                "Please consult a licensed medical professional for personalized advice."
            ),
            "safe": False,
        }

    try:
        prompt = _build_chat_prompt(req)
        answer = call_grok(prompt)
        return {"answer": answer, "safe": True}
    except RuntimeError as e:
        raise HTTPException(status_code=503, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Chat error: {str(e)}")

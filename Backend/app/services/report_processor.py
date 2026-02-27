"""
app/services/report_processor.py
---------------------------------
Core processing service: PDF or Image → full structured analysis.

Pipeline:
  1. Extract text (PDF: pdfplumber) OR send to Groq Vision (image)
  2. LLM extracts patient_info + panels (dynamic, no hardcoding)
  3. Dynamic range analysis
  4. Per-test card explanations from LLM (structured JSON, NOT paragraphs)
  5. Return everything the dashboard needs
"""
import io, base64, json, re
from rag_engine.grok_client import call_grok
from app.services.dynamic_analyzer import analyze_panels

# ── Step 1: Text extraction ───────────────────────────────────────────────────

def _extract_pdf_text(pdf_bytes: bytes) -> str:
    import pdfplumber
    pages = []
    with pdfplumber.open(io.BytesIO(pdf_bytes)) as pdf:
        for i, page in enumerate(pdf.pages):
            text = page.extract_text()
            if text:
                pages.append(f"[PAGE {i+1}]\n{text}")
    return "\n\n".join(pages)


def _extract_image_text(image_bytes: bytes) -> str:
    """Send image to Groq Vision model for OCR + initial extraction."""
    b64 = base64.b64encode(image_bytes).decode("utf-8")

    from openai import OpenAI
    from dotenv import load_dotenv
    import os
    load_dotenv()

    client = OpenAI(
        api_key=os.getenv("GROQ_API_KEY"),
        base_url="https://api.groq.com/openai/v1",
    )

    response = client.chat.completions.create(
        model="llama-3.2-11b-vision-instruct",
        messages=[
            {
                "role": "user",
                "content": [
                    {
                        "type": "text",
                        "text": (
                            "This is a medical lab report image. "
                            "Please extract ALL text from this image exactly as written. "
                            "Include patient name, age, gender, date, lab name, "
                            "all test parameter names, values, units, reference ranges, "
                            "and any flags (H/L/Normal). "
                            "Preserve the exact format and spelling. "
                            "Output only the raw extracted text, no commentary."
                        ),
                    },
                    {
                        "type": "image_url",
                        "image_url": {"url": f"data:image/jpeg;base64,{b64}"},
                    },
                ],
            }
        ],
        temperature=0.1,
        max_tokens=4096,
    )
    return response.choices[0].message.content or ""


# ── Step 2: Dynamic structured extraction ────────────────────────────────────

EXTRACTION_PROMPT = """\
You are a Medical Report Extraction Engine.

Analyze the following lab report text and extract ALL structured information.

RULES:
- Do NOT skip any parameter.
- Preserve exact spelling from the report.
- If patient name/age/gender is not in the report, set to null.
- For each test: extract parameter name, value, unit, reference range, lab flag.
- Group tests into logical panels (CBC, Lipid Panel, Thyroid, etc.)
- If no clear panel grouping, use "General".

Return ONLY valid JSON (no markdown, no commentary):
{{
  "patient_info": {{
    "name": null,
    "age": null,
    "gender": null,
    "report_date": null,
    "lab_name": null,
    "doctor": null
  }},
  "panels": [
    {{
      "panel_name": "Panel Name",
      "tests": [
        {{
          "parameter": "exact name",
          "value": "measured value",
          "unit": "unit or null",
          "reference_range": "range or null",
          "lab_flag": "H/L/CRITICAL/null"
        }}
      ]
    }}
  ]
}}

REPORT TEXT:
---
{text}
---
"""

def _llm_extract(text: str) -> dict:
    truncated = text[:6000]
    prompt = EXTRACTION_PROMPT.format(text=truncated)
    raw = call_grok(prompt)

    # Strip markdown fences
    cleaned = re.sub(r"```(?:json)?", "", raw).replace("```", "").strip()
    try:
        return json.loads(cleaned)
    except Exception:
        m = re.search(r"\{[\s\S]*\}", cleaned)
        if m:
            return json.loads(m.group())
        return {"patient_info": {}, "panels": []}


# ── Step 3: Per-test card explanations ───────────────────────────────────────

CARD_PROMPT = """\
You are MediLens AI — a Medical Report Explanation Engine.

STRICT RULES (NON-NEGOTIABLE):
- Do NOT diagnose any disease or medical condition.
- Do NOT prescribe or suggest any medication.
- Explain what each parameter measures and what the result means.
- Use calm, responsible, supportive language.
- Keep each explanation to 1-2 sentences maximum per field.
- Never fabricate reference ranges not provided.

For each test below, generate structured explanation cards.

Return ONLY a valid JSON array (no markdown, no commentary):
[
  {{
    "parameter": "exact name from input",
    "one_liner": "What this blood test measures (1 simple sentence)",
    "what_this_means": "What this HIGH/LOW/NORMAL value means for the patient right now (1-2 sentences, calm)",
    "what_if_ignored": "General long-term implication if this remains unchecked (1 sentence, NOT a diagnosis)",
    "urgency": "normal | watch | consult | urgent"
  }}
]

TESTS TO EXPLAIN:
{tests_json}

OVERALL RISK: {risk}
DOMAIN CLUSTERS AFFECTED: {domains}

Remember: Only informational. No diagnosis. No medication.
"""

def _llm_card_explanations(detailed_analysis: list, risk: str, domain_clusters: dict) -> list:
    tests_for_prompt = []
    for d in detailed_analysis:
        if d["status"] in ("NON-NUMERIC", "REFERENCE NOT PROVIDED"):
            continue
        tests_for_prompt.append({
            "parameter":       d["parameter"],
            "value":           f"{d['value']} {d.get('unit','') or ''}".strip(),
            "status":          d["status"],
            "reference_range": d.get("reference_range") or "N/A",
            "reason":          d["reason"],
            "domain":          d.get("domain", "Other"),
        })

    if not tests_for_prompt:
        return []

    domains_str = ", ".join(domain_clusters.keys()) if domain_clusters else "None"

    prompt = CARD_PROMPT.format(
        tests_json=json.dumps(tests_for_prompt, indent=2),
        risk=risk,
        domains=domains_str,
    )

    try:
        raw = call_grok(prompt)
        cleaned = re.sub(r"```(?:json)?", "", raw).replace("```", "").strip()
        return json.loads(cleaned)
    except Exception:
        try:
            m = re.search(r"\[[\s\S]*\]", raw)
            if m: return json.loads(m.group())
        except: pass
        return []


# ── Step 4: Flatten panels → tests dict ──────────────────────────────────────

def _flatten_tests(panels: list) -> dict:
    tests = {}
    for panel in panels:
        for t in panel.get("tests", []):
            name = (t.get("parameter") or "").strip()
            raw_v = t.get("value", "")
            try:
                val = float(re.sub(r"[^\d.\-]", "", str(raw_v)))
            except:
                continue
            flag   = (t.get("lab_flag") or "").upper()
            status = "High" if flag in ("H","HIGH","CRITICAL") else "Low" if flag in ("L","LOW") else "Normal"
            if name:
                tests[name] = {
                    "value":  val,
                    "unit":   t.get("unit") or "",
                    "status": status,
                }
    return tests


# ── Public API ────────────────────────────────────────────────────────────────

def process_report_file(file_bytes: bytes, is_image: bool = False) -> dict:
    """
    Full pipeline: PDF/image → structured cards result.

    Returns
    -------
    {
      patient_info, panels, tests,
      dynamic_analysis: { analysis_summary, detailed_analysis, highlight_map },
      card_explanations: [...],
      overall_risk,
    }
    """
    # Step 1: Extract text
    if is_image:
        raw_text = _extract_image_text(file_bytes)
    else:
        raw_text = _extract_pdf_text(file_bytes)

    if not raw_text.strip():
        raise RuntimeError(
            "Could not extract text from this file. "
            "For images, ensure good lighting and a clear photo. "
            "For PDFs, ensure it is text-based (not scanned)."
        )

    # Step 2: Dynamic extraction
    structured = _llm_extract(raw_text)
    patient_info = structured.get("patient_info") or {}
    panels       = structured.get("panels") or []

    # Step 3: Dynamic range analysis
    dynamic_analysis = analyze_panels(panels) if panels else {
        "analysis_summary": {"total_tests": 0, "abnormal_count": 0, "critical_count": 0, "overall_risk": "Unknown"},
        "detailed_analysis": [],
        "highlight_map": {"normal":[],"high":[],"low":[],"borderline":[],"critical":[]},
    }
    risk = dynamic_analysis["analysis_summary"].get("overall_risk", "Unknown")

    # Step 4: Per-test card explanations (6-module NLP)
    domain_clusters = dynamic_analysis["analysis_summary"].get("domain_clusters", {})
    card_explanations = _llm_card_explanations(
        dynamic_analysis.get("detailed_analysis", []),
        risk,
        domain_clusters,
    )

    # Flat tests dict (for analytics + chat compatibility)
    tests = _flatten_tests(panels)

    # Priority list from Module 3
    priority_list = dynamic_analysis.get("priority_list", [])

    return {
        "patient_info":     patient_info,
        "panels":           panels,
        "tests":            tests,
        "dynamic_analysis": dynamic_analysis,
        "card_explanations": card_explanations,
        "priority_list":    priority_list,
        "overall_risk":     risk,
        "domain_clusters":  domain_clusters,
        # Analytics stub (dashboard compatibility)
        "analytics": {
            "total":    dynamic_analysis["analysis_summary"]["total_tests"],
            "abnormal": dynamic_analysis["analysis_summary"]["abnormal_count"],
            "high":     len(dynamic_analysis["highlight_map"]["high"]),
            "low":      len(dynamic_analysis["highlight_map"]["low"]),
            "high_tests": [x["parameter"] for x in dynamic_analysis["highlight_map"]["high"]],
            "low_tests":  [x["parameter"] for x in dynamic_analysis["highlight_map"]["low"]],
            "normal":   len(dynamic_analysis["highlight_map"]["normal"]),
        },
        "alert": {
            "alert_level":    dynamic_analysis["analysis_summary"].get("alert_level", "STABLE"),
            "emergency_flag": dynamic_analysis["analysis_summary"]["emergency_flag"],
            "critical_tests": [x["parameter"] for x in dynamic_analysis["highlight_map"]["critical"]],
            "trigger_reason": f"{dynamic_analysis['analysis_summary']['abnormal_count']} abnormal parameter(s) detected.",
        },
        "confidence": {"percentage": f"{max(50, 100 - dynamic_analysis['analysis_summary']['abnormal_count'] * 8)}%"},
        "explanation": "",
        "language": "English",
    }


def _map_risk_to_alert(risk: str) -> str:
    m = {
        "Critical Attention Required": "CRITICAL",
        "High Risk": "HIGH",
        "Moderate Risk": "ELEVATED",
        "Mild Concern": "ELEVATED",
        "Stable": "NORMAL",
    }
    return m.get(risk, "NORMAL")

"""
app/services/pdf_generator.py
-----------------------------
Generate a professional PDF health report using ReportLab.
Clean, readable, WhatsApp-shareable format.
"""
from reportlab.lib.pagesizes import A4
from reportlab.lib import colors
from reportlab.lib.units import mm
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, HRFlowable
)
from reportlab.graphics.shapes import Drawing, Rect, Circle
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
import io
import os
import re
import html
from datetime import datetime

# Attempt to load a Unicode-compliant system font for foreign languages (Indic, CJK, etc.)
# Fallback to Helvetica if not found.
FONT_REGULAR = "Helvetica"
FONT_BOLD = "Helvetica-Bold"
FONT_OBLIQUE = "Helvetica-Oblique"

def _register_unicode_fonts():
    global FONT_REGULAR, FONT_BOLD
    font_paths = [
        "C:\\Windows\\Fonts\\Nirmala.ttc",
        "C:\\Windows\\Fonts\\Nirmala.ttf",
        "/usr/share/fonts/truetype/noto/NotoSans-Regular.ttf", # Linux fallback
    ]
    
    for path in font_paths:
        if os.path.exists(path):
            try:
                if path.endswith(".ttc"):
                    # TTC (TrueType Collection) usually contains multiple faces.
                    # Index 0 is usually Regular, Index 1 is usually Bold for Nirmala.
                    pdfmetrics.registerFont(TTFont("Nirmala", path, subfontIndex=0))
                    pdfmetrics.registerFont(TTFont("Nirmala-Bold", path, subfontIndex=1))
                    FONT_REGULAR = "Nirmala"
                    FONT_BOLD = "Nirmala-Bold"
                    return True
                else:
                    pdfmetrics.registerFont(TTFont("Unicode-Regular", path))
                    FONT_REGULAR = "Unicode-Regular"
                    # Try to find a bold companion if it's a TTF
                    bold_path = path.replace("Regular", "Bold").replace(".ttf", "b.ttf")
                    if os.path.exists(bold_path):
                        pdfmetrics.registerFont(TTFont("Unicode-Bold", bold_path))
                        FONT_BOLD = "Unicode-Bold"
                    return True
            except Exception as e:
                print(f"Warning: Failed to load font at {path}: {e}")
    return False

_register_unicode_fonts()

# ── Color Palette ─────────────────────────────────────────────────────────────
C_DARK      = colors.HexColor("#0e1522")
C_ACCENT    = colors.HexColor("#2563eb") # Darker blue for light theme
C_GREEN     = colors.HexColor("#10b981") # Richer green
C_WARN      = colors.HexColor("#f59e0b") # Richer amber
C_DANGER    = colors.HexColor("#ef4444") # Richer red
C_LIGHT     = colors.HexColor("#1e293b") # TEXT COLOR: Changed to dark slate for light backgrounds
C_MUTED     = colors.HexColor("#64748b") # Darker slate for muted text
C_WHITE     = colors.white
C_STATUS    = {"High": C_DANGER, "Low": colors.HexColor("#0f172a"), "Normal": C_GREEN} # Red, Black, Green as requested
C_ALERT     = {"CRITICAL": C_DANGER, "HIGH": C_WARN, "ELEVATED": C_ACCENT, "NORMAL": C_GREEN}


def _create_sparkline(val: float, min_val: float, max_val: float, width=50, height=8) -> Drawing:
    """Draw a minimalist reference range sparkline."""
    d = Drawing(width, height)
    
    # Background total span (light gray)
    d.add(Rect(0, height/2 - 1.5, width, 3, fillColor=colors.HexColor("#e2e8f0"), strokeColor=None, rx=1.5, ry=1.5))
    
    range_span = max_val - min_val
    if range_span <= 0:
        return d
    
    # Calculate dot position (bounded between 0 and 1)
    pct = (val - min_val) / range_span
    
    # Safe zone (darker gray)
    safe_width = width * 0.4 # arbitrarily visually centralize the safe 40% of the bar
    safe_x = width/2 - safe_width/2
    d.add(Rect(safe_x, height/2 - 1.5, safe_width, 3, fillColor=colors.HexColor("#94a3b8"), strokeColor=None, rx=1.5, ry=1.5))

    # Dot positioning
    dot_x = 0
    dot_color = C_GREEN

    if pct < 0:
        dot_x = max(0, safe_x - 5)
        dot_color = C_STATUS["Low"]
    elif pct > 1:
        dot_x = min(width, safe_x + safe_width + 5)
        dot_color = C_STATUS["High"]
    else:
        # Interpolate within the safe zone
        dot_x = safe_x + (pct * safe_width)
        dot_color = C_GREEN
        
    d.add(Circle(dot_x, height/2, 3.5, fillColor=dot_color, strokeColor=colors.white, strokeWidth=1))
    return d

def _level_color(level: str) -> colors.Color:
    return C_ALERT.get(level.upper(), C_MUTED)


def generate_health_pdf(data: dict) -> bytes:
    """
    Generate and return a PDF health report as bytes.

    Parameters
    ----------
    data : dict — result from the /analyze endpoint
    """
    buffer = io.BytesIO()
    doc = SimpleDocTemplate(
        buffer, pagesize=A4,
        topMargin=20*mm, bottomMargin=20*mm,
        leftMargin=18*mm, rightMargin=18*mm,
    )

    styles  = getSampleStyleSheet()
    W       = A4[0] - 36*mm  # usable width

    # ── Custom Styles ──────────────────────────────────────────────────────────
    h1 = ParagraphStyle("H1", parent=styles["Heading1"],
                         fontSize=20, textColor=C_ACCENT,
                         spaceAfter=4, fontName=FONT_BOLD)
    h2 = ParagraphStyle("H2", parent=styles["Heading2"],
                         fontSize=13, textColor=C_LIGHT,
                         spaceAfter=3, fontName=FONT_BOLD)
    h3 = ParagraphStyle("H3", parent=styles["Heading3"],
                         fontSize=10, textColor=C_MUTED,
                         spaceAfter=2, fontName=FONT_BOLD,
                         textTransform="uppercase", letterSpacing=1)
    body = ParagraphStyle("Body", parent=styles["Normal"],
                           fontSize=10, textColor=C_LIGHT,
                           spaceAfter=6, leading=15, fontName=FONT_REGULAR)
    small = ParagraphStyle("Small", parent=styles["Normal"],
                            fontSize=8.5, textColor=C_MUTED,
                            spaceAfter=4, leading=12, fontName=FONT_REGULAR)
    disclaimer = ParagraphStyle("Disc", parent=styles["Normal"],
                                 fontSize=8, textColor=C_MUTED,
                                 spaceAfter=4, leading=11,
                                 fontName=FONT_OBLIQUE)

    story = []

    # ── Header ──────────────────────────────────────────────────────────────────
    story.append(Paragraph("🔬 MediLens AI", h1))
    story.append(Paragraph("Grounded Medical Report Intelligence", small))
    story.append(Paragraph(f"Generated: {datetime.now().strftime('%d %B %Y, %I:%M %p')}", small))
    story.append(HRFlowable(width="100%", thickness=1, color=C_ACCENT, spaceAfter=10))

    # ── Patient Info ─────────────────────────────────────────────────────────────
    story.append(Paragraph("Patient Profile", h2))
    age    = data.get("patient_age", "—")
    gender = data.get("patient_gender", "—")
    mode   = data.get("mode", "patient").title()
    lang   = data.get("language", "English")
    patient_data = [
        ["Age", str(age), "Gender", gender],
        ["Report Mode", mode, "Language", lang],
    ]
    pt = Table(patient_data, colWidths=[W*0.2, W*0.3, W*0.2, W*0.3])
    pt.setStyle(TableStyle([
        ("FONTNAME",    (0,0), (-1,-1), FONT_REGULAR),
        ("FONTSIZE",    (0,0), (-1,-1), 10),
        ("TEXTCOLOR",  (0,0), (0,-1), C_MUTED),
        ("TEXTCOLOR",  (2,0), (2,-1), C_MUTED),
        ("TEXTCOLOR",  (1,0), (1,-1), C_LIGHT),
        ("TEXTCOLOR",  (3,0), (3,-1), C_LIGHT),
        ("BOTTOMPADDING", (0,0), (-1,-1), 6),
    ]))
    story.append(pt)
    story.append(Spacer(1, 8))

    # ── Overall Status ───────────────────────────────────────────────────────────
    alert  = data.get("alert", {})
    level  = alert.get("alert_level", "NORMAL")
    emoji  = {"CRITICAL": "🔴", "HIGH": "🟡", "ELEVATED": "🟡", "NORMAL": "🟢"}.get(level, "⚪")
    story.append(Paragraph("Overall Health Alert", h2))
    story.append(Paragraph(f"{emoji} Alert Level: <b>{level}</b>", body))
    story.append(Paragraph(alert.get("trigger_reason", ""), small))

    conf = data.get("confidence", {})
    story.append(Paragraph(f"AI Confidence Score: <b>{conf.get('percentage', 'N/A')}</b>", body))
    story.append(Spacer(1, 6))

    # ── Executive Summary Extraction ──────────────────────────────────────────────
    explanation = data.get("explanation", "")
    executive_summary = None
    
    # Try to extract the summary block generated by the LLM prompt
    match = re.search(r'\[EXECUTIVE_SUMMARY\](.*?)\[/EXECUTIVE_SUMMARY\]', explanation, re.DOTALL | re.IGNORECASE)
    if match:
        executive_summary = match.group(1).strip()
        # Remove it from the main explanation so it doesn't print twice
        explanation = re.sub(r'\[EXECUTIVE_SUMMARY\].*?\[/EXECUTIVE_SUMMARY\]', '', explanation, flags=re.DOTALL | re.IGNORECASE).strip()
    elif not explanation:
        # Fallback if no explanation exists
        executive_summary = "Pending detailed AI analysis."

    if executive_summary:
        story.append(Paragraph("Executive Summary", h2))
        
        # Clean markdown bolding
        safe_summary = html.escape(executive_summary)
        formatted_summary = re.sub(r'\*\*(.*?)\*\*', r'<b>\1</b>', safe_summary)
        formatted_summary = formatted_summary.replace('\n', '<br/>')
        
        # Draw inside a highlighted box
        summary_t = Table([[Paragraph(formatted_summary, body)]], colWidths=[W])
        summary_t.setStyle(TableStyle([
            ("BACKGROUND",  (0,0), (-1,-1), colors.HexColor("#e0f2fe")), # soft blue background
            ("TOPPADDING",  (0,0), (-1,-1), 8),
            ("BOTTOMPADDING",(0,0),(-1,-1), 8),
            ("LEFTPADDING", (0,0), (-1,-1), 10),
            ("RIGHTPADDING",(0,0),(-1,-1), 10),
            ("ROUNDEDCORNERS", [3, 3, 3, 3]),
        ]))
        story.append(summary_t)
        story.append(Spacer(1, 10))


    # ── Lab Results Table (Grouped by Medical Domain) ─────────────────────────────────
    story.append(HRFlowable(width="100%", thickness=0.5, color=C_MUTED, spaceAfter=8))
    story.append(Paragraph("Lab Test Results", h2))

    tests = data.get("tests", {})
    if tests:
        # Determine unique domains, defaulting to "General" if not provided
        domains = {}
        for name, d in tests.items():
            domain = d.get("domain", "General Overview")
            if domain not in domains:
                domains[domain] = {}
            domains[domain][name] = d

        for domain, domain_tests in domains.items():
            story.append(Paragraph(f"<b>{domain}</b>", h3))
            
            header = [
                Paragraph("<b>Test</b>", ParagraphStyle("TH", parent=body, textColor=C_MUTED, fontSize=9)),
                Paragraph("<b>Value</b>", ParagraphStyle("TH", parent=body, textColor=C_MUTED, fontSize=9)),
                Paragraph("<b>Range Visual</b>", ParagraphStyle("TH", parent=body, textColor=C_MUTED, fontSize=9)),
                Paragraph("<b>Status</b>", ParagraphStyle("TH", parent=body, textColor=C_MUTED, fontSize=9)),
            ]
            rows = [header]
            for name, d in domain_tests.items():
                status = d.get("status", "Normal")
                sc = C_STATUS.get(status, C_LIGHT)
                
                # Try generating Sparkline
                visual = ""
                raw_val = str(d.get("value", ""))
                try:
                    num_val = float(raw_val)
                    ref_str = str(d.get("reference_range", ""))
                    match = re.search(r'(\d+\.?\d*)\s*[-–]\s*(\d+\.?\d*)', ref_str)
                    if match:
                        visual = _create_sparkline(num_val, float(match.group(1)), float(match.group(2)))
                    else:
                        visual = Paragraph("—", body)
                except ValueError:
                    visual = Paragraph("—", body)

                
                # Pill Badge formatting hack using ReportLab background colors
                bg_color = "eef2ff" if status == "Normal" else ("fef2f2" if status == "High" else "f8fafc")
                text_color = sc.hexval()[2:]
                badge = f"""<font color='#{text_color}'><b> {status.upper()} </b></font>"""
                
                value_text = f"{raw_val} <font size='7.5' color='#64748b'>{d.get('unit', '')}</font>"

                rows.append([
                    Paragraph(name, body),
                    Paragraph(value_text, body),
                    visual,
                    Paragraph(badge, body),
                ])
                
            t = Table(rows, colWidths=[W*0.40, W*0.20, W*0.20, W*0.20])
            t.setStyle(TableStyle([
                ("BACKGROUND",  (0,0), (-1,0), colors.HexColor("#f1f5f9")),
                ("ROWBACKGROUNDS",(0,1),(-1,-1),[colors.HexColor("#ffffff"), colors.HexColor("#f8fafc")]),
                ("GRID",        (0,0), (-1,-1), 0.5, colors.HexColor("#cbd5e1")),
                ("FONTNAME",    (0,0), (-1,-1), FONT_REGULAR),
                ("FONTSIZE",    (0,0), (-1,-1), 10),
                ("TOPPADDING",  (0,0), (-1,-1), 6),
                ("BOTTOMPADDING",(0,0),(-1,-1), 6),
                ("VALIGN",      (0,0), (-1,-1), "MIDDLE"),
            ]))
            story.append(t)
            story.append(Spacer(1, 10))

    # ── Trend ────────────────────────────────────────────────────────────────────
    trend = data.get("trend")
    if trend and trend.get("trends"):
        story.append(HRFlowable(width="100%", thickness=0.5, color=C_MUTED, spaceAfter=8))
        story.append(Paragraph("Comparative Trend (vs Previous Report)", h2))
        thead = [["Test","Previous","Current","Change","Status"]]
        trows = []
        for t_item in trend["trends"]:
            pct  = t_item.get("change_pct")
            sign = ("+" if pct and pct > 0 else "") if pct is not None else ""
            pct_str = f"{sign}{pct}%" if pct is not None else "—"
            arrow = "↑" if (pct and pct > 0) else ("↓" if (pct and pct < 0) else "→")
            trows.append([
                t_item["test"],
                f"{t_item['previous_value']} {t_item['unit']}",
                f"{t_item['current_value']} {t_item['unit']}",
                f"{arrow} {pct_str}",
                t_item["current_status"],
            ])
        tr = Table(thead + trows, colWidths=[W*0.28, W*0.18, W*0.18, W*0.18, W*0.18])
        tr.setStyle(TableStyle([
            ("BACKGROUND",  (0,0), (-1,0), colors.HexColor("#f1f5f9")),
            ("GRID",        (0,0), (-1,-1), 0.5, colors.HexColor("#cbd5e1")),
            ("FONTNAME",    (0,0), (-1,-1), FONT_REGULAR),
            ("FONTSIZE",    (0,0), (-1,-1), 9),
            ("TOPPADDING",  (0,0), (-1,-1), 5),
            ("BOTTOMPADDING",(0,0),(-1,-1), 5),
        ]))
        story.append(tr)
        story.append(Spacer(1, 10))

    # ── Priority Abnormalities Detailed ───────────────────────────────────────────
    priority_list = data.get("priority_list", [])
    if priority_list:
        story.append(HRFlowable(width="100%", thickness=0.5, color=C_MUTED, spaceAfter=8))
        story.append(Paragraph("Priority Abnormalities Detailed", h2))
        for p in priority_list:
            status     = p.get("status", "Unknown")
            parameter  = p.get("parameter", "Unknown")
            reason     = p.get("reason", "")
            
            sc = C_STATUS.get(status, C_DANGER) if status in C_STATUS else C_DANGER
            story.append(Paragraph(
                f"<font color='#{sc.hexval()[2:]}'>● {status}</font> <b>{parameter}</b>", 
                body
            ))
            if reason:
                story.append(Paragraph(reason, small))
        story.append(Spacer(1, 10))

    # ── AI Explanation ────────────────────────────────────────────────────────────
    # The 'explanation' variable was already extracted and cleaned of the Executive Summary above
    if explanation:
        story.append(HRFlowable(width="100%", thickness=0.5, color=C_MUTED, spaceAfter=8))
        story.append(Paragraph("AI Health Explanation", h2))
        
        paragraphs = explanation.split('\n\n')
        for para in paragraphs:
            para = para.strip()
            if para:
                # IMPORTANT: Escape LLM output so '<' and '&' don't crash ReportLab XML parser
                safe_para = html.escape(para)
                
                # Check if this paragraph is completely wrapped in **bolds** (meaning it's a section header)
                # Ensure it doesn't contain a bullet point or long text. Just a short line title.
                is_header = False
                if safe_para.startswith('**') and safe_para.endswith('**') and len(safe_para) < 100 and '\n' not in safe_para:
                    is_header = True
                    # Strip the ** tokens for the header style
                    clean_text = safe_para[2:-2].strip()
                    story.append(Spacer(1, 6)) # Extra visual padding before headers
                    story.append(Paragraph(clean_text, h3))
                else:
                    # Regular body paragraph: cleanly convert inline markdown **bold** to ReportLab <b>bold</b>
                    formatted_para = re.sub(r'\*\*(.*?)\*\*', r'<b>\1</b>', safe_para)
                    # Apply <br/> to handle single newlines inside blocks
                    formatted_para = formatted_para.replace('\n', '<br/>')
                    story.append(Paragraph(formatted_para, body))
                
                story.append(Spacer(1, 4))
        
        story.append(Spacer(1, 15))
        story.append(Paragraph(
            "<font color='#64748b'><b>Medical Disclaimer:</b><br/>"
            "This report is generated using artificial intelligence for informational purposes only "
            "and does not replace professional medical advice, diagnosis, or treatment. Always "
            "consult a qualified healthcare professional for clinical decisions.</font>",
            small
        ))

    story.append(Spacer(1, 8))

    # ── Privacy & Disclaimer ──────────────────────────────────────────────────────
    story.append(HRFlowable(width="100%", thickness=0.5, color=C_MUTED, spaceAfter=6))
    story.append(Paragraph("🔒 Privacy: No patient data is stored. All processing is in-session only.", small))
    story.append(Paragraph(
        "⚠️ DISCLAIMER: This report is generated by an AI system for informational and educational "
        "purposes only. It does NOT constitute a medical diagnosis, medical advice, or a substitute "
        "for professional medical consultation. Always consult a qualified healthcare professional.",
        disclaimer
    ))

    doc.build(story)
    return buffer.getvalue()

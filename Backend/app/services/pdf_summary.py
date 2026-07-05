"""
app/services/pdf_summary.py
---------------------------
Generate a simple, patient-friendly "Health Summary" PDF.
Style: clean, readable, WhatsApp-shareable — one report only.
Layout mirrors the 'MediLens Health Summary' design.
"""
from reportlab.lib.pagesizes import A4
from reportlab.lib import colors
from reportlab.lib.units import mm
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, HRFlowable
)
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
import io
import os
from datetime import datetime

# ── Font setup (reuse from pdf_generator if already registered) ────────────────
FONT_REGULAR = "Helvetica"
FONT_BOLD = "Helvetica-Bold"
FONT_OBLIQUE = "Helvetica-Oblique"

def _try_register_unicode():
    global FONT_REGULAR, FONT_BOLD
    font_paths = [
        "C:\\Windows\\Fonts\\Nirmala.ttc",
        "C:\\Windows\\Fonts\\Nirmala.ttf",
        "/usr/share/fonts/truetype/noto/NotoSans-Regular.ttf",
    ]
    for path in font_paths:
        if os.path.exists(path):
            try:
                if path.endswith(".ttc"):
                    pdfmetrics.registerFont(TTFont("Nirmala", path, subfontIndex=0))
                    pdfmetrics.registerFont(TTFont("Nirmala-Bold", path, subfontIndex=1))
                    FONT_REGULAR = "Nirmala"
                    FONT_BOLD = "Nirmala-Bold"
                else:
                    pdfmetrics.registerFont(TTFont("Unicode-Regular", path))
                    FONT_REGULAR = "Unicode-Regular"
                return True
            except Exception:
                pass
    return False

_try_register_unicode()

# ── Colors ─────────────────────────────────────────────────────────────────────
C_BLUE   = colors.HexColor("#1a56db")
C_RED    = colors.HexColor("#e02424")
C_GREEN  = colors.HexColor("#057a55")
C_DARK   = colors.HexColor("#111827")
C_MUTED  = colors.HexColor("#6b7280")
C_DIVIDER= colors.HexColor("#d1d5db")
C_ROW_BG = colors.HexColor("#f9fafb")
 
# ── Multilingual Lookups ──────────────────────────────────────────────────────
TRANSLATIONS = {
    "English": {
        "title": "MediLens Health Summary", "generated": "Generated on", "age_years": "years old",
        "gender": "Gender", "age": "Patient Age", "results_title": "Your Test Results",
        "test_name": "Test Name", "your_result": "Your Result", "normal_range": "Normal Range", "status": "Status",
        "understanding": "Understanding Your Results", "explanation_intro": "Here is a simple explanation of the tests that were outside the normal range:",
        "what_is": "What is", "means_for_you": "What this means for you", "questions_title": "Questions to Ask Your Doctor",
        "disclaimer_note": "Please Note: This summary is designed to help you understand your lab results easily. It is not a medical diagnosis. Always check with your doctor before making any health decisions."
    },
    "Hindi": {
        "title": "MediLens स्वास्थ्य सारांश", "generated": "तैयार किया गया", "age_years": "साल के",
        "gender": "लिंग", "age": "रोगी की आयु", "results_title": "आपके टेस्ट परिणाम",
        "test_name": "टेस्ट का नाम", "your_result": "आपका परिणाम", "normal_range": "सामान्य सीमा", "status": "स्थिति",
        "understanding": "अपने परिणामों को समझना", "explanation_intro": "यहाँ उन टेस्टों का सरल विवरण है जो सामान्य सीमा से बाहर थे:",
        "what_is": "क्या है", "means_for_you": "आपके लिए इसका क्या मतलब है", "questions_title": "अपने डॉक्टर से पूछने के लिए प्रश्न",
        "disclaimer_note": "कृपया ध्यान दें: यह सारांश आपको अपने लैब परिणामों को आसानी से समझने में मदद करने के लिए बनाया गया है।"
    },
    "Tamil": {
        "title": "MediLens சுகாதார சுருக்கம்", "generated": "உருவாக்கப்பட்டது", "age_years": "வயது",
        "gender": "பாலினம்", "age": "நோயாளி வயது", "results_title": "உங்கள் சோதனை முடிவுகள்",
        "test_name": "சோதனை பெயர்", "your_result": "உங்கள் முடிவு", "normal_range": "சாதாரண வரம்பு", "status": "நிலை",
        "understanding": "உங்கள் முடிவுகளைப் புரிந்துகொள்வது", "explanation_intro": "சாதாரண வரம்பிற்கு வெளியே இருந்த சோதனைகளின் எளிய விளக்கம் இங்கே:",
        "what_is": "என்பது என்ன", "means_for_you": "இது உங்களுக்கு என்ன அர்த்தம்", "questions_title": "உங்கள் மருத்துவரிடம் கேட்க வேண்டிய கேள்விகள்",
        "disclaimer_note": "தயவுசெய்து கவனிக்கவும்: இந்தச் சுருக்கமானது உங்கள் ஆய்வக முடிவுகளை எளிதாகப் புரிந்துகொள்ள உதவும் வகையில் வடிவமைக்கப்பட்டுள்ளது."
    },
    "Telugu": {
        "title": "MediLens ఆరోగ్య సారాంశం", "generated": "సృష్టించబడింది", "age_years": "సంవత్సరాలు",
        "gender": "లింగం", "age": "రోగి వయస్సు", "results_title": "మీ పరీక్ష ఫలితాలు",
        "test_name": "పరీక్ష పేరు", "your_result": "మీ ఫలితం", "normal_range": "సాధారణ పరిధి", "status": "స్థితి",
        "understanding": "మీ ఫలితాలను అర్థం చేసుకోవడం", "explanation_intro": "సాధారణ పరిధి వెలుపల ఉన్న పరీక్షల సాధారణ వివరణ ఇక్కడ ఉంది:",
        "what_is": "అంటే ఏమిటి", "means_for_you": "దీని అర్థం ఏమిటి", "questions_title": "మీ వైద్యుడిని అడగవలసిన ప్రశ్నలు",
        "disclaimer_note": "దయచేసి గమనించండి: ఈ సారాంశం మీ ల్యాబ్ ఫలితాలను సులభంగా అర్థం చేసుకోవడానికి రూపొందించబడింది."
    },
    "Spanish": {
        "title": "Resumen de Salud MediLens", "generated": "Generado el", "age_years": "años",
        "gender": "Género", "age": "Edad del Paciente", "results_title": "Sus Resultados de Prueba",
        "test_name": "Nombre de la Prueba", "your_result": "Su Resultado", "normal_range": "Rango Normal", "status": "Estado",
        "understanding": "Entendiendo sus Resultados", "explanation_intro": "Aquí hay una explicación simple de las pruebas que estuvieron fuera del rango normal:",
        "what_is": "Qué es", "means_for_you": "Qué significa esto para usted", "questions_title": "Preguntas para hacerle a su médico",
        "disclaimer_note": "Tenga en cuenta: este resumen está diseñado para ayudarlo a comprender sus resultados de laboratorio fácilmente."
    }
}


def generate_simple_summary_pdf(data: dict) -> bytes:
    """
    Generate a clean, patient-friendly single-report summary PDF.

    Parameters
    ----------
    data : dict — result from /analyze (same PDFRequest format)
    """
    buffer = io.BytesIO()
    doc = SimpleDocTemplate(
        buffer, pagesize=A4,
        topMargin=22*mm, bottomMargin=22*mm,
        leftMargin=20*mm, rightMargin=20*mm,
    )

    styles = getSampleStyleSheet()
    W = A4[0] - 40*mm  # usable width

    # ── Styles ──────────────────────────────────────────────────────────────────
    title_style = ParagraphStyle("Title", parent=styles["Normal"],
                                  fontSize=22, textColor=C_BLUE,
                                  fontName=FONT_BOLD, spaceAfter=2)
    subtitle_style = ParagraphStyle("Sub", parent=styles["Normal"],
                                     fontSize=10, textColor=C_MUTED,
                                     fontName=FONT_REGULAR, spaceAfter=2)
    patient_style = ParagraphStyle("Pat", parent=styles["Normal"],
                                    fontSize=11, textColor=C_DARK,
                                    fontName=FONT_BOLD, spaceAfter=2)
    body_style = ParagraphStyle("Body", parent=styles["Normal"],
                                 fontSize=10, textColor=C_DARK,
                                 fontName=FONT_REGULAR, spaceAfter=4, leading=14)
    small_style = ParagraphStyle("Small", parent=styles["Normal"],
                                  fontSize=8.5, textColor=C_MUTED,
                                  fontName=FONT_OBLIQUE, leading=12, spaceAfter=3)
    section_title = ParagraphStyle("SecTitle", parent=styles["Normal"],
                                    fontSize=13, textColor=C_DARK,
                                    fontName=FONT_BOLD, spaceAfter=6,
                                    spaceBefore=10)
    param_title = ParagraphStyle("ParamTitle", parent=styles["Normal"],
                                  fontSize=10, textColor=C_BLUE,
                                  fontName=FONT_BOLD, spaceAfter=2,
                                  spaceBefore=8)
    bullet_style = ParagraphStyle("Bullet", parent=styles["Normal"],
                                   fontSize=10, textColor=C_DARK,
                                   fontName=FONT_REGULAR, spaceAfter=2,
                                   leading=14, leftIndent=8)

    story = []

    lang = data.get("language", "English")
    T = TRANSLATIONS.get(lang, TRANSLATIONS["English"])

    # ── Header ──────────────────────────────────────────────────────────────────
    story.append(Paragraph(T["title"], title_style))
    story.append(Paragraph(f"{T['generated']} {datetime.now().strftime('%d %B %Y')}", subtitle_style))
    story.append(HRFlowable(width="100%", thickness=1.5, color=C_BLUE, spaceAfter=10))

    # ── Patient Info Row ─────────────────────────────────────────────────────────
    name   = data.get("patient_name") or ""
    age    = data.get("patient_age", "")
    gender = data.get("patient_gender", "")

    patient_row = []
    if name and name.strip() and name != "Unknown Patient":
        patient_row.append(Paragraph(f"<b>{name.upper()}</b>", patient_style))
    if age:
        patient_row.append(Paragraph(f"{T['age']}: <b>{age} {T['age_years']}</b>", body_style))
    if gender:
        patient_row.append(Paragraph(f"{T['gender']}: <b>{gender}</b>", body_style))

    if patient_row:
        n_cols = len(patient_row)
        col_w = W / n_cols
        pt = Table([patient_row], colWidths=[col_w] * n_cols)
        pt.setStyle(TableStyle([
            ("FONTNAME",  (0,0), (-1,-1), FONT_REGULAR),
            ("FONTSIZE",  (0,0), (-1,-1), 11),
            ("VALIGN",    (0,0), (-1,-1), "MIDDLE"),
            ("BOTTOMPADDING", (0,0),(-1,-1), 4),
        ]))
        story.append(pt)

    story.append(Spacer(1, 6))

    # ── Summary Box ──────────────────────────────────────────────────────────────
    tests = data.get("tests", {})
    alert = data.get("alert", {})
    level = alert.get("alert_level", "NORMAL")

    abnormal_names = [
        name for name, t in tests.items()
        if t.get("status", "Normal") in ("High", "Low", "HIGH", "LOW", "BORDERLINE", "CRITICAL")
    ]

    if abnormal_names:
        ab_list = ", ".join(abnormal_names[:8])
        if len(abnormal_names) > 8:
            ab_list += f" and {len(abnormal_names) - 8} more"
        if level in ("CRITICAL", "HIGH"):
            summary_text = (
                f"Your lab results are ready. Some values (<b>{ab_list}</b>) "
                "are <b>significantly outside</b> the normal range. "
                "We recommend consulting your doctor as soon as possible."
            )
            box_color = colors.HexColor("#fef2f2")
            border_color = C_RED
        else:
            summary_text = (
                f"Your lab results are ready. We noticed a few values (<b>{ab_list}</b>) "
                "are slightly outside the usual range. Please do not worry—this is very common. "
                "We recommend sharing this report with your doctor during your next visit."
            )
            box_color = colors.HexColor("#f0fdf4")
            border_color = C_GREEN
    else:
        summary_text = (
            "Great news! All your lab results are within normal ranges. "
            "Keep up the healthy lifestyle and continue regular check-ups."
        )
        box_color = colors.HexColor("#f0fdf4")
        border_color = C_GREEN

    summary_para = Paragraph(summary_text, body_style)
    summary_table = Table([[summary_para]], colWidths=[W])
    summary_table.setStyle(TableStyle([
        ("BACKGROUND",    (0,0), (-1,-1), box_color),
        ("LINEBEFORELEFT",(0,0), (-1,-1), 3, border_color),
        ("TOPPADDING",    (0,0), (-1,-1), 10),
        ("BOTTOMPADDING", (0,0), (-1,-1), 10),
        ("LEFTPADDING",   (0,0), (-1,-1), 12),
        ("RIGHTPADDING",  (0,0), (-1,-1), 12),
    ]))
    story.append(summary_table)
    story.append(Spacer(1, 12))

    # ── Test Results Table ────────────────────────────────────────────────────────
    if tests:
        story.append(Paragraph(T["results_title"], section_title))

        header = [
            Paragraph(f"<b>{T['test_name']}</b>", ParagraphStyle("TH", parent=body_style, textColor=C_MUTED, fontName=FONT_BOLD, fontSize=9)),
            Paragraph(f"<b>{T['your_result']}</b>", ParagraphStyle("TH", parent=body_style, textColor=C_MUTED, fontName=FONT_BOLD, fontSize=9)),
            Paragraph(f"<b>{T['normal_range']}</b>", ParagraphStyle("TH", parent=body_style, textColor=C_MUTED, fontName=FONT_BOLD, fontSize=9)),
            Paragraph(f"<b>{T['status']}</b>", ParagraphStyle("TH", parent=body_style, textColor=C_MUTED, fontName=FONT_BOLD, fontSize=9)),
        ]
        rows = [header]

        for test_name, t in tests.items():
            status = t.get("status", "Normal")
            val    = str(t.get("value", "—"))
            unit   = t.get("unit", "")
            ref    = t.get("reference_range", "—")

            status_upper = status.upper() if status else "NORMAL"
            if status_upper in ("HIGH", "CRITICAL"):
                sc = C_RED
            elif status_upper == "LOW":
                sc = C_BLUE
            else:
                sc = C_GREEN

            value_text = f"{val} <font size='8' color='#6b7280'>{unit}</font>"
            status_text = f"<font color='#{sc.hexval()[2:]}'><b>{status.upper()}</b></font>"

            rows.append([
                Paragraph(test_name, body_style),
                Paragraph(value_text, body_style),
                Paragraph(str(ref), body_style),
                Paragraph(status_text, body_style),
            ])

        result_table = Table(rows, colWidths=[W*0.38, W*0.20, W*0.27, W*0.15])
        result_table.setStyle(TableStyle([
            ("BACKGROUND",    (0,0), (-1,0), colors.HexColor("#f3f4f6")),
            ("LINEBELOW",     (0,0), (-1,0), 1.5, C_DARK),
            ("LINEBELOW",     (0,1), (-1,-1), 0.5, colors.HexColor("#e5e7eb")),
            ("ROWBACKGROUNDS",(0,1), (-1,-1), [colors.white, C_ROW_BG]),
            ("FONTNAME",      (0,0), (-1,-1), FONT_REGULAR),
            ("FONTSIZE",      (0,0), (-1,-1), 10),
            ("TOPPADDING",    (0,0), (-1,-1), 7),
            ("BOTTOMPADDING", (0,0), (-1,-1), 7),
            ("LEFTPADDING",   (0,0), (-1,-1), 8),
            ("VALIGN",        (0,0), (-1,-1), "MIDDLE"),
        ]))
        story.append(result_table)
        story.append(Spacer(1, 14))

    # ── Understanding Your Results ────────────────────────────────────────────────
    abnormal_tests = {
        name: t for name, t in tests.items()
        if t.get("status", "Normal").upper() in ("HIGH", "LOW", "BORDERLINE", "CRITICAL")
    }

    if abnormal_tests:
        story.append(HRFlowable(width="100%", thickness=0.5, color=C_DIVIDER, spaceAfter=8))
        story.append(Paragraph(T["understanding"], section_title))
        story.append(Paragraph(
            T["explanation_intro"],
            body_style
        ))
        story.append(Spacer(1, 4))

        # Reuse card_explanations if provided; else use simple fallback
        card_map = {}
        for c in data.get("priority_list", []):
            if isinstance(c, dict) and c.get("parameter"):
                card_map[c["parameter"]] = c

        for test_name, t in abnormal_tests.items():
            card = card_map.get(test_name, {})
            story.append(Paragraph(f"{T['what_is']} <font color='#{C_BLUE.hexval()[2:]}'><b>{test_name}</b></font>?", param_title))

            reason = card.get("reason", t.get("explanation", ""))
            if reason:
                story.append(Paragraph(f"• {T['means_for_you']}: {reason}", bullet_style))
            else:
                s = t.get("status", "Normal").upper()
                direction = "High" if s in ("HIGH", "CRITICAL") else "Low"
                story.append(Paragraph(
                    f"• What this means for you: A {direction.lower()} {test_name} level has been detected. "
                    "Please discuss this with your doctor.",
                    bullet_style
                ))

        story.append(Spacer(1, 12))

    # ── Questions to Ask Your Doctor ──────────────────────────────────────────────
    questions = []
    if abnormal_tests:
        ab_joined = ", ".join(list(abnormal_tests.keys())[:6])
        if len(abnormal_tests) > 6:
            ab_joined += " and others"
        questions = [
            f"What does it mean that my {ab_joined} values are slightly off?",
            "Are there any simple changes to my diet or daily routine that could help?",
            "When should I schedule my next follow-up test?",
        ]

    if questions:
        story.append(HRFlowable(width="100%", thickness=0.5, color=C_DIVIDER, spaceAfter=8))
        story.append(Paragraph(T["questions_title"], section_title))
        for q in questions:
            story.append(Paragraph(f"• {q}", bullet_style))
        story.append(Spacer(1, 12))

    # ── Footer Disclaimer ─────────────────────────────────────────────────────────
    story.append(HRFlowable(width="100%", thickness=0.5, color=C_DIVIDER, spaceAfter=6))
    story.append(Paragraph(
        T["disclaimer_note"],
        small_style
    ))

    doc.build(story)
    return buffer.getvalue()

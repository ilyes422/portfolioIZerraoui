"""Compose le CV public à partir des seules données approuvées."""

import json
from pathlib import Path
from xml.sax.saxutils import escape

from reportlab.lib import colors
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import ParagraphStyle, getSampleStyleSheet
from reportlab.platypus import Paragraph, SimpleDocTemplate, Spacer

ROOT = Path(__file__).resolve().parents[1]
PROFILE = json.loads((ROOT / "content/profile.json").read_text(encoding="utf-8"))
RESUME = json.loads((ROOT / "content/resume.json").read_text(encoding="utf-8"))
DESTINATION = ROOT / "apps/web/public/documents/cv-ilyes-zerraoui.pdf"


def generate() -> None:
    DESTINATION.parent.mkdir(parents=True, exist_ok=True)
    styles = getSampleStyleSheet()
    styles.add(ParagraphStyle("ResumeName", fontName="Helvetica-Bold", fontSize=28, leading=33, textColor=colors.HexColor("#0b2027")))
    styles.add(ParagraphStyle("ResumeRole", fontName="Helvetica", fontSize=13, leading=19, textColor=colors.HexColor("#087557")))
    styles.add(ParagraphStyle("ResumeSection", fontName="Helvetica-Bold", fontSize=11, leading=16, spaceBefore=12, spaceAfter=5, textColor=colors.HexColor("#087557")))
    styles.add(ParagraphStyle("ResumeLine", fontName="Helvetica", fontSize=9.5, leading=13, spaceAfter=3, textColor=colors.HexColor("#1c3039")))
    styles.add(ParagraphStyle("ResumeSmall", fontName="Helvetica", fontSize=9, leading=12, textColor=colors.HexColor("#526576")))

    def paragraph(text: str, style: str = "ResumeLine"):
        return Paragraph(text.replace("–", "-").replace("—", "-"), styles[style])

    story = [
        paragraph(escape(PROFILE["name"]), "ResumeName"),
        paragraph(escape(PROFILE["headline"]), "ResumeRole"),
        paragraph(escape(f'{PROFILE["email"]}  ·  {PROFILE["phoneLabel"]}  ·  {PROFILE["city"]}'), "ResumeSmall"),
        Spacer(1, 10),
        paragraph(escape(RESUME["summary"])),
        paragraph("EXPÉRIENCES", "ResumeSection"),
    ]
    for entry in RESUME["experience"]:
        story.append(paragraph(f'<b>{escape(entry["role"])} · {escape(entry["organization"])}</b>'))
        story.append(paragraph(escape(entry["period"]), "ResumeSmall"))
        for task in entry["tasks"]:
            story.append(paragraph(f"• {escape(task)}"))
        story.append(Spacer(1, 4))

    story.append(paragraph("FORMATIONS", "ResumeSection"))
    for entry in RESUME["education"]:
        story.append(paragraph(f'<b>{escape(entry["title"])}</b> · {escape(entry["period"])}'))
        story.append(paragraph(escape(entry["school"]), "ResumeSmall"))

    story.append(paragraph("COMPÉTENCES ET LANGUES", "ResumeSection"))
    for entry in RESUME["skills"]:
        story.append(paragraph(f'<b>{escape(entry["category"])}</b> · {escape(", ".join(entry["items"]))}'))
    story.append(paragraph(escape("  |  ".join(RESUME["languages"]))))
    document = SimpleDocTemplate(
        str(DESTINATION), pagesize=A4, leftMargin=43, rightMargin=43,
        topMargin=35, bottomMargin=35, title="CV public - Ilyes Zerraoui", author=PROFILE["name"],
    )
    document.build(story)
    print(DESTINATION)


if __name__ == "__main__":
    generate()

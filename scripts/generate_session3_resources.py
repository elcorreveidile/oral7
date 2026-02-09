#!/usr/bin/env python3

from __future__ import annotations

import os
from datetime import date

from reportlab.lib import colors
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import ParagraphStyle, getSampleStyleSheet
from reportlab.lib.units import cm
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, PageBreak


ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
OUT_DIR = os.path.join(ROOT, "public", "resources")


def ensure_out_dir() -> None:
    os.makedirs(OUT_DIR, exist_ok=True)


def build_opinion_formulas_pdf(out_path: str) -> None:
    styles = getSampleStyleSheet()

    h1 = ParagraphStyle(
        "H1",
        parent=styles["Title"],
        fontName="Helvetica-Bold",
        fontSize=18,
        leading=22,
        textColor=colors.HexColor("#111827"),
        spaceAfter=10,
    )
    h2 = ParagraphStyle(
        "H2",
        parent=styles["Heading2"],
        fontName="Helvetica-Bold",
        fontSize=13,
        leading=16,
        textColor=colors.HexColor("#111827"),
        spaceBefore=10,
        spaceAfter=6,
    )
    p = ParagraphStyle(
        "P",
        parent=styles["Normal"],
        fontName="Helvetica",
        fontSize=10.5,
        leading=14,
        textColor=colors.HexColor("#111827"),
    )
    small = ParagraphStyle(
        "Small",
        parent=p,
        fontSize=9.5,
        leading=12,
        textColor=colors.HexColor("#374151"),
    )

    doc = SimpleDocTemplate(
        out_path,
        pagesize=A4,
        leftMargin=1.6 * cm,
        rightMargin=1.6 * cm,
        topMargin=1.5 * cm,
        bottomMargin=1.5 * cm,
        title="Formulas para dar opinion (C1)",
        author="oral7",
    )

    story = []
    story.append(Paragraph("Fórmulas para dar opinión (C1)", h1))
    story.append(Paragraph(f"Actualizado: {date.today().isoformat()}", small))
    story.append(Spacer(1, 10))

    story.append(Paragraph("1) Opinión personal (neutral)", h2))
    neutral = [
        ("Desde mi punto de vista...", "Desde mi punto de vista, la educación debe ser gratuita."),
        ("En mi opinión (personal)...", "En mi opinión, es un derecho fundamental."),
        ("Me parece que...", "Me parece que aún faltan datos para decidir."),
        ("Considero que...", "Considero que es una medida razonable."),
        ("Tengo la impresión de que...", "Tengo la impresión de que algo falta en este planteamiento."),
        ("Si me permiten mi opinión...", "Si me permiten mi opinión, deberíamos priorizar la prevención."),
        ("A mi juicio...", "A mi juicio, el coste es asumible."),
        ("Diría que...", "Diría que el problema principal es la falta de coordinación."),
    ]

    rows = [[Paragraph("<b>Fórmula</b>", p), Paragraph("<b>Ejemplo</b>", p)]]
    for f, ex in neutral:
        rows.append([Paragraph(f, p), Paragraph(ex, p)])
    t = Table(rows, colWidths=[6.0 * cm, 10.4 * cm], repeatRows=1)
    t.setStyle(
        TableStyle(
            [
                ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#eef2ff")),
                ("GRID", (0, 0), (-1, -1), 0.5, colors.HexColor("#d1d5db")),
                ("VALIGN", (0, 0), (-1, -1), "TOP"),
                ("LEFTPADDING", (0, 0), (-1, -1), 6),
                ("RIGHTPADDING", (0, 0), (-1, -1), 6),
                ("TOPPADDING", (0, 0), (-1, -1), 6),
                ("BOTTOMPADDING", (0, 0), (-1, -1), 6),
            ]
        )
    )
    story.append(t)

    story.append(Paragraph("2) Grado de certeza (modalizadores)", h2))
    story.append(
        Paragraph(
            "Elige la fórmula según tu nivel de seguridad: evita sonar tajante sin necesidad.",
            small,
        )
    )

    certainty = [
        ("Duda / posibilidad", "Es probable que llueva. Posiblemente lleguen tarde. Quizás sea mejor esperar."),
        ("Probabilidad media", "Es posible que haya errores. Puede que falte información. No descarto que sea cierto."),
        ("Alta certeza", "Estoy convencido de que tendrá éxito. No cabe duda de que es necesario. Es indudable que."),
        ("Cautela / matiz", "Hasta cierto punto... En parte... En gran medida... Depende del contexto."),
    ]
    rows2 = [[Paragraph("<b>Nivel</b>", p), Paragraph("<b>Ejemplos</b>", p)]]
    for lvl, ex in certainty:
        rows2.append([Paragraph(lvl, p), Paragraph(ex, p)])
    t2 = Table(rows2, colWidths=[4.6 * cm, 11.8 * cm], repeatRows=1)
    t2.setStyle(
        TableStyle(
            [
                ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#ecfeff")),
                ("GRID", (0, 0), (-1, -1), 0.5, colors.HexColor("#d1d5db")),
                ("VALIGN", (0, 0), (-1, -1), "TOP"),
                ("LEFTPADDING", (0, 0), (-1, -1), 6),
                ("RIGHTPADDING", (0, 0), (-1, -1), 6),
                ("TOPPADDING", (0, 0), (-1, -1), 6),
                ("BOTTOMPADDING", (0, 0), (-1, -1), 6),
            ]
        )
    )
    story.append(Spacer(1, 6))
    story.append(t2)

    story.append(PageBreak())

    story.append(Paragraph("3) Atribuir opiniones (fuentes)", h2))
    sources = [
        ("Según los expertos,...", "Según los expertos, el cambio climático es real."),
        ("De acuerdo con...", "De acuerdo con el informe, la tendencia es preocupante."),
        ("Como dijo X,...", "Como dijo el profesor, todo depende del contexto."),
        ("Se suele afirmar que...", "Se suele afirmar que la IA mejorará la productividad."),
    ]
    rows3 = [[Paragraph("<b>Estructura</b>", p), Paragraph("<b>Ejemplo</b>", p)]]
    for s, ex in sources:
        rows3.append([Paragraph(s, p), Paragraph(ex, p)])
    t3 = Table(rows3, colWidths=[5.4 * cm, 11.0 * cm], repeatRows=1)
    t3.setStyle(
        TableStyle(
            [
                ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#fef9c3")),
                ("GRID", (0, 0), (-1, -1), 0.5, colors.HexColor("#d1d5db")),
                ("VALIGN", (0, 0), (-1, -1), "TOP"),
                ("LEFTPADDING", (0, 0), (-1, -1), 6),
                ("RIGHTPADDING", (0, 0), (-1, -1), 6),
                ("TOPPADDING", (0, 0), (-1, -1), 6),
                ("BOTTOMPADDING", (0, 0), (-1, -1), 6),
            ]
        )
    )
    story.append(t3)

    story.append(Spacer(1, 10))
    story.append(
        Paragraph(
            "<b>Mini-modelo:</b> En mi opinión, la educación debe ser gratuita. "
            "Considero que es un derecho fundamental; además, beneficia al conjunto de la sociedad.",
            small,
        )
    )

    doc.build(story)


def build_role_cards_pdf(out_path: str) -> None:
    styles = getSampleStyleSheet()

    h1 = ParagraphStyle(
        "H1",
        parent=styles["Title"],
        fontName="Helvetica-Bold",
        fontSize=18,
        leading=22,
        textColor=colors.HexColor("#111827"),
        spaceAfter=10,
    )
    h2 = ParagraphStyle(
        "H2",
        parent=styles["Heading2"],
        fontName="Helvetica-Bold",
        fontSize=13,
        leading=16,
        textColor=colors.HexColor("#111827"),
        spaceBefore=10,
        spaceAfter=6,
    )
    p = ParagraphStyle(
        "P",
        parent=styles["Normal"],
        fontName="Helvetica",
        fontSize=10.5,
        leading=14,
        textColor=colors.HexColor("#111827"),
    )
    small = ParagraphStyle(
        "Small",
        parent=p,
        fontSize=9.5,
        leading=12,
        textColor=colors.HexColor("#374151"),
    )

    doc = SimpleDocTemplate(
        out_path,
        pagesize=A4,
        leftMargin=1.6 * cm,
        rightMargin=1.6 * cm,
        topMargin=1.5 * cm,
        bottomMargin=1.5 * cm,
        title="Tarjetas de rol: Etica de la IA",
        author="oral7",
    )

    story = []
    story.append(Paragraph('Tarjetas de rol: "¿Es ética la inteligencia artificial?"', h1))
    story.append(Paragraph("Debate guiado (15 min). Mantén tu rol durante toda la actividad.", small))
    story.append(Spacer(1, 10))

    story.append(Paragraph("Instrucciones rápidas", h2))
    story.append(
        Paragraph(
            "1. Cada persona recibe una tarjeta de rol. 2. El moderador abre el debate. "
            "3. Hablad por turnos breves (30-45 s). 4. Usad fórmulas de opinión y modalizadores.",
            p,
        )
    )
    story.append(Spacer(1, 10))

    roles = [
        (
            "Experto a favor",
            "Estás convencido de que la IA puede ser ética si se regula bien. Defiende beneficios (salud, educación, eficiencia).",
            [
                "Estoy convencido de que...",
                "No cabe duda de que...",
                "Es indudable que...",
                "A mi juicio, el beneficio supera el riesgo.",
            ],
            [
                "Estoy convencido de que tendrá éxito.",
                "No cabe duda de que es necesario regularla.",
            ],
        ),
        (
            "Experto en contra",
            "Te preocupan los riesgos: sesgos, vigilancia, pérdida de empleos, opacidad. Exige límites claros.",
            [
                "Me preocupa que...",
                "Es inaceptable que...",
                "No podemos permitir que...",
                "Aun así, reconozco que...",
            ],
            [
                "Me preocupa que no haya suficiente evidencia.",
                "Tengo la impresión de que algo falta.",
            ],
        ),
        (
            "Escéptico",
            "No te convence ninguna postura. Pides pruebas y ejemplos concretos. Señalas contradicciones.",
            [
                "Tengo mis dudas sobre...",
                "No estoy seguro de que...",
                "Puede que..., pero...",
                "Hasta cierto punto...",
            ],
            [
                "Tengo mis dudas sobre los datos disponibles.",
                "Posiblemente estemos simplificando el problema.",
            ],
        ),
        (
            "Moderador",
            "Organizas el turno de palabra, pides definiciones y equilibras el debate. Resumes al final.",
            [
                "Vamos a considerar...",
                "Para empezar, definamos...",
                "¿Podrías aclarar...?",
                "En resumen, hemos visto que...",
            ],
            [
                "Vamos a considerar primero los beneficios y luego los riesgos.",
                "En otras palabras, ¿qué propones exactamente?",
            ],
        ),
    ]

    def role_card(title: str, desc: str, stems: list[str], examples: list[str]) -> Table:
        lines = [
            Paragraph(f"<b>{title}</b>", p),
            Paragraph(desc, small),
            Spacer(1, 6),
            Paragraph("<b>Fórmulas recomendadas</b>", small),
            Paragraph("· " + "<br/>· ".join(stems), small),
            Spacer(1, 6),
            Paragraph("<b>Ejemplos</b>", small),
            Paragraph("· " + "<br/>· ".join(examples), small),
        ]
        t = Table([[lines]], colWidths=[16.4 * cm])
        t.setStyle(
            TableStyle(
                [
                    ("BOX", (0, 0), (-1, -1), 0.8, colors.HexColor("#d1d5db")),
                    ("BACKGROUND", (0, 0), (-1, -1), colors.HexColor("#f9fafb")),
                    ("LEFTPADDING", (0, 0), (-1, -1), 10),
                    ("RIGHTPADDING", (0, 0), (-1, -1), 10),
                    ("TOPPADDING", (0, 0), (-1, -1), 10),
                    ("BOTTOMPADDING", (0, 0), (-1, -1), 10),
                ]
            )
        )
        return t

    for i, (title, desc, stems, examples) in enumerate(roles):
        story.append(role_card(title, desc, stems, examples))
        story.append(Spacer(1, 10))
        if i == 1:
            # Split roughly mid-way for printing convenience.
            story.append(PageBreak())

    story.append(Paragraph("Extras (para subir nivel C1)", h2))
    story.append(
        Paragraph(
            "Añade al menos 2 de estas estrategias: reformular (\"Dicho de otro modo\"), "
            "matizar (\"en parte\"), conceder (\"aunque\"), y citar fuentes (\"según...\" ).",
            p,
        )
    )

    doc.build(story)


def main() -> int:
    ensure_out_dir()
    build_opinion_formulas_pdf(os.path.join(OUT_DIR, "session-3.pdf"))
    build_role_cards_pdf(os.path.join(OUT_DIR, "vocab-3.pdf"))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())


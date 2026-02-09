#!/usr/bin/env python3

from __future__ import annotations

import os
from datetime import date

from reportlab.lib import colors
from reportlab.lib.pagesizes import A4, landscape
from reportlab.lib.styles import ParagraphStyle, getSampleStyleSheet
from reportlab.lib.units import cm
from reportlab.platypus import (
    SimpleDocTemplate,
    Paragraph,
    Spacer,
    Table,
    TableStyle,
    PageBreak,
)


ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
OUT_DIR = os.path.join(ROOT, "public", "resources")


def ensure_out_dir() -> None:
    os.makedirs(OUT_DIR, exist_ok=True)


def build_connectors_poster_pdf(out_path: str) -> None:
    styles = getSampleStyleSheet()

    title = ParagraphStyle(
        "PosterTitle",
        parent=styles["Title"],
        fontName="Helvetica-Bold",
        fontSize=26,
        leading=30,
        textColor=colors.HexColor("#1f2937"),
        spaceAfter=10,
    )

    subtitle = ParagraphStyle(
        "PosterSubtitle",
        parent=styles["Normal"],
        fontName="Helvetica",
        fontSize=12,
        leading=15,
        textColor=colors.HexColor("#374151"),
        spaceAfter=14,
    )

    box_title = ParagraphStyle(
        "BoxTitle",
        parent=styles["Normal"],
        fontName="Helvetica-Bold",
        fontSize=12,
        leading=14,
        textColor=colors.HexColor("#111827"),
        spaceAfter=4,
    )

    box_body = ParagraphStyle(
        "BoxBody",
        parent=styles["Normal"],
        fontName="Helvetica",
        fontSize=11,
        leading=14,
        textColor=colors.HexColor("#111827"),
    )

    doc = SimpleDocTemplate(
        out_path,
        pagesize=landscape(A4),
        leftMargin=1.2 * cm,
        rightMargin=1.2 * cm,
        topMargin=1.0 * cm,
        bottomMargin=1.0 * cm,
        title="Conectores por funcion (poster)",
        author="oral7",
    )

    story = []
    story.append(Paragraph("Conectores por función", title))
    story.append(
        Paragraph(
            f"Clasificación orientativa (nivel C1). Actualizado: {date.today().isoformat()}",
            subtitle,
        )
    )

    # Requested groups + a few extra useful ones for C1.
    groups = [
        ("Estructuradores", "Para empezar; en primer lugar; por un lado... por otro lado; para terminar"),
        ("De orden", "En segundo lugar; a continuacion; seguidamente; por ultimo"),
        ("De adición", "Además; también; es más; asimismo; incluso"),
        ("De contraste", "Sin embargo; no obstante; por el contrario; en cambio; ahora bien"),
        ("De causa", "Porque; ya que; dado que; puesto que; debido a que"),
        ("De consecuencia", "Por lo tanto; así que; en consecuencia; por consiguiente; de ahí que"),
        ("De conclusión", "En conclusión; en definitiva; para resumir; en suma; en pocas palabras"),
        ("De ejemplificación", "Por ejemplo; en concreto; en particular; a modo de ejemplo"),
        ("De reformulación", "Es decir; dicho de otro modo; en otras palabras; mejor dicho"),
        ("De concesión", "Aunque; a pesar de (que); si bien; aun así"),
    ]

    def cell(title_txt: str, body_txt: str) -> Paragraph:
        html = f"<para><b>{title_txt}</b><br/>{body_txt}</para>"
        return Paragraph(html, box_body)

    # 2-column poster grid.
    left = groups[:5]
    right = groups[5:]
    rows = []
    for i in range(5):
        l = left[i]
        r = right[i]
        rows.append([cell(l[0], l[1]), cell(r[0], r[1])])

    tbl = Table(rows, colWidths=[13.2 * cm, 13.2 * cm], hAlign="LEFT")
    tbl.setStyle(
        TableStyle(
            [
                ("VALIGN", (0, 0), (-1, -1), "TOP"),
                ("LEFTPADDING", (0, 0), (-1, -1), 10),
                ("RIGHTPADDING", (0, 0), (-1, -1), 10),
                ("TOPPADDING", (0, 0), (-1, -1), 10),
                ("BOTTOMPADDING", (0, 0), (-1, -1), 10),
                ("GRID", (0, 0), (-1, -1), 0.5, colors.HexColor("#d1d5db")),
            ]
        )
    )

    # soft alternating backgrounds (row-wise)
    for r in range(5):
        bg = colors.HexColor("#f9fafb") if r % 2 == 0 else colors.HexColor("#ffffff")
        tbl.setStyle(TableStyle([("BACKGROUND", (0, r), (-1, r), bg)]))

    story.append(tbl)
    story.append(Spacer(1, 10))
    story.append(
        Paragraph(
            "<b>Consejo:</b> en registro formal, alterna conectores y evita muletillas (\"o sea\", \"es que\") salvo que busques un tono coloquial.",
            subtitle,
        )
    )

    doc.build(story)


def build_argumentation_vocab_pdf(out_path: str) -> None:
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
        title="Vocabulario de la argumentación",
        author="oral7",
    )

    story = []
    story.append(Paragraph("Vocabulario de la argumentación (C1)", h1))
    story.append(
        Paragraph(
            "Lista de verbos, sustantivos y adjetivos utiles para estructurar y defender ideas con claridad.",
            small,
        )
    )
    story.append(Spacer(1, 10))

    story.append(Paragraph("1) Terminos clave", h2))

    # Requested entries + some extra useful ones.
    entries = [
        ("Estructurar", "Verbo", "Organizar las partes de un discurso.", "Es importante estructurar bien tu argumentación."),
        ("Cohesionar", "Verbo", "Unir y relacionar las partes de un texto.", "Los conectores cohesionan el discurso."),
        ("Coherente", "Adjetivo", "Que mantiene lógica interna y conexión entre ideas.", "Su discurso fue coherente de principio a fin."),
        ("Matizar", "Verbo", "Suavizar o precisar una afirmación.", "Hay que matizar esta postura extrema."),
        ("Refutar", "Verbo", "Contradecir un argumento con razones.", "Es difícil refutar su conclusión."),
        ("Sostener", "Verbo", "Mantener o defender una opinión.", "Sostengo que esta medida es necesaria."),
        ("Contundente", "Adjetivo", "Que tiene fuerza y convence.", "Su argumento fue muy contundente."),
        ("Plantear", "Verbo", "Presentar una idea o un problema para debatir.", "Quisiera plantear una cuestión previa."),
        ("Justificar", "Verbo", "Dar razones que apoyan una postura.", "Debe justificar su opinión con ejemplos."),
        ("Respaldar", "Verbo", "Apoyar con datos, evidencia o autoridad.", "Sus datos respaldan la tesis principal."),
        ("Contraargumento", "Sustantivo", "Argumento que responde a otro en sentido contrario.", "Tu contraargumento es valido, pero..."),
        ("Evidencia", "Sustantivo", "Dato, prueba o hecho que apoya una conclusion.", "No hay evidencia suficiente para afirmarlo."),
        ("Falaz", "Adjetivo", "Que parece válido, pero es engañoso.", "Ese razonamiento es falaz."),
        ("Sólido", "Adjetivo", "Bien fundamentado y difícil de rebatir.", "Presento una razón sólida."),
    ]

    header = [Paragraph("<b>Palabra</b>", p), Paragraph("<b>Categoria</b>", p), Paragraph("<b>Definicion</b>", p), Paragraph("<b>Ejemplo</b>", p)]
    rows = [header]
    for term, cat, defin, ex in entries:
        rows.append([Paragraph(term, p), Paragraph(cat, p), Paragraph(defin, p), Paragraph(ex, p)])

    t = Table(rows, colWidths=[3.2 * cm, 2.6 * cm, 6.2 * cm, 5.6 * cm], repeatRows=1)
    t.setStyle(
        TableStyle(
            [
                ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#eef2ff")),
                ("TEXTCOLOR", (0, 0), (-1, 0), colors.HexColor("#111827")),
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

    story.append(PageBreak())

    story.append(Paragraph("2) Expresiones utiles", h2))

    exprs = [
        ("Por un lado... por otro lado", "Presenta dos aspectos contrastivos.", "Muy común en argumentación."),
        ("Dicho de otro modo", "Reformula una idea.", "Para clarificar o repetir."),
        ("En otras palabras", "Expresa lo mismo de forma diferente.", "Clarificación."),
        ("Huelga decir que", "Introduce una idea obvia.", "Registro formal."),
        ("Conviene subrayar que", "Destaca un punto importante.", "Formal, presentaciones."),
        ("A mi juicio / En mi opinión", "Introduce una valoración personal.", "Neutral, muy útil."),
        ("Ahora bien", "Marca un giro o matiz.", "Formal, excelente para debates."),
        ("En resumen / En síntesis", "Cierra recapitulando.", "Para concluir con orden."),
        ("Dicho esto", "Cambia de fase o introduce consecuencia.", "Transición clara."),
        ("Aun así", "Concesión (a pesar de lo anterior).", "Muy útil para equilibrar."),
    ]

    rows = [[Paragraph("<b>Expresion</b>", p), Paragraph("<b>Funcion</b>", p), Paragraph("<b>Uso</b>", p)]]
    for e, f, u in exprs:
        rows.append([Paragraph(e, p), Paragraph(f, p), Paragraph(u, p)])
    t2 = Table(rows, colWidths=[5.0 * cm, 7.2 * cm, 5.4 * cm], repeatRows=1)
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
    story.append(t2)
    story.append(Spacer(1, 12))

    story.append(
        Paragraph(
            "<b>Tip C1:</b> combina conectores con matizadores (\"en parte\", \"hasta cierto punto\", \"en gran medida\") para sonar más preciso.",
            small,
        )
    )

    doc.build(story)


def main() -> int:
    ensure_out_dir()

    build_connectors_poster_pdf(os.path.join(OUT_DIR, "conectores-tabla.pdf"))
    build_argumentation_vocab_pdf(os.path.join(OUT_DIR, "ejercicios-conectores.pdf"))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())

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


def build_intercultural_disagreement_pdf(out_path: str) -> None:
    """Genera un PDF sobre la pragmática intercultural del desacuerdo."""
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
    warning = ParagraphStyle(
        "Warning",
        parent=p,
        fontName="Helvetica-Oblique",
        fontSize=10,
        leading=13,
        textColor=colors.HexColor("#dc2626"),
    )

    doc = SimpleDocTemplate(
        out_path,
        pagesize=A4,
        leftMargin=1.6 * cm,
        rightMargin=1.6 * cm,
        topMargin=1.5 * cm,
        bottomMargin=1.5 * cm,
        title="Pragmatica del desacuerdo intercultural",
        author="oral7",
    )

    story = []
    story.append(Paragraph("La Pragmática del Desacuerdo Intercultural (C1)", h1))
    story.append(
        Paragraph(
            "Cómo diferentes culturas expresan el desacuerdo y cómo navegar estas diferencias en español.",
            small,
        )
    )
    story.append(Spacer(1, 8))
    story.append(Paragraph(f"Actualizado: {date.today().isoformat()}", small))
    story.append(Spacer(1, 12))

    # Introducción
    story.append(Paragraph("¿Por qué importa la cultura?", h2))
    story.append(
        Paragraph(
            "El desacuerdo no se expresa igual en todas las culturas. Lo que puede parecer "
            "<i>educado</i> en una cultura, puede sonar <i>cobard e</i> o <i>agresivo</i> en otra. "
            "Como hablante de español nivel C1, necesitas adaptarte no solo al registro, "
            "sino también a las normas culturales de tu interlocutor.",
            p,
        )
    )
    story.append(Spacer(1, 12))

    # Tabla comparativa
    story.append(Paragraph("1) Comparación intercultural del desacuerdo", h2))

    cultures = [
        ("España", "Directo", "Menos protocolo", "Expreso mi desacuerdo con claridad. No lo veo así."),
        ("Latinoamérica", "Semi-directo", "Más cortés, cálidos", "Con todo respeto, pienso diferente."),
        ("Asia (China, Japón)", "Muy indirecto", "Preservar la armonía", "Necesito reflexionar más sobre esto."),
        ("Países nórdicos", "Directo", "No confrontacional", "Tengo otra opinión sobre este tema."),
        ("EE.UU. (formal)", "Semi-directo", "Profesional pero positivo", "I see it differently (Lo veo de otra forma)."),
        ("Mundo árabe", "Indirecto", "Mucho énfasis en cortesía", "Quizás haya otros puntos a considerar."),
    ]

    header = [
        Paragraph("<b>Cultura/Región</b>", p),
        Paragraph("<b>Grado de directez</b>", p),
        Paragraph("<b>Características</b>", p),
        Paragraph("<b>Ejemplo de desacuerdo</b>", p),
    ]
    rows = [header]
    for cult, direc, caract, ej in cultures:
        rows.append([Paragraph(cult, p), Paragraph(direc, p), Paragraph(caract, p), Paragraph(ej, p)])

    t = Table(rows, colWidths=[3.8 * cm, 3.2 * cm, 4.8 * cm, 4.6 * cm], repeatRows=1)
    t.setStyle(
        TableStyle(
            [
                ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#eef2ff")),
                ("TEXTCOLOR", (0, 0), (-1, 0), colors.HexColor("#111827")),
                ("GRID", (0, 0), (-1, -1), 0.5, colors.HexColor("#d1d5db")),
                ("VALIGN", (0, 0), (-1, -1), "TOP"),
                ("LEFTPADDING", (0, 0), (-1, -1), 5),
                ("RIGHTPADDING", (0, 0), (-1, -1), 5),
                ("TOPPADDING", (0, 0), (-1, -1), 5),
                ("BOTTOMPADDING", (0, 0), (-1, -1), 5),
            ]
        )
    )
    story.append(t)
    story.append(Spacer(1, 12))

    # Errores comunes
    story.append(Paragraph("2) Errores comunes por transferencia cultural", h2))

    errores = [
        ("Estudiantes de Asia",
         "Demasiado indirecto",
         "No dejan claro su desacuerdo",
         "Creen que 'entiendo, pero...' es educado, pero en español puede sonar a que no tienen opinión."),
        ("Estudiantes de EE.UU./UK",
         "Demasiado directos",
         "Pueden sonar agresivos",
         "Usan 'I disagree' traducido literalmente sin suavizadores previos."),
        ("Estudiantes de Alemania/Países nórdicos",
         "Muy directos",
         "Parecen confrontacionales",
         "Van directo al punto sin 'entiendo', 'veo', etc. antes del desacuerdo."),
        ("Estudiantes de Latinoamérica",
         "A veces excesivamente corteses",
         "Pueden sonar evasivos",
         "Usan tantas fórmulas de cortesía que el mensaje se pierde."),
    ]

    rows2 = [[Paragraph("<b>Origen</b>", p), Paragraph("<b>Error</b>", p), Paragraph("<b>Efecto</b>", p), Paragraph("<b>Explicación</b>", p)]]
    for orig, err, efec, expl in errores:
        rows2.append([Paragraph(orig, p), Paragraph(err, p), Paragraph(efec, p), Paragraph(expl, p)])

    t2 = Table(rows2, colWidths=[3.6 * cm, 3.4 * cm, 3.4 * cm, 6.0 * cm], repeatRows=1)
    t2.setStyle(
        TableStyle(
            [
                ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#fef3c7")),
                ("GRID", (0, 0), (-1, -1), 0.5, colors.HexColor("#d1d5db")),
                ("VALIGN", (0, 0), (-1, -1), "TOP"),
                ("LEFTPADDING", (0, 0), (-1, -1), 5),
                ("RIGHTPADDING", (0, 0), (-1, -1), 5),
                ("TOPPADDING", (0, 0), (-1, -1), 5),
                ("BOTTOMPADDING", (0, 0), (-1, -1), 5),
            ]
        )
    )
    story.append(t2)
    story.append(Spacer(1, 12))

    story.append(PageBreak())

    # Estrategias para hispanohablantes
    story.append(Paragraph("3) Estrategias según tu cultura de origen", h2))

    story.append(Paragraph("<b>Si vienes de una cultura de alta indirectez (Asia, mundo árabe):</b>", p))
    indirect_tips = [
        ("Usa suavizadores pero sé claro", "Entiendo tu punto, pero no estoy de acuerdo con..."),
        ("No tengas miedo de discrepar", "Me permito disentir en este aspecto concreto."),
        ("Practica el 'no' directo cuando sea necesario", "No creo que esa sea la mejor opción."),
    ]
    for tip, ex in indirect_tips:
        story.append(Paragraph(f"• <b>{tip}:</b> {ex}", small))
    story.append(Spacer(1, 8))

    story.append(Paragraph("<b>Si vienes de una cultura de alta directez (EE.UU., Alemania, norte de Europa):</b>", p))
    direct_tips = [
        ("Añade siempre reconocimiento previo", "Entiendo lo que dices, sin embargo..."),
        ("Evita el 'no' como primera palabra", "Lo veo de otra forma... / Tengo otra perspectiva..."),
        ("Usa fórmulas de cortesía en contexto formal", "Con todo respeto, disiento de..."),
    ]
    for tip, ex in direct_tips:
        story.append(Paragraph(f"• <b>{tip}:</b> {ex}", small))
    story.append(Spacer(1, 8))

    story.append(Paragraph("<b>Si eres hispanohablante nativo:</b>", p))
    native_tips = [
        ("Adapta tu nivel de directez", "En España puedes ser más directo; en LATAM, más cortés."),
        ("Ten en cuenta a tu interlocutor", "¿Es nativo? ¿De qué cultura viene?"),
        ("Modela tu desacuerdo según la situación", "Formal: más suavizado; Informal: más natural."),
    ]
    for tip, ex in native_tips:
        story.append(Paragraph(f"• <b>{tip}:</b> {ex}", small))
    story.append(Spacer(1, 12))

    # Fórmulas recomendadas
    story.append(Paragraph("4) Fórmulas universales de desacuerdo cortés", h2))

    universal_formulas = [
        ("Para empezar (reconocimiento)", "Entiendo tu punto de vista / Veo lo que quieres decir / Reconozco que..."),
        ("Para matizar (suavizar)", "Hasta cierto punto / En parte / En gran medida, pero..."),
        ("Para discrepar (desacuerdo)", "Lo veo de otra forma / Tengo otra opinión / Me permito disentir"),
        ("Para cerrar (respeto)", "Aunque no estamos de acuerdo, valoro tu opinión / Respeto tu postura"),
    ]

    for cat, forms in universal_formulas:
        story.append(Paragraph(f"<b>{cat}:</b>", small))
        story.append(Paragraph(forms, small))
        story.append(Spacer(1, 4))
    story.append(Spacer(1, 8))

    # Casos específicos España vs LATAM
    story.append(Paragraph("5) España vs Latinoamérica: matices importantes", h2))

    spain_latam = [
        ("Contexto formal",
         "España: más directo, menos protocolo",
         "LATAM: más cortés, más fórmulas de respeto"),
        ("Con superiores",
         "España: 'No estoy de acuerdo' (aceptable)",
         "LATAM: 'Con todo respeto, pienso diferente'"),
        ("Entre iguales",
         "España: 'No lo veo así' (normal)",
         "LATAM: 'Te entiendo, pero...' (más suave)"),
        ("En debates académicos",
         "España: 'Disiento de esa afirmación'",
         "LATAM: 'Permítame una opinión diferente'"),
    ]

    for ctx, esp, lat in spain_latam:
        story.append(Paragraph(f"<b>{ctx}:</b>", p))
        story.append(Paragraph(f"• {esp}", small))
        story.append(Paragraph(f"• {lat}", small))
        story.append(Spacer(1, 4))

    story.append(Spacer(1, 10))

    # Consejos finales
    story.append(Paragraph("Consejos para alcanzar nivel C1", h2))
    final_tips = [
        "<b>Observa</b> cómo expresan desacuerdo los nativos en diferentes contextos.",
        "<b>Pregunta</b> a nativos: '¿Cómo dirías que...?' para obtener fórmulas naturales.",
        "<b>Evita</b> traducir literalmente expresiones de tu lengua materna.",
        "<b>Adáptate</b> tanto al registro (formal/informal) como a la cultura de tu interlocutor.",
        "<b>Practica</b> el reconocimiento antes del desacuerdo ('Entiendo, pero...').",
    ]
    for tip in final_tips:
        story.append(Paragraph(f"• {tip}", small))

    story.append(Spacer(1, 12))
    story.append(
        Paragraph(
            "<b>Nota:</b> Estas son pautas generales. Siempre hay variaciones individuales. "
            "Lo más importante es la <i>observación</i> y la <i>adaptación</i> al contexto específico.",
            small,
        )
    )

    doc.build(story)


def main() -> int:
    ensure_out_dir()
    build_intercultural_disagreement_pdf(
        os.path.join(OUT_DIR, "desacuerdo-intercultural.pdf")
    )
    return 0


if __name__ == "__main__":
    raise SystemExit(main())

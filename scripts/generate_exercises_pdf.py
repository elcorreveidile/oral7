#!/usr/bin/env python3
"""
Generador de PDF de Ejercicios de Contraargumentación
Sesión 6 - Plataforma de Español C1
"""

from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import cm
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, PageBreak
from reportlab.lib.enums import TA_CENTER, TA_LEFT, TA_JUSTIFY
from reportlab.lib import colors

# Configuración del PDF
OUTPUT_FILE = "public/resources/ejercicios-contraargumentacion.pdf"

def create_styles():
    """Crea los estilos para el documento"""
    styles = getSampleStyleSheet()

    # Custom style names to avoid conflicts
    # Estilo título principal
    if 'CustomTitle' not in styles:
        styles.add(ParagraphStyle(
            name='CustomTitle',
            parent=styles['Title'],
            fontSize=20,
            textColor=colors.HexColor('#1e40af'),
            spaceAfter=0.5*cm,
            alignment=TA_CENTER,
            fontName='Helvetica-Bold'
        ))

    # Estilo subtítulo
    if 'CustomSubtitle' not in styles:
        styles.add(ParagraphStyle(
            name='CustomSubtitle',
            parent=styles['Heading2'],
            fontSize=14,
            textColor=colors.HexColor('#64748b'),
            spaceAfter=1*cm,
            alignment=TA_CENTER,
            fontName='Helvetica'
        ))

    # Estilo encabezado de sección
    if 'SectionHeader' not in styles:
        styles.add(ParagraphStyle(
            name='SectionHeader',
            parent=styles['Heading2'],
            fontSize=14,
            textColor=colors.HexColor('#1e40af'),
            spaceBefore=0.8*cm,
            spaceAfter=0.4*cm,
            fontName='Helvetica-Bold'
        ))

    # Estillo sub-encabezado
    if 'SubsectionHeader' not in styles:
        styles.add(ParagraphStyle(
            name='SubsectionHeader',
            parent=styles['Heading3'],
            fontSize=12,
            textColor=colors.HexColor('#334155'),
            spaceBefore=0.5*cm,
            spaceAfter=0.3*cm,
            fontName='Helvetica-Bold'
        ))

    # Estilo normal justificado
    if 'BodyJustified' not in styles:
        styles.add(ParagraphStyle(
            name='BodyJustified',
            parent=styles['BodyText'],
            fontSize=11,
            alignment=TA_JUSTIFY,
            spaceAfter=0.3*cm,
            fontName='Helvetica'
        ))

    # Estilo instrucciones
    if 'Instructions' not in styles:
        styles.add(ParagraphStyle(
            name='Instructions',
            parent=styles['BodyText'],
            fontSize=10,
            textColor=colors.HexColor('#475569'),
            spaceBefore=0.2*cm,
            spaceAfter=0.2*cm,
            fontName='Helvetica-Oblique',
            alignment=TA_LEFT
        ))

    # Estilo ejemplo
    if 'Example' not in styles:
        styles.add(ParagraphStyle(
            name='Example',
            parent=styles['BodyText'],
            fontSize=10,
            textColor=colors.HexColor('#059669'),
            leftIndent=0.5*cm,
            spaceBefore=0.2*cm,
            spaceAfter=0.2*cm,
            fontName='Helvetica',
            alignment=TA_JUSTIFY
        ))

    # Estilo espacio para respuesta
    if 'AnswerSpace' not in styles:
        styles.add(ParagraphStyle(
            name='AnswerSpace',
            parent=styles['BodyText'],
            fontSize=9,
            textColor=colors.HexColor('#94a3b8'),
            leftIndent=0.5*cm,
            spaceBefore=0.3*cm,
            spaceAfter=0.3*cm,
            fontName='Helvetica-Oblique'
        ))

    return styles

def create_header():
    """Crea el encabezado del documento"""
    story = []
    styles = create_styles()

    story.append(Paragraph("EJERCICIOS DE CONTRAARGUMENTACIÓN", styles['CustomTitle']))
    story.append(Paragraph("Sesión 6 - Español C1: Argumentación Formal", styles['CustomSubtitle']))
    story.append(Spacer(1, 1*cm))

    return story

def ejercicio1_completa_contraargumentacion(story, styles):
    """Ejercicio 1: Completa la contraargumentación"""
    story.append(Paragraph("EJERCICIO 1: COMPLETA LA CONTRAARGUMENTACIÓN", styles['SectionHeader']))
    story.append(Paragraph("Instrucciones:", styles['SubsectionHeader']))
    story.append(Paragraph("Completa cada oración con el conector de contraargumentación más apropiado.", styles['BodyJustified']))
    story.append(Spacer(1, 0.3*cm))

    # Tabla de ejercicios
    data = [
        ["", "Ejercicio", "Espacio para respuesta"],
        ["1", "Es cierto que el plan es caro. __________, es necesario.", ""],
        ["2", "__________ es verdad que llueve mucho, me gusta este clima.", ""],
        ["3", "A __________ de las dificultades, seguiremos adelante.", ""],
        ["4", "Tiene su razón. __________, mantengo mi postura.", ""],
        ["5", "El proyecto es complejo. __________, es la mejor opción.", ""],
        ["6", "__________ algunos lo critican, los datos demuestran lo contrario.", ""],
        ["7", "Es verdad que requiere tiempo. __________, vale la pena.", ""],
        ["8", "__________ los riesgos, la inversión es segura.", ""],
        ["9", "Entiendo tu punto. __________, no puedo estar de acuerdo.", ""],
        ["10", "El sistema tiene fallos. __________, funciona correctamente.", ""],
    ]

    table = Table(data, colWidths=[0.5*cm, 10*cm, 4.5*cm])
    table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#1e40af')),
        ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
        ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
        ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
        ('FONTSIZE', (0, 0), (-1, 0), 10),
        ('FONTNAME', (0, 1), (-1, -1), 'Helvetica'),
        ('FONTSIZE', (0, 1), (-1, -1), 9),
        ('BOTTOMPADDING', (0, 0), (-1, 0), 8),
        ('TOPPADDING', (0, 1), (-1, -1), 8),
        ('BOTTOMPADDING', (0, 1), (-1, -1), 8),
        ('GRID', (0, 0), (-1, -1), 0.5, colors.grey),
        ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.whitesmoke, colors.white]),
    ]))

    story.append(table)
    story.append(Spacer(1, 0.5*cm))

    # Soluciones
    story.append(Paragraph("Soluciones sugeridas:", styles['SubsectionHeader']))
    soluciones = [
        ("1", "sin embargo / no obstante"),
        ("2", "Aunque / Si bien"),
        ("3", "pesar"),
        ("4", "Con todo / No obstante"),
        ("5", "Sin embargo / No obstante"),
        ("6", "Aunque / A pesar de que"),
        ("7", "Sin embargo / No obstante"),
        ("8", "A pesar de / Pese a"),
        ("9", "No obstante / Con todo"),
        ("10", "Sin embargo / No obstante"),
    ]

    for num, sol in soluciones:
        story.append(Paragraph(f"<b>{num}.</b> {sol}", styles['Example']))

    story.append(Spacer(1, 0.5*cm))

def ejercicio2_identifica_estructura(story, styles):
    """Ejercicio 2: Identifica la estructura"""
    story.append(Paragraph("EJERCICIO 2: IDENTIFICA LA ESTRUCTURA", styles['SectionHeader']))
    story.append(Paragraph("Instrucciones:", styles['SubsectionHeader']))
    story.append(Paragraph("Lee la siguiente contraargumentación e identifica sus partes:", styles['BodyJustified']))
    story.append(Spacer(1, 0.3*cm))

    story.append(Paragraph("<b>Contraargumento:</b>", styles['BodyJustified']))
    story.append(Paragraph("«Es cierto que las redes sociales pueden crear adicción y consumir mucho tiempo. No obstante, también nos permiten mantener contacto con personas que están lejos y acceder a información instantánea. Por lo tanto, el problema no es la tecnología en sí, sino el uso que hacemos de ella.»", styles['Example']))
    story.append(Spacer(1, 0.3*cm))

    data = [
        ["Parte", "Identificación", "¿Qué dice el texto?"],
        ["1. CONCESIÓN", "", ""],
        ["2. PIVOTE", "", ""],
        ["3. REFUTACIÓN", "", ""],
        ["4. REFUERZO", "", ""],
    ]

    table = Table(data, colWidths=[4*cm, 3*cm, 7.5*cm])
    table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#1e40af')),
        ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
        ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
        ('VALIGN', (0, 0), (-1, -1), 'TOP'),
        ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
        ('FONTSIZE', (0, 0), (-1, 0), 10),
        ('FONTNAME', (0, 1), (-1, -1), 'Helvetica'),
        ('FONTSIZE', (0, 1), (-1, -1), 9),
        ('BOTTOMPADDING', (0, 0), (-1, 0), 8),
        ('TOPPADDING', (0, 1), (-1, -1), 10),
        ('BOTTOMPADDING', (0, 1), (-1, -1), 10),
        ('GRID', (0, 0), (-1, -1), 0.5, colors.grey),
        ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.whitesmoke, colors.white]),
    ]))

    story.append(table)
    story.append(Spacer(1, 0.3*cm))

    story.append(Paragraph("Solución:", styles['SubsectionHeader']))
    story.append(Paragraph("<b>1. CONCESIÓN:</b> «Es cierto que las redes sociales pueden crear adicción y consumir mucho tiempo»", styles['Example']))
    story.append(Paragraph("<b>2. PIVOTE:</b> «No obstante»", styles['Example']))
    story.append(Paragraph("<b>3. REFUTACIÓN:</b> «también nos permiten mantener contacto con personas que están lejos y acceder a información instantánea»", styles['Example']))
    story.append(Paragraph("<b>4. REFUERZO:</b> «Por lo tanto, el problema no es la tecnología en sí, sino el uso que hacemos de ella»", styles['Example']))

    story.append(Spacer(1, 0.5*cm))

def ejercicio3_contraargumenta_tu_mismo(story, styles):
    """Ejercicio 3: Contraargumenta tú mismo"""
    story.append(Paragraph("EJERCICIO 3: CONTRAARGUMENTA TÚ MISMO", styles['SectionHeader']))
    story.append(Paragraph("Instrucciones:", styles['SubsectionHeader']))
    story.append(Paragraph("Usa la estructura completa (CONCESIÓN → PIVOTE → REFUTACIÓN → REFUERZO) para contraargumentar los siguientes argumentos:", styles['BodyJustified']))
    story.append(Spacer(1, 0.3*cm))

    temas = [
        {
            "argumento": "«El teletrabajo debe prohibirse porque destruye la cultura empresarial.»",
            "ayuda": "Concesión: reconoce un aspecto negativo del teletrabajo. Pivote: usa sin embargo/no obstante. Refutación: beneficios del teletrabajo. Refuerzo: conclusión matizada."
        },
        {
            "argumento": "«La energía nuclear es demasiado peligrosa y debería eliminarse.»",
            "ayuda": "Concesión: reconoce los riesgos. Pivote: a pesar de/sin embargo. Refutación: ventajas (energía limpia, eficiente). Refuerzo: postura equilibrada."
        },
        {
            "argumento": "«Los videojuegos son una pérdida de tiempo y fomentan la violencia.»",
            "ayuda": "Concesión: admite posibles problemas. Pivote: no obstante/con todo. Refutación: beneficios cognitivos, sociales. Refuerzo: depende del uso."
        },
        {
            "argumento": "«El turismo masivo destruye las ciudades locales y debería limitarse drásticamente.»",
            "ayuda": "Concesión: impactos negativos reconocidos. Pivote: si bien/a pesar de. Refutación: beneficios económicos, culturales. Refuerzo: turismo sostenible."
        },
    ]

    for i, tema in enumerate(temas, 1):
        story.append(Paragraph(f"<b>Argumento {i}:</b> {tema['argumento']}", styles['BodyJustified']))
        story.append(Paragraph(f"<i>Pista:</i> {tema['ayuda']}", styles['Instructions']))

        # Espacio para escribir
        story.append(Paragraph("Mi contraargumento:", styles['AnswerSpace']))
        story.append(Paragraph("_" * 80, styles['AnswerSpace']))
        story.append(Paragraph("_" * 80, styles['AnswerSpace']))
        story.append(Paragraph("_" * 80, styles['AnswerSpace']))
        story.append(Paragraph("_" * 80, styles['AnswerSpace']))
        story.append(Spacer(1, 0.3*cm))

def ejercicio4_mejora_contraargumento(story, styles):
    """Ejercicio 4: Mejora el contraargumento"""
    story.append(Paragraph("EJERCICIO 4: MEJORA EL CONTRAARGUMENTO", styles['SectionHeader']))
    story.append(Paragraph("Instrucciones:", styles['SubsectionHeader']))
    story.append(Paragraph("Los siguientes contraargumentos son débiles o incompletos. Mejóralos aplicando la estructura completa:", styles['BodyJustified']))
    story.append(Spacer(1, 0.3*cm))

    debiles = [
        {
            "original": "«No. Eso es falso. La tecnología es buena.»",
            "problema": "No hay concesión ni refutación estructurada. Es demasiado directo y simple.",
            "tema": "tecnología"
        },
        {
            "original": "«Pero el teletrabajo también tiene cosas buenas como no ir a la oficina.»",
            "problema": "Solo usa 'pero' como conector. Falta refuerzo y estructura formal.",
            "tema": "teletrabajo"
        },
        {
            "original": "«Estás equivocado. La energía nuclear es segura.»",
            "problema": "Es agresivo ('estás equivocado'). No concede nada. No explica por qué es segura.",
            "tema": "energía nuclear"
        },
    ]

    for i, item in enumerate(debiles, 1):
        story.append(Paragraph(f"<b>Contraargumento débil {i}:</b>", styles['SubsectionHeader']))
        story.append(Paragraph(item['original'], styles['Example']))
        story.append(Paragraph(f"<i>Problema:</i> {item['problema']}", styles['Instructions']))
        story.append(Paragraph("<b>Mi versión mejorada:</b>", styles['BodyJustified']))
        story.append(Paragraph("_" * 80, styles['AnswerSpace']))
        story.append(Paragraph("_" * 80, styles['AnswerSpace']))
        story.append(Paragraph("_" * 80, styles['AnswerSpace']))
        story.append(Spacer(1, 0.3*cm))

def ejercicio5_debate_rapido(story, styles):
    """Ejercicio 5: Debate rápido"""
    story.append(Paragraph("EJERCICIO 5: DEBATE RÁPIDO EN PAREJAS", styles['SectionHeader']))
    story.append(Paragraph("Instrucciones:", styles['SubsectionHeader']))
    story.append(Paragraph("Trabaja con un compañero. Uno presenta un argumento (30 segundos) y el otro contraargumenta usando la estructura completa. Luego invierten roles.", styles['BodyJustified']))
    story.append(Spacer(1, 0.3*cm))

    story.append(Paragraph("<b>Temas propuestos:</b>", styles['BodyJustified']))
    story.append(Spacer(1, 0.2*cm))

    temas = [
        "1. ¿Debe ser gratuita la educación universitaria?",
        "2. ¿Es ético el uso de animales en experimentos científicos?",
        "3. ¿Deberían prohibirse los plásticos de un solo uso?",
        "4. ¿Es el uso de smartphone en el aula beneficioso o perjudicial?",
        "5. ¿Debería implementarse una renta básica universal?",
        "6. ¿Es necesario el servicio militar obligatorio?",
    ]

    for tema in temas:
        story.append(Paragraph(tema, styles['BodyJustified']))

    story.append(Spacer(1, 0.3*cm))

    story.append(Paragraph("<b>Checklist de autoevaluación:</b>", styles['SubsectionHeader']))

    checklist = [
        "☐ Hice una concesión válida al argumento de mi oponente",
        "☐ Usé un conector de contraargumentación (sin embargo, no obstante, etc.)",
        "☐ Presenté una refutación con argumentos sólidos",
        "☐ Reforcé mi posición con una conclusión clara",
        "☐ Mantuve un tono respetuoso y formal",
        "☐ Usé vocabulario variado de contraargumentación",
    ]

    for item in checklist:
        story.append(Paragraph(item, styles['BodyJustified']))

def create_conectores_reference(story, styles):
    """Crea una referencia de conectores"""
    story.append(PageBreak())
    story.append(Paragraph("ANEXO: REFERENCIA DE CONECTORES DE CONTRAARGUMENTACIÓN", styles['SectionHeader']))
    story.append(Spacer(1, 0.3*cm))

    conectores = {
        "CONCESIÓN SIMPLE": ["Es verdad que...", "Es cierto que...", "Admito que...", "Reconozco que..."],
        "CONCESIÓN + CONTRASTE": ["Aunque...", "A pesar de que...", "Si bien...", "Si bien es verdad que..."],
        "ADVERSATIVOS FUERTES": ["Sin embargo", "No obstante", "Empero", "No por eso"],
        "ADVERSATIVOS CONCESIVOS": ["A pesar de...", "A pesar de ello", "Con todo", "Aun así"],
        "REFUTACIÓN DIRECTA": ["Todo lo contrario", "Por el contrario", "Muy al contrario"],
        "PIVOTE": ["pero", "pero sin embargo", "no por eso", "aun así"],
    }

    for categoria, conectores_list in conectores.items():
        story.append(Paragraph(f"<b>{categoria}</b>", styles['SubsectionHeader']))
        for conector in conectores_list:
            story.append(Paragraph(f"• {conector}", styles['BodyJustified']))
        story.append(Spacer(1, 0.2*cm))

    vocabulario = [
        ("Conceder", "Reconocer un punto válido del oponente"),
        ("Refutar", "Contradecir con argumentos"),
        ("Rebatir", "Responder y contradecir argumentos"),
        ("Desvirtuar", "Debilitar o quitar valor a un argumento"),
        ("Desmentir", "Demostrar que algo es falso"),
        ("Sostener", "Mantener o defender un argumento"),
        ("Corroborar", "Confirmar o respaldar con pruebas"),
    ]

    story.append(Paragraph("<b>VOCABULARIO DE CONTRAARGUMENTACIÓN</b>", styles['SubsectionHeader']))
    for term, definition in vocabulario:
        story.append(Paragraph(f"<b>{term}:</b> {definition}", styles['BodyJustified']))

def main():
    """Función principal para generar el PDF"""
    story = []
    styles = create_styles()

    # Crear encabezado
    story.extend(create_header())

    # Ejercicio 1
    ejercicio1_completa_contraargumentacion(story, styles)
    story.append(PageBreak())

    # Ejercicio 2
    ejercicio2_identifica_estructura(story, styles)
    story.append(PageBreak())

    # Ejercicio 3
    ejercicio3_contraargumenta_tu_mismo(story, styles)
    story.append(PageBreak())

    # Ejercicio 4
    ejercicio4_mejora_contraargumento(story, styles)
    story.append(PageBreak())

    # Ejercicio 5
    ejercicio5_debate_rapido(story, styles)

    # Anexo de referencia
    create_conectores_reference(story, styles)

    # Crear el documento PDF
    doc = SimpleDocTemplate(
        OUTPUT_FILE,
        pagesize=A4,
        rightMargin=2*cm,
        leftMargin=2*cm,
        topMargin=2.5*cm,
        bottomMargin=2*cm
    )

    doc.build(story)
    print(f"✓ PDF generado exitosamente: {OUTPUT_FILE}")

if __name__ == "__main__":
    main()

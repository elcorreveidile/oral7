#!/usr/bin/env python3
"""
Generador de PDF de Estructura de Contraargumentación
Sesión 6 - Plataforma de Español C1
"""

from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import cm
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, PageBreak
from reportlab.lib.enums import TA_CENTER, TA_LEFT, TA_JUSTIFY
from reportlab.lib import colors

# Configuración del PDF
OUTPUT_FILE = "public/resources/contraargumentacion-estructura.pdf"

def create_styles():
    """Crea los estilos para el documento"""
    styles = getSampleStyleSheet()

    # Custom style names to avoid conflicts
    # Estilo título principal
    if 'StructureTitle' not in styles:
        styles.add(ParagraphStyle(
            name='StructureTitle',
            parent=styles['Title'],
            fontSize=20,
            textColor=colors.HexColor('#1e40af'),
            spaceAfter=0.5*cm,
            alignment=TA_CENTER,
            fontName='Helvetica-Bold'
        ))

    # Estilo subtítulo
    if 'StructureSubtitle' not in styles:
        styles.add(ParagraphStyle(
            name='StructureSubtitle',
            parent=styles['Heading2'],
            fontSize=14,
            textColor=colors.HexColor('#64748b'),
            spaceAfter=1*cm,
            alignment=TA_CENTER,
            fontName='Helvetica'
        ))

    # Estilo encabezado de sección
    if 'StructSectionHeader' not in styles:
        styles.add(ParagraphStyle(
            name='StructSectionHeader',
            parent=styles['Heading2'],
            fontSize=14,
            textColor=colors.HexColor('#1e40af'),
            spaceBefore=0.8*cm,
            spaceAfter=0.4*cm,
            fontName='Helvetica-Bold'
        ))

    # Estilo sub-encabezado
    if 'StructSubsectionHeader' not in styles:
        styles.add(ParagraphStyle(
            name='StructSubsectionHeader',
            parent=styles['Heading3'],
            fontSize=12,
            textColor=colors.HexColor('#334155'),
            spaceBefore=0.5*cm,
            spaceAfter=0.3*cm,
            fontName='Helvetica-Bold'
        ))

    # Estilo normal justificado
    if 'StructBodyJustified' not in styles:
        styles.add(ParagraphStyle(
            name='StructBodyJustified',
            parent=styles['BodyText'],
            fontSize=11,
            alignment=TA_JUSTIFY,
            spaceAfter=0.3*cm,
            fontName='Helvetica'
        ))

    # Estilo ejemplo destacado
    if 'StructExample' not in styles:
        styles.add(ParagraphStyle(
            name='StructExample',
            parent=styles['BodyText'],
            fontSize=11,
            textColor=colors.HexColor('#059669'),
            leftIndent=0.8*cm,
            rightIndent=0.8*cm,
            spaceBefore=0.3*cm,
            spaceAfter=0.3*cm,
            fontName='Helvetica',
            alignment=TA_JUSTIFY,
            bulletIndent=0.5*cm
        ))

    # Estilo definición
    if 'StructDefinition' not in styles:
        styles.add(ParagraphStyle(
            name='StructDefinition',
            parent=styles['BodyText'],
            fontSize=10,
            textColor=colors.HexColor('#475569'),
            leftIndent=0.5*cm,
            spaceBefore=0.2*cm,
            spaceAfter=0.2*cm,
            fontName='Helvetica-Oblique',
            alignment=TA_JUSTIFY
        ))

    # Estilo nota
    if 'StructNote' not in styles:
        styles.add(ParagraphStyle(
            name='StructNote',
            parent=styles['BodyText'],
            fontSize=9,
            textColor=colors.HexColor('#dc2626'),
            leftIndent=0.5*cm,
            spaceBefore=0.2*cm,
            spaceAfter=0.2*cm,
            fontName='Helvetica',
            alignment=TA_JUSTIFY
        ))

    return styles

def create_header():
    """Crea el encabezado del documento"""
    story = []
    styles = create_styles()

    story.append(Paragraph("ESTRUCTURA DE CONTRAARGUMENTACIÓN", styles['StructureTitle']))
    story.append(Paragraph("Sesión 6 - Español C1: Argumentación Formal", styles['StructureSubtitle']))
    story.append(Spacer(1, 1*cm))

    return story

def seccion_1_introduccion(story, styles):
    """Introducción a la contraargumentación"""
    story.append(Paragraph("¿QUÉ ES LA CONTRAARGUMENTACIÓN?", styles['StructSectionHeader']))

    story.append(Paragraph(
        "<b>La contraargumentación</b> es la respuesta lógica y estructurada a un argumento contrario. "
        "No se trata simplemente de contradecir, sino de <b>reconocer, refutar y reforzar</b> de manera "
        "sofisticada y persuasiva.",
        styles['StructBodyJustified']
    ))

    story.append(Paragraph(
        "Una contraargumentación efectiva demuestra madurez intelectual y capacidad de análisis, "
        "ya que reconoce la complejidad del tema y ofrece una perspectiva matizada en lugar de "
        "una oposición ciega.",
        styles['StructDefinition']
    ))

    story.append(Spacer(1, 0.5*cm))

    # Tabla comparativa
    story.append(Paragraph("<b>CONTRAARGUMENTACIÓN EFECTIVA vs. INEFICAZ</b>", styles['StructSubsectionHeader']))

    data = [
        ["❌ INEFICAZ", "✅ EFICAZ"],
        ["«No. Estás equivocado.»", "«Es cierto que... Sin embargo...»"],
        ["No reconoce puntos válidos", "Concede antes de refutar"],
        ["Es agresiva/despectiva", "Mantiene tono respetuoso"],
        ["Solo contradice", "Refuta con argumentos sólidos"],
        ["No ofrece alternativa", "Refuerza con postura propia"],
        ["«Eso es falso»", "«Los datos demuestran lo contrario»"],
    ]

    table = Table(data, colWidths=[7*cm, 7*cm])
    table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#dc2626')),
        ('BACKGROUND', (1, 0), (1, 0), colors.HexColor('#059669')),
        ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
        ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
        ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
        ('FONTSIZE', (0, 0), (-1, 0), 11),
        ('FONTNAME', (0, 1), (-1, -1), 'Helvetica'),
        ('FONTSIZE', (0, 1), (-1, -1), 9),
        ('TOPPADDING', (0, 0), (-1, -1), 8),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 8),
        ('GRID', (0, 0), (-1, -1), 0.5, colors.grey),
        ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.HexColor('#fef2f2'), colors.HexColor('#f0fdf4')]),
    ]))

    story.append(table)
    story.append(Spacer(1, 0.5*cm))

def seccion_2_estructura(story, styles):
    """Las 4 partes de la estructura"""
    story.append(Paragraph("LAS 4 PARTES DE LA ESTRUCTURA", styles['StructSectionHeader']))

    story.append(Paragraph(
        "Toda contraargumentación efectiva sigue esta estructura secuencial:",
        styles['StructBodyJustified']
    ))

    story.append(Spacer(1, 0.3*cm))

    # Componentes de la estructura
    componentes = [
        {
            "numero": "1",
            "nombre": "CONCESIÓN",
            "descripcion": "Reconoces un punto válido del oponente",
            "conectores": "Es cierto que... / Es verdad que... / Admito que... / Reconozco que...",
            "proposito": "Muestra objetividad y madurez intelectual. No debilita tu posición; la fortalece al demostrar que has considerado el argumento contrario."
        },
        {
            "numero": "2",
            "nombre": "PIVOTE",
            "descripcion": "Usas un conector de contraste",
            "conectores": "Sin embargo / No obstante / No por eso / Aun así / Con todo",
            "proposito": "Marca la transición desde la concesión hacia tu refutación. Es el punto de giro del contraargumento."
        },
        {
            "numero": "3",
            "nombre": "REFUTACIÓN",
            "descripcion": "Presentas tu contraargumento",
            "conectores": "Los datos demuestran... / La evidencia sugiere... / Por el contrario... / Todo lo contrario...",
            "proposito": "Es el núcleo de tu respuesta. Presentas argumentos, datos o razonamientos que contradicen la posición del oponente."
        },
        {
            "numero": "4",
            "nombre": "REFUERZO",
            "descripcion": "Fortaleces tu posición original",
            "conectores": "Por lo tanto... / En conclusión... / De ahí que... / En suma...",
            "proposito": "Cierra el contraargumento reafirmando tu postura con una conclusión que integra tanto la concesión como la refutación."
        },
    ]

    for comp in componentes:
        # Box para cada componente
        story.append(Spacer(1, 0.2*cm))

        data = [
            [f"<b>{comp['numero']}. {comp['nombre']}</b>"],
            [f"<i>{comp['descripcion']}</i>"],
            [f"<b>Conectores:</b> {comp['conectores']}"],
            [f"<b>Propósito:</b> {comp['proposito']}"],
        ]

        table = Table(data, colWidths=[16*cm])
        table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (0, 0), colors.HexColor('#1e40af')),
            ('TEXTCOLOR', (0, 0), (0, 0), colors.whitesmoke),
            ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
            ('VALIGN', (0, 0), (-1, -1), 'TOP'),
            ('FONTNAME', (0, 0), (0, 0), 'Helvetica-Bold'),
            ('FONTSIZE', (0, 0), (0, 0), 11),
            ('FONTNAME', (0, 1), (-1, -1), 'Helvetica'),
            ('FONTSIZE', (0, 1), (-1, -1), 9),
            ('TOPPADDING', (0, 0), (0, 0), 8),
            ('BOTTOMPADDING', (0, 0), (0, 0), 6),
            ('TOPPADDING', (0, 1), (-1, -1), 6),
            ('BOTTOMPADDING', (0, 1), (-1, -1), 8),
            ('BACKGROUND', (0, 1), (-1, -1), colors.HexColor('#f1f5f9')),
            ('LEFTPADDING', (0, 0), (-1, -1), 10),
            ('RIGHTPADDING', (0, 0), (-1, -1), 10),
        ]))

        story.append(table)

    story.append(Spacer(1, 0.5*cm))

def seccion_3_ejemplo_completo(story, styles):
    """Ejemplo completo anotado"""
    story.append(Paragraph("EJEMPLO COMPLETO ANOTADO", styles['StructSectionHeader']))

    story.append(Paragraph(
        "<b>Tema:</b> «El teletrabajo destruye la cultura empresarial»",
        styles['StructBodyJustified']
    ))

    story.append(Spacer(1, 0.3*cm))

    story.append(Paragraph("<b>Contraargumento:</b>", styles['StructSubsectionHeader']))

    # Ejemplo con anotaciones
    ejemplos = [
        {
            "texto": "«Es cierto que el teletrabajo puede dificultar la interacción espontánea entre colleagues y debilitar el sentido de pertenencia a la empresa.",
            "parte": "CONCESIÓN",
            "color": "#1e40af",
            "explicacion": "Reconozco un punto válido del argumento contrario"
        },
        {
            "texto": "<b>Sin embargo,</b>",
            "parte": "PIVOTE",
            "color": "#f59e0b",
            "explicacion": "Conector de contraste que marca el giro"
        },
        {
            "texto": "también permite una mayor conciliación de la vida laboral y personal, reduce el estrés por desplazamientos y amplía el talento disponible al eliminar barreras geográficas.",
            "parte": "REFUTACIÓN",
            "color": "#059669",
            "explicacion": "Presento argumentos que contradicen la postura original"
        },
        {
            "texto": "<b>Por lo tanto,</b> el desafío no es eliminar el teletrabajo, sino encontrar formas de mantener la cultura empresarial en este nuevo contexto, a través de reuniones presenciales periódicas, espacios virtuales de colaboración y actividades de team building.»",
            "parte": "REFUERZO",
            "color": "#7c3aed",
            "explicacion": "Refuerzo mi postura con una conclusión integradora"
        },
    ]

    for ej in ejemplos:
        # Box para cada parte del ejemplo
        data = [
            [f"<b>{ej['parte']}</b>"],
            [ej['texto']],
            [f"<i>{ej['explicacion']}</i>"],
        ]

        table = Table(data, colWidths=[16*cm])
        table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (0, 0), colors.HexColor(ej['color'])),
            ('TEXTCOLOR', (0, 0), (0, 0), colors.whitesmoke),
            ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
            ('VALIGN', (0, 0), (-1, -1), 'TOP'),
            ('FONTNAME', (0, 0), (0, 0), 'Helvetica-Bold'),
            ('FONTSIZE', (0, 0), (0, 0), 11),
            ('FONTNAME', (0, 1), (-1, -1), 'Helvetica'),
            ('FONTSIZE', (0, 1), (0, 1), 10),
            ('FONTSIZE', (0, 2), (0, 2), 9),
            ('TOPPADDING', (0, 0), (0, 0), 6),
            ('BOTTOMPADDING', (0, 0), (0, 0), 4),
            ('TOPPADDING', (0, 1), (-1, -1), 8),
            ('BOTTOMPADDING', (0, 1), (-1, -1), 6),
            ('BACKGROUND', (0, 1), (-1, -1), colors.HexColor('#fafafa')),
            ('LEFTPADDING', (0, 0), (-1, -1), 10),
            ('RIGHTPADDING', (0, 0), (-1, -1), 10),
            ('TEXTCOLOR', (0, 2), (0, 2), colors.HexColor('#64748b')),
        ]))

        story.append(table)

    story.append(Spacer(1, 0.5*cm))

def seccion_4_conectores(story, styles):
    """Referencia de conectores"""
    story.append(Paragraph("CONECTORES DE CONTRAARGUMENTACIÓN", styles['StructSectionHeader']))

    story.append(Paragraph(
        "Los conectores son esenciales para marcar las transiciones y dar coherencia a tu contraargumento. "
        "Varía el uso para evitar repeticiones.",
        styles['StructBodyJustified']
    ))

    story.append(Spacer(1, 0.3*cm))

    conectores = {
        "<b>PARA LA CONCESIÓN</b>": [
            "Es cierto que...",
            "Es verdad que...",
            "Admito que...",
            "Reconozco que...",
            "Si bien es verdad que...",
        ],
        "<b>PARA EL PIVOTE (CONTRASTE)</b>": [
            "Sin embargo",
            "No obstante",
            "Aun así",
            "Con todo",
            "No por eso",
            "Empero (muy formal)",
        ],
        "<b>PARA LA REFUTACIÓN</b>": [
            "Todo lo contrario",
            "Por el contrario",
            "Muy al contrario",
            "Los datos demuestran lo contrario",
            "La evidencia sugiere...",
        ],
        "<b>PARA EL REFUERZO</b>": [
            "Por lo tanto",
            "En conclusión",
            "De ahí que",
            "En suma",
            "Por consiguiente",
        ],
    }

    for categoria, lista in conectores.items():
        story.append(Paragraph(categoria, styles['StructSubsectionHeader']))

        for item in lista:
            story.append(Paragraph(f"• {item}", styles['StructBodyJustified']))

        story.append(Spacer(1, 0.2*cm))

def seccion_5_errores_comunes(story, styles):
    """Errores comunes a evitar"""
    story.append(Paragraph("ERRORES COMUNES A EVITAR", styles['StructSectionHeader']))

    errores = [
        {
            "error": "<b>1. No conceder nada</b>",
            "descripcion": "Negarse a reconocer cualquier punto válido del oponente te hace parecer dogmático y poco objetivo.",
            "ejemplo": "«Estás completamente equivocado. La tecnología es buena.»",
            "solucion": "«Es cierto que la tecnología tiene riesgos. Sin embargo, sus beneficios son superiores.»"
        },
        {
            "error": "<b>2. Usar solo 'pero'</b>",
            "descripcion": "Repetir 'pero' como único conector empobrece tu expresión y denota falta de vocabulario.",
            "ejemplo": "«Es caro pero necesario pero bueno pero efectivo.»",
            "solucion": "«Es cierto que es caro. No obstante, es necesario. Con todo, es efectivo.»"
        },
        {
            "error": "<b>3. Ser agresivo</b>",
            "descripcion": "Atacar personalmente o usar tono despectivo debilita tu posición y pierdes credibilidad.",
            "ejemplo": "«Tu argumento es ridículo y demuestra ignorancia.»",
            "solucion": "«Entiendo tu perspectiva. No obstante, los datos sugieren una conclusión diferente.»"
        },
        {
            "error": "<b>4. Contraargumentar sin refutar</b>",
            "descripcion": "Haces la concesión y el pivote, pero no presentas argumentos sólidos que refuten.",
            "ejemplo": "«Es cierto que es caro. Sin embargo, es lo que hay.»",
            "solucion": "«Es cierto que es caro. Sin embargo, la inversión se recupera en 2 años, según el estudio.»"
        },
        {
            "error": "<b>5. Olvidar el refuerzo</b>",
            "descripcion": "Concedes, pivotas y refutas, pero no cierras con una conclusión que refuerce tu postura.",
            "ejemplo": "«Es caro. Sin embargo, funciona bien. (Fin)»",
            "solucion": "«Es caro. Sin embargo, funciona bien. Por lo tanto, vale la pena la inversión.»"
        },
    ]

    for error in errores:
        story.append(Paragraph(error['error'], styles['StructSubsectionHeader']))
        story.append(Paragraph(error['descripcion'], styles['StructBodyJustified']))
        story.append(Paragraph(f"<i>❌ Ejemplo incorrecto:</i> {error['ejemplo']}", styles['StructNote']))
        story.append(Paragraph(f"<i>✅ Versión mejorada:</i> {error['solucion']}", styles['StructExample']))
        story.append(Spacer(1, 0.3*cm))

def seccion_6_practica(story, styles):
    """Guía de práctica"""
    story.append(Paragraph("GUÍA DE PRÁCTICA", styles['StructSectionHeader']))

    story.append(Paragraph(
        "Sigue estos pasos para practicar la contraargumentación:",
        styles['StructBodyJustified']
    ))

    story.append(Spacer(1, 0.3*cm))

    pasos = [
        ("1. IDENTIFICA", "Escucha o lee el argumento contrario e identifica su punto principal"),
        ("2. CONCEDE", "Encuentra un aspecto válido en el argumento contrario y reconócelo"),
        ("3. PIVOTA", "Elige el conector de contraste más apropiado para tu contexto"),
        ("4. REFUTA", "Presenta 2-3 argumentos sólidos que contradigan la postura opuesta"),
        ("5. REFUERZA", "Cierra con una conclusión que integre concesión y refutación"),
        ("6. EVALÚA", "Revisa: ¿Fui respetuoso? ¿Usé conectores variados? ¿Refuercé mi postura?"),
    ]

    for numero, paso in pasos:
        story.append(Paragraph(f"<b>{numero}</b> {paso}", styles['StructBodyJustified']))

    story.append(Spacer(1, 0.5*cm))

    story.append(Paragraph("<b>Temas para practicar:</b>", styles['StructSubsectionHeader']))

    temas = [
        "• Redes sociales: ¿conectan o aíslan?",
        "• Teletrabajo: ¿eficiente o aislante?",
        "• Energía nuclear: ¿solución o riesgo?",
        "• Turismo masivo: ¿beneficio o destrucción?",
        "• Videojuegos: ¿pérdida de tiempo o herramienta cognitiva?",
        "• Educación bilingüe: ¿necesidad o elitismo?",
        "• Renta básica universal: ¿utopía o necesidad?",
        "• Inteligencia artificial: ¿amenaza o oportunidad?",
    ]

    for tema in temas:
        story.append(Paragraph(tema, styles['StructBodyJustified']))

def main():
    """Función principal para generar el PDF"""
    story = []
    styles = create_styles()

    # Crear encabezado
    story.extend(create_header())

    # Secciones
    seccion_1_introduccion(story, styles)
    story.append(PageBreak())

    seccion_2_estructura(story, styles)
    story.append(PageBreak())

    seccion_3_ejemplo_completo(story, styles)
    story.append(PageBreak())

    seccion_4_conectores(story, styles)
    story.append(PageBreak())

    seccion_5_errores_comunes(story, styles)
    story.append(PageBreak())

    seccion_6_practica(story, styles)

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

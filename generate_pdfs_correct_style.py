#!/usr/bin/env python3
"""
Generador de PDFs para el curso de español C1
Estilo basado en /Users/javierbenitez/Desktop/Temporal/prueba.pdf
"""

import os
import re
from pathlib import Path
from weasyprint import HTML, CSS

# Configuración
OUTPUT_DIR = Path("/Users/javierbenitez/Desktop/AI/oral7/public/resources")
CONTENT_DIR = Path("/Users/javierbenitez/Desktop/AI/oral7/contenido-pdfs")
OUTPUT_DIR.mkdir(parents=True, exist_ok=True)


# CSS basado exactamente en el estilo del PDF de ejemplo
PDF_CSS = CSS(string="""
    @page {
        size: A4;
        margin: 1.8cm 2cm 2cm 2cm;
        @bottom-center {
            content: counter(page);
            font-size: 9pt;
            color: #666;
        }
    }

    * {
        margin: 0;
        padding: 0;
        box-sizing: border-box;
    }

    body {
        font-family: Arial, Helvetica, sans-serif;
        font-size: 11pt;
        line-height: 1.5;
        color: #000;
    }

    /* Contenedor principal */
    .container {
        max-width: 100%;
        margin: 0 auto;
    }

    /* Encabezado estilo UGR */
    .header {
        text-align: center;
        margin-bottom: 25px;
        border-bottom: 1px solid #333;
        padding-bottom: 15px;
    }

    .universidad {
        font-size: 9pt;
        color: #000;
        margin-bottom: 8px;
    }

    .curso-title {
        font-size: 14pt;
        font-weight: bold;
        color: #000;
        margin-bottom: 15px;
        letter-spacing: 0.5px;
    }

    .info-table {
        width: 100%;
        font-size: 9pt;
        margin: 0 auto;
    }

    .info-table td {
        padding: 2px 8px;
        text-align: left;
    }

    .info-label {
        font-weight: bold;
        white-space: nowrap;
    }

    /* Título principal de la sesión */
    .session-title {
        font-size: 18pt;
        font-weight: bold;
        text-align: center;
        margin: 25px 0 20px 0;
        color: #000;
    }

    /* Secciones numeradas con círculos */
    .section {
        margin: 18px 0;
    }

    .section-title {
        font-size: 13pt;
        font-weight: bold;
        color: #000;
        margin-bottom: 10px;
        display: flex;
        align-items: flex-start;
        gap: 8px;
    }

    .section-number {
        flex-shrink: 0;
        width: 20px;
        height: 20px;
        background-color: #333;
        color: white;
        border-radius: 50%;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        font-size: 10pt;
        font-weight: bold;
        margin-top: 1px;
    }

    .section-text {
        flex: 1;
    }

    /* Subsecciones */
    h3 {
        font-size: 11pt;
        font-weight: bold;
        color: #000;
        margin: 12px 0 8px 0;
    }

    /* Listas */
    ul, ol {
        margin: 8px 0;
        padding-left: 25px;
    }

    li {
        margin: 4px 0;
        line-height: 1.4;
    }

    /* Texto en negrita */
    strong {
        font-weight: bold;
    }

    /* Cajas de ejemplo */
    .example-box {
        background-color: #f5f5f5;
        border-left: 3px solid #666;
        padding: 10px 12px;
        margin: 12px 0;
        font-size: 10pt;
    }

    .example-box em {
        font-style: italic;
        color: #444;
    }

    /* Párrafos */
    p {
        margin: 6px 0;
        line-height: 1.5;
    }

    /* Espaciado entre elementos */
    .spacer {
        height: 10px;
    }
""")


def clean_markdown(text):
    """Limpia markdown eliminando # extras y espacios innecesarios"""
    lines = text.split('\n')
    cleaned = []

    for line in lines:
        # Eliminar espacios al inicio y final
        line = line.strip()

        # Eliminar #### extras (dejar solo ## o ###)
        if line.startswith('####'):
            line = line.replace('####', '###')
        elif line.startswith('#####'):
            line = line.replace('#####', '###')
        elif line.startswith('######'):
            line = line.replace('######', '###')

        # Eliminar líneas vacías consecutivas
        if line or (not cleaned or cleaned[-1] != ''):
            cleaned.append(line)

    return '\n'.join(cleaned)


def markdown_to_html(markdown_content, session_num=0):
    """Convierte markdown a HTML con el estilo correcto"""

    # Datos específicos por sesión
    session_info = get_session_info(session_num)

    # Limpieza del markdown
    content = clean_markdown(markdown_content)

    # Extraer título
    title = "Material de la Sesión"
    for line in content.split('\n')[:15]:
        if line.startswith('# '):
            title = line[2:].strip()
            break
        elif line.startswith('## '):
            title = line[3:].strip()
            break

    # Construir HTML del encabezado
    header_html = f"""
    <div class="header">
        <p class="universidad">Universidad de Granada</p>
        <p class="curso-title">Producción e Interacción Oral - Nivel 7</p>
        <table class="info-table">
            <tr>
                <td class="info-label">Grupos:</td>
                <td>A (Aula 24) y B (Aula 08)</td>
            </tr>
            <tr>
                <td class="info-label">Centro:</td>
                <td>Centro de Lenguas Modernas / Edificio A</td>
            </tr>
            <tr>
                <td class="info-label">Profesor:</td>
                <td>Javier Benítez Lainez</td>
            </tr>
            <tr>
                <td class="info-label">Tutorías:</td>
                <td>Martes 9:00-10:00 y 14:30-15:30</td>
            </tr>
            <tr>
                <td class="info-label">Sala de profesores</td>
                <td>Email: benitezl@go.ugr.es</td>
            </tr>
        </table>
    </div>
    <h1 class="session-title">{title}</h1>
    """

    # Convertir resto del contenido
    html_lines = []
    lines = content.split('\n')
    i = 0
    section_num = 0

    # Saltar el título principal ya procesado
    while i < len(lines) and lines[i].startswith('#'):
        i += 1

    while i < len(lines):
        line = lines[i].strip()

        # Títulos de sección (## o ###)
        if line.startswith('## ') and not line.startswith('###'):
            section_num += 1
            text = line[3:].strip()
            # Eliminar número si está al inicio
            text = re.sub(r'^\d+\.?\s*', '', text)
            html_lines.append(f"""
            <div class="section">
                <div class="section-title">
                    <span class="section-number">{section_num}</span>
                    <span class="section-text">{text}</span>
                </div>
            """)
            i += 1

        elif line.startswith('### '):
            text = line[4:].strip()
            # Eliminar número si está al inicio
            text = re.sub(r'^\d+\.?\s*', '', text)
            html_lines.append(f'<h3>{text}</h3>')
            i += 1

        # Líneas vacías
        elif not line:
            html_lines.append('<p class="spacer"></p>')
            i += 1

        # Listas
        elif line.startswith('- '):
            html_lines.append('<ul>')
            while i < len(lines) and lines[i].strip().startswith('- '):
                text = lines[i].strip()[2:]
                text = re.sub(r'\*\*(.+?)\*\*', r'<strong>\1</strong>', text)
                html_lines.append(f'<li>{text}</li>')
                i += 1
            html_lines.append('</ul>')

        elif re.match(r'^\d+\.', line):
            html_lines.append('<ol>')
            while i < len(lines) and re.match(r'^\d+\.', lines[i].strip()):
                text = re.sub(r'^\d+\.?\s*', '', lines[i].strip())
                text = re.sub(r'\*\*(.+?)\*\*', r'<strong>\1</strong>', text)
                html_lines.append(f'<li>{text}</li>')
                i += 1
            html_lines.append('</ol>')

        # Cajas de ejemplo
        elif line.startswith('> **Ejemplo') or line.startswith('> **EJEMPLO'):
            html_lines.append('<div class="example-box">')
            i += 1
            while i < len(lines) and lines[i].strip().startswith('>'):
                text = lines[i].strip()[1:]
                text = re.sub(r'\*\*(.+?)\*\*', r'<strong>\1</strong>', text)
                html_lines.append(f'<p><em>{text}</em></p>')
                i += 1
            html_lines.append('</div>')

        # Cerrar sección
        elif line.startswith('##') or i == len(lines) - 1:
            html_lines.append('</div>')

        # Texto normal
        elif line:
            # Procesar negritas
            line = re.sub(r'\*\*(.+?)\*\*', r'<strong>\1</strong>', line)
            html_lines.append(f'<p>{line}</p>')
            i += 1

        else:
            i += 1

    # Cerrar última sección si quedó abierta
    if html_lines and not html_lines[-1].strip().endswith('</div>'):
        html_lines.append('</div>')

    body_html = '\n'.join(html_lines)

    # HTML completo
    html_template = f"""
    <!DOCTYPE html>
    <html lang="es">
    <head>
        <meta charset="UTF-8">
        <title>{title}</title>
    </head>
    <body>
        <div class="container">
            {header_html}
            {body_html}
        </div>
    </body>
    </html>
    """

    return html_template


def get_session_info(session_num):
    """Obtiene información específica de la sesión"""
    # Por ahora todos usan los mismos datos
    # Se puede personalizar por sesión si es necesario
    return {
        'aulas': '24 y 08',
        'centro': 'Centro de Lenguas Modernas',
        'edificio': 'Edificio A',
        'profesor': 'Javier Benítez Lainez',
        'tutorias': 'Martes 9:00-10:00 y 14:30-15:30',
        'email': 'benitezl@go.ugr.es'
    }


def create_pdf_from_markdown(md_file, output_filename, session_num=0):
    """Crea un PDF desde un archivo markdown"""
    try:
        # Leer contenido markdown
        with open(md_file, 'r', encoding='utf-8') as f:
            content = f.read()

        # Convertir markdown a HTML
        html_string = markdown_to_html(content, session_num)

        # Generar PDF
        output_path = OUTPUT_DIR / output_filename
        HTML(string=html_string).write_pdf(str(output_path), stylesheets=[PDF_CSS])

        print(f"✓ Generado: {output_filename}")
        return str(output_path)

    except Exception as e:
        print(f"❌ Error procesando {md_file.name}: {e}")
        import traceback
        traceback.print_exc()
        return None


def main():
    """Función principal"""
    print("📚 Generador de PDFs - Producción e Interacción Oral")
    print("=" * 60)

    # Obtener archivos markdown
    md_files = sorted(CONTENT_DIR.glob("*.md"))

    if not md_files:
        print("❌ No se encontraron archivos markdown en:", CONTENT_DIR)
        return

    print(f"📁 Encontrados {len(md_files)} archivos markdown")
    print()

    # Procesar cada archivo
    count = 0
    for md_file in md_files:
        if md_file.name in ['README.md', 'INDICE.md']:
            continue

        # Determinar número de sesión del nombre de archivo
        session_num = 0
        match = re.match(r'^(\d+)-', md_file.name)
        if match:
            session_num = int(match.group(1))

        pdf_filename = md_file.stem + '.pdf'
        result = create_pdf_from_markdown(md_file, pdf_filename, session_num)
        if result:
            count += 1

    print()
    print("✅ PDFs generados exitosamente en:", OUTPUT_DIR)
    print(f"📊 Total de PDFs generados: {count}")


if __name__ == "__main__":
    main()

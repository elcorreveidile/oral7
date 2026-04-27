#!/usr/bin/env python3
"""
Generador de PDFs para el curso de español C1
Usa weasyprint para crear PDFs con estilos personalizados
"""

import os
import re
from pathlib import Path
from weasyprint import HTML, CSS
from datetime import datetime

# Configuración
OUTPUT_DIR = Path("/Users/javierbenitez/Desktop/AI/oral7/public/resources")
CONTENT_DIR = Path("/Users/javierbenitez/Desktop/AI/oral7/contenido-pdfs")
OUTPUT_DIR.mkdir(parents=True, exist_ok=True)


# CSS personalizado basado en el estilo del PDF de ejemplo
PDF_CSS = CSS(string="""
    @page {
        size: A4;
        margin: 2cm;
        @bottom-center {
            content: "Página " counter(page) " de " counter(pages);
            font-size: 9pt;
            color: #666;
        }
    }

    body {
        font-family: Arial, Helvetica, sans-serif;
        font-size: 11pt;
        line-height: 1.6;
        color: #333;
    }

    /* Encabezado */
    .header {
        border-bottom: 3px solid #3b82f6;
        padding-bottom: 8px;
        margin-bottom: 20px;
    }

    .course-title {
        font-size: 9pt;
        color: #666;
        text-align: center;
        margin-bottom: 10px;
    }

    .main-title {
        font-size: 22pt;
        font-weight: bold;
        color: #2c3e50;
        text-align: center;
        margin: 20px 0;
    }

    /* Títulos de sección */
    h1 {
        font-size: 20pt;
        font-weight: bold;
        color: #3b82f6;
        margin-top: 25px;
        margin-bottom: 15px;
        page-break-after: avoid;
    }

    h2 {
        font-size: 16pt;
        font-weight: bold;
        color: #2c3e50;
        margin-top: 20px;
        margin-bottom: 10px;
        page-break-after: avoid;
    }

    h3 {
        font-size: 13pt;
        font-weight: bold;
        color: #2c3e50;
        margin-top: 15px;
        margin-bottom: 8px;
    }

    /* Secciones numeradas */
    .section {
        margin: 15px 0;
        page-break-inside: avoid;
    }

    .section-number {
        display: inline-block;
        width: 24px;
        height: 24px;
        background-color: #3b82f6;
        color: white;
        border-radius: 50%;
        text-align: center;
        line-height: 24px;
        font-weight: bold;
        font-size: 11pt;
        margin-right: 8px;
    }

    .section-title {
        font-size: 14pt;
        font-weight: bold;
        color: #3b82f6;
    }

    /* Listas */
    ul, ol {
        margin: 10px 0;
        padding-left: 30px;
    }

    li {
        margin: 5px 0;
        line-height: 1.5;
    }

    /* Cajas de ejemplo */
    .example-box {
        background-color: #f3f4f6;
        border-left: 4px solid #3b82f6;
        padding: 12px 15px;
        margin: 15px 0;
        border-radius: 4px;
    }

    .example-box p {
        margin: 5px 0;
        font-style: italic;
        color: #555;
    }

    /* Cajas importantes */
    .important-box {
        background-color: #fff3e0;
        border-left: 4px solid #f59e0b;
        padding: 12px 15px;
        margin: 15px 0;
        border-radius: 4px;
    }

    .important-box-title {
        font-weight: bold;
        color: #d97706;
        margin-bottom: 5px;
    }

    /* Tablas */
    table {
        width: 100%;
        border-collapse: collapse;
        margin: 15px 0;
        font-size: 10pt;
    }

    th {
        background-color: #3b82f6;
        color: white;
        padding: 10px;
        text-align: left;
        font-weight: bold;
    }

    td {
        padding: 8px 10px;
        border: 1px solid #ddd;
    }

    tr:nth-child(even) {
        background-color: #f9fafb;
    }

    /* Código */
    code {
        background-color: #f3f4f6;
        padding: 2px 6px;
        border-radius: 3px;
        font-family: 'Courier New', monospace;
        font-size: 9pt;
    }

    pre {
        background-color: #1f2937;
        color: #f3f4f6;
        padding: 15px;
        border-radius: 5px;
        overflow-x: auto;
        font-family: 'Courier New', monospace;
        font-size: 9pt;
        line-height: 1.4;
    }

    /* Notas al pie */
    .footnote {
        font-size: 8pt;
        color: #666;
        border-top: 1px solid #ddd;
        padding-top: 10px;
        margin-top: 20px;
    }
""")


def markdown_to_html(markdown_content):
    """Convierte markdown a HTML simple"""
    html_lines = []
    lines = markdown_content.split('\n')
    i = 0

    while i < len(lines):
        line = lines[i].rstrip()

        # Títulos
        if line.startswith('### '):
            text = line[4:].strip()
            html_lines.append(f'<h3>{text}</h3>')
            i += 1

        elif line.startswith('## '):
            text = line[3:].strip()
            html_lines.append(f'<h2>{text}</h2>')
            i += 1

        elif line.startswith('# '):
            text = line[2:].strip()
            html_lines.append(f'<h1>{text}</h1>')
            i += 1

        # Líneas vacías
        elif not line:
            html_lines.append('<br>')
            i += 1

        # Listas
        elif line.startswith('- '):
            html_lines.append('<ul>')
            while i < len(lines) and lines[i].strip().startswith('- '):
                text = lines[i].strip()[2:]
                html_lines.append(f'<li>{text}</li>')
                i += 1
            html_lines.append('</ul>')

        elif re.match(r'^\d+\.', line):
            html_lines.append('<ol>')
            while i < len(lines) and re.match(r'^\d+\.', lines[i].strip()):
                text = re.sub(r'^\d+\.\s*', '', lines[i].strip())
                html_lines.append(f'<li>{text}</li>')
                i += 1
            html_lines.append('</ol>')

        # Cajas de ejemplo
        elif line.startswith('> **Ejemplo') or line.startswith('> **EJEMPLO'):
            html_lines.append('<div class="example-box">')
            html_lines.append('<p><strong>Ejemplo:</strong></p>')
            i += 1
            while i < len(lines) and lines[i].strip().startswith('>'):
                text = lines[i].strip()[1:]
                html_lines.append(f'<p>{text}</p>')
                i += 1
            html_lines.append('</div>')

        # Cajas importantes
        elif line.startswith('!') or line.startswith('⚠'):
            html_lines.append('<div class="important-box">')
            html_lines.append('<p class="important-box-title">Importante:</p>')
            html_lines.append(f'<p>{line[1:].strip() if line.startswith("! ") else line[2:].strip()}</p>')
            i += 1
            html_lines.append('</div>')

        # Texto normal
        elif line:
            # Procesar negritas **texto**
            line = re.sub(r'\*\*(.+?)\*\*', r'<strong>\1</strong>', line)
            # Procesar cursivas *texto*
            line = re.sub(r'\*(.+?)\*', r'<em>\1</em>', line)
            html_lines.append(f'<p>{line}</p>')
            i += 1

        else:
            i += 1

    return '\n'.join(html_lines)


def create_pdf_from_markdown(md_file, output_filename):
    """Crea un PDF desde un archivo markdown"""
    try:
        # Leer contenido markdown
        with open(md_file, 'r', encoding='utf-8') as f:
            content = f.read()

        # Extraer título
        title = md_file.stem.replace('-', ' ').title()
        for line in content.split('\n')[:10]:
            if line.startswith('# '):
                title = line[2:].strip()
                break

        # Convertir markdown a HTML
        body_html = markdown_to_html(content)

        # Crear HTML completo
        html_template = f"""
        <!DOCTYPE html>
        <html lang="es">
        <head>
            <meta charset="UTF-8">
            <title>{title}</title>
        </head>
        <body>
            <div class="header">
                <p class="course-title">Spanish C1 Oral Course - Producción e Interacción Oral</p>
            </div>
            <h1 class="main-title">{title}</h1>
            {body_html}
        </body>
        </html>
        """

        # Generar PDF
        output_path = OUTPUT_DIR / output_filename
        HTML(string=html_template).write_pdf(str(output_path), stylesheets=[PDF_CSS])

        print(f"✓ Generado: {output_filename}")
        return str(output_path)

    except Exception as e:
        print(f"❌ Error procesando {md_file.name}: {e}")
        return None


def main():
    """Función principal"""
    print("📚 Generador de PDFs - Spanish C1 Oral Course")
    print("=" * 50)

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

        pdf_filename = md_file.stem + '.pdf'
        result = create_pdf_from_markdown(md_file, pdf_filename)
        if result:
            count += 1

    print()
    print("✅ PDFs generados exitosamente en:", OUTPUT_DIR)
    print(f"📊 Total de PDFs generados: {count}")


if __name__ == "__main__":
    main()

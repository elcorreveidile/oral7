#!/usr/bin/env python3
"""
Script para generar PDFs con el estilo correcto usando HTML + wkhtmltopdf
"""

import os
import re
from pathlib import Path

OUTPUT_DIR = Path("/Users/javierbenitez/Desktop/AI/oral7/public/resources")
CONTENT_DIR = Path("/Users/javierbenitez/Desktop/AI/oral7/contenido-pdfs")
OUTPUT_DIR.mkdir(parents=True, exist_ok=True)


# Plantilla HTML con el estilo correcto
HTML_TEMPLATE = """<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <title>{title}</title>
    <style>
        body {
            font-family: Arial, Helvetica, sans-serif;
            font-size: 11pt;
            line-height: 1.5;
            color: #000;
            margin: 1.5cm 2cm;
        }

        .header {
            text-align: center;
            margin-bottom: 20px;
            border-bottom: 2px solid #000;
            padding-bottom: 15px;
        }

        .universidad {
            font-size: 9pt;
            margin-bottom: 8px;
        }

        .curso-title {
            font-size: 14pt;
            font-weight: bold;
            margin-bottom: 12px;
        }

        .info-table {
            width: 100%;
            max-width: 500px;
            margin: 0 auto;
            font-size: 9pt;
        }

        .info-table td {
            padding: 2px 8px;
            text-align: left;
        }

        .info-label {
            font-weight: bold;
        }

        .main-title {
            text-align: center;
            font-size: 18pt;
            font-weight: bold;
            margin: 25px 0 20px 0;
        }

        .section {
            margin: 18px 0;
        }

        .section-title {
            display: flex;
            align-items: center;
            gap: 10px;
            font-size: 13pt;
            font-weight: bold;
            margin-bottom: 10px;
        }

        .section-number {
            width: 20px;
            height: 20px;
            background-color: #000;
            color: white;
            border-radius: 50%;
            display: inline-flex;
            align-items: center;
            justify-content: center;
            font-size: 10pt;
            font-weight: bold;
            flex-shrink: 0;
        }

        h3 {
            font-size: 11pt;
            font-weight: bold;
            margin: 12px 0 8px 0;
        }

        ul, ol {
            margin: 8px 0;
            padding-left: 25px;
        }

        li {
            margin: 4px 0;
        }

        strong {
            font-weight: bold;
        }

        p {
            margin: 6px 0;
        }
    </style>
</head>
<body>
    <div class="header">
        <p class="universidad">Universidad de Granada</p>
        <p class="curso-title">Producción e Interacción Oral - Nivel 7</p>
        <table class="info-table">
            <tr><td class="info-label">Grupos:</td><td>A (Aula 24) y B (Aula 08)</td></tr>
            <tr><td class="info-label">Centro:</td><td>Centro de Lenguas Modernas / Edificio A</td></tr>
            <tr><td class="info-label">Profesor:</td><td>Javier Benítez Lainez</td></tr>
            <tr><td class="info-label">Tutorías:</td><td>Martes 9:00-10:00 y 14:30-15:30</td></tr>
            <tr><td></td><td>Sala de profesores / Email: benitezl@go.ugr.es</td></tr>
        </table>
    </div>

    <h1 class="main-title">{title}</h1>

    {content}
</body>
</html>
"""


def clean_content(content):
    """Limpia el contenido eliminando caracteres problemáticos"""
    # Reemplazar caracteres problemáticos
    replacements = {
        '\u2018': "'",  # ' izquierda
        '\u2019': "'",  # ' derecha
        '\u201c': '"',  # " izquierda
        '\u201d': '"',  # " derecha
        '\u2022': '*',  # bullet
        '\u2013': '-',  # guion corto
        '\u2014': '--', # guion largo
        '\xa0': ' ',    # espacio no-breaking
    }

    for old, new in replacements.items():
        content = content.replace(old, new)

    # Eliminar #### extras
    content = re.sub(r'^####+', '##', content, flags=re.MULTILINE)

    return content


def markdown_to_html(content):
    """Convierte markdown a HTML simple"""
    content = clean_content(content)
    lines = content.split('\n')
    html = []
    section_num = 0

    # Extraer título
    title = "Material de Sesión"
    title_found = False
    remaining_lines = []

    for line in lines:
        line_stripped = line.strip()
        if not title_found and (line_stripped.startswith('# ') or line_stripped.startswith('## ')):
            if line_stripped.startswith('# '):
                title = line_stripped[2:].strip()
            elif line_stripped.startswith('## '):
                title = line_stripped[3:].strip()
            title_found = True
        elif title_found or not line_stripped.startswith('#'):
            remaining_lines.append(line_stripped)

    i = 0
    while i < len(remaining_lines):
        line = remaining_lines[i]

        if not line:
            i += 1
            continue

        # Secciones ##
        if line.startswith('## '):
            section_num += 1
            text = re.sub(r'^##\s*\d+\.?\s*', '', line)
            html.append(f'<div class="section">')
            html.append(f'<div class="section-title">')
            html.append(f'<span class="section-number">{section_num}</span>')
            html.append(f'<span>{text}</span>')
            html.append(f'</div>')

        # Subsecciones ###
        elif line.startswith('### '):
            text = re.sub(r'^###\s*\d+\.?\s*', '', line)
            html.append(f'<h3>{text}</h3>')

        # Listas con viñetas
        elif line.startswith('- '):
            html.append('<ul>')
            while i < len(remaining_lines) and remaining_lines[i].startswith('- '):
                text = remaining_lines[i][2:]
                text = re.sub(r'\*\*(.+?)\*\*', r'<strong>\1</strong>', text)
                html.append(f'<li>{text}</li>')
                i += 1
            html.append('</ul>')
            i -= 1  # Ajustar porque el loop incrementará

        # Listas numeradas
        elif re.match(r'^\d+\.', line):
            html.append('<ol>')
            while i < len(remaining_lines) and re.match(r'^\d+\.', remaining_lines[i]):
                text = re.sub(r'^\d+\.?\s*', '', remaining_lines[i])
                text = re.sub(r'\*\*(.+?)\*\*', r'<strong>\1</strong>', text)
                html.append(f'<li>{text}</li>')
                i += 1
            html.append('</ol>')
            i -= 1

        # Texto normal
        else:
            text = re.sub(r'\*\*(.+?)\*\*', r'<strong>\1</strong>', line)
            html.append(f'<p>{text}</p>')

        i += 1

    # Cerrar última sección
    if html and html[-1].startswith('<div class="section">'):
        html.append('</div>')

    return '\n'.join(html), title


def create_pdf(md_file):
    """Crea un PDF desde markdown"""
    try:
        # Leer markdown
        with open(md_file, 'r', encoding='utf-8', errors='ignore') as f:
            content = f.read()

        # Convertir a HTML
        body_html, title = markdown_to_html(content)

        # Crear HTML completo
        html_content = HTML_TEMPLATE.format(title=title, content=body_html)

        # Guardar HTML temporal
        html_file = md_file.with_suffix('.html')
        with open(html_file, 'w', encoding='utf-8') as f:
            f.write(html_content)

        # Generar PDF con weasyprint
        pdf_path = OUTPUT_DIR / (md_file.stem + '.pdf')
        result = os.system(f'source /Users/javierbenitez/Desktop/AI/olvidos/tts_env/bin/activate && python3 -c "from weasyprint import HTML; HTML(string=open(\'{html_file}\').read()).write_pdf(\'{pdf_path}\')" 2>/dev/null')

        # Limpiar HTML temporal
        html_file.unlink()

        if result == 0:
            print(f"✓ Generado: {md_file.stem + '.pdf'}")
            return True
        else:
            # Intentar método directo con weasyprint
            try:
                from weasyprint import HTML
                HTML(string=html_content).write_pdf(str(pdf_path))
                print(f"✓ Generado: {md_file.stem + '.pdf'}")
                return True
            except Exception as e2:
                print(f"❌ Error: {md_file.stem + '.pdf'} - {e2}")
                return False

    except Exception as e:
        print(f"❌ Excepción: {md_file.name}: {e}")
        return False


def main():
    print("📚 Generador de PDFs - Producción e Interacción Oral")
    print("=" * 60)
    print()

    md_files = sorted(CONTENT_DIR.glob("*.md"))

    if not md_files:
        print("❌ No se encontraron archivos markdown")
        return

    print(f"📁 Encontrados {len(md_files)} archivos")
    print()

    count = 0
    for md_file in md_files:
        if md_file.name in ['README.md', 'INDICE.md']:
            continue

        if create_pdf(md_file):
            count += 1

    print()
    print(f"✅ Total de PDFs generados: {count}")
    print(f"📁 Ubicación: {OUTPUT_DIR}")


if __name__ == "__main__":
    main()

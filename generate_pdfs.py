#!/usr/bin/env python3
"""
Generador de PDFs para el curso de español C1
Usa fpdf para crear PDFs con el estilo del curso
"""

import os
import sys
import re
from pathlib import Path
from fpdf import FPDF
from datetime import datetime

# Configuración
OUTPUT_DIR = Path("/Users/javierbenitez/Desktop/AI/oral7/public/resources")
CONTENT_DIR = Path("/Users/javierbenitez/Desktop/AI/oral7/contenido-pdfs")
OUTPUT_DIR.mkdir(parents=True, exist_ok=True)


class SpanishC1PDF(FPDF):
    """Clase personalizada para generar PDFs con el estilo del curso"""

    def __init__(self, title, subtitle, session_num=0):
        super().__init__(encoding='UTF-8')
        self.title = title
        self.subtitle = subtitle
        self.session_num = session_num
        self.set_auto_page_break(auto=True, margin=20)

    def header(self):
        """Encabezado del PDF"""
        # Línea superior decorativa
        self.set_fill_color(59, 130, 246)  # Azul
        self.rect(0, 0, 210, 3, 'F')

        # Título del curso
        self.set_font('Arial', 'B', 10)
        self.set_text_color(100, 100, 100)
        self.cell(0, 8, 'Spanish C1 Oral Course - Producción e Interacción Oral', 0, 1, 'C')

        # Línea
        self.set_draw_color(200, 200, 200)
        self.line(10, 14, 200, 14)

    def footer(self):
        """Pie de página del PDF"""
        self.set_y(-15)
        self.set_font('Arial', 'I', 8)
        self.set_text_color(150, 150, 150)
        self.cell(0, 5, f'Página {self.page_no()}/{{nb}}', 0, 0, 'C')

    def chapter_title(self, num, label):
        """Título de capítulo con número en círculo"""
        self.set_font('Arial', 'B', 14)
        self.set_text_color(59, 130, 246)
        self.ln(10)

        # Dibujar círculo con número
        self.set_fill_color(59, 130, 246)
        self.ellipse(self.get_x() + 2, self.get_y() + 2, 6, 6, 'F')
        self.set_text_color(255, 255, 255)
        self.set_font('Arial', 'B', 10)
        self.cell(10, 8, str(num), 0, 0, 'C')

        # Título
        self.set_text_color(59, 130, 246)
        self.set_font('Arial', 'B', 14)
        self.cell(0, 8, label, 0, 1, 'L')
        self.set_text_color(0, 0, 0)
        self.ln(4)

    def subchapter_title(self, label):
        """Subtítulo de sección"""
        self.set_font('Arial', 'B', 11)
        self.set_text_color(44, 62, 80)
        self.cell(0, 6, label, 0, 1, 'L')
        self.ln(2)

    def body_text(self, text):
        """Texto de cuerpo"""
        self.set_font('Arial', '', 10)
        self.set_text_color(51, 51, 51)
        self.multi_cell(0, 5, text)
        self.ln(2)

    def bullet_point(self, text, indent=10):
        """Punto de viñeta"""
        self.set_font('Arial', '', 10)
        self.set_text_color(51, 51, 51)
        self.set_x(indent)
        self.cell(5, 5, '*', 0, 0)  # Bullet simple
        self.multi_cell(0, 5, text)
        self.ln(1)

    def example_box(self, text):
        """Caja de ejemplo"""
        self.set_fill_color(243, 244, 246)
        self.rect(10, self.get_y(), 190, 0, 'F', 5)
        self.set_x(15)
        self.set_font('Arial', 'I', 9)
        self.set_text_color(70, 70, 70)
        self.multi_cell(175, 5, text)
        self.ln(5)

    def important_box(self, text):
        """Caja de información importante"""
        self.set_fill_color(255, 243, 224)
        self.rect(10, self.get_y(), 190, 0, 'F', 5)
        self.set_x(15)
        self.set_font('Arial', 'B', 9)
        self.set_text_color(180, 83, 9)
        self.cell(175, 5, 'IMPORTANTE: ', 0, 0)
        self.set_font('Arial', '', 9)
        self.multi_cell(175, 5, text)
        self.ln(5)


def create_session_pdf(session_num, title, content, filename):
    """Crea un PDF para una sesión"""
    pdf = SpanishC1PDF(title, f"Sesión {session_num}", session_num)
    pdf.add_page()

    # Título principal
    pdf.set_font('Arial', 'B', 18)
    pdf.set_text_color(44, 62, 80)
    pdf.cell(0, 12, title, 0, 1, 'C')
    pdf.ln(5)

    # Contenido
    lines = content.split('\n')
    chapter_num = 0

    i = 0
    while i < len(lines):
        line = lines[i].strip()

        # Títulos de capítulo (##)
        if line.startswith('## '):
            chapter_num += 1
            pdf.chapter_title(chapter_num, line[3:])
            i += 1

        # Subtítulos (###)
        elif line.startswith('### '):
            pdf.subchapter_title(line[4:])
            i += 1

        # Cajas de ejemplo
        elif line.startswith('> **Ejemplo'):
            example_text = ''
            i += 1
            while i < len(lines) and lines[i].strip().startswith('>'):
                example_text += lines[i].strip()[1:] + '\n'
                i += 1
            pdf.example_box(example_text.strip())

        # Cajas importantes
        elif line.startswith('! ') or line.startswith('⚠️'):
            important_text = line
            i += 1
            pdf.important_box(important_text)

        # Listas con viñetas
        elif line.startswith('- '):
            pdf.bullet_point(line[2:])
            i += 1

        # Listas numeradas
        elif re.match(r'^\d+\.', line):
            pdf.bullet_point(line)
            i += 1

        # Texto normal
        elif line and not line.startswith('#'):
            pdf.body_text(line)
            i += 1

        # Líneas vacías
        else:
            i += 1

    # Guardar PDF
    output_path = OUTPUT_DIR / filename
    pdf.output(str(output_path))
    print(f"✓ Generado: {filename}")
    return str(output_path)


def main():
    """Función principal"""
    print("📚 Generador de PDFs - Spanish C1 Oral Course")
    print("=" * 50)

    # Crear directorio de salida
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

    # Leer archivos markdown
    md_files = sorted(CONTENT_DIR.glob("*.md"))

    if not md_files:
        print("❌ No se encontraron archivos markdown en:", CONTENT_DIR)
        return

    print(f"📁 Encontrados {len(md_files)} archivos markdown")
    print()

    # Procesar cada archivo
    for md_file in md_files:
        if md_file.name in ['README.md', 'INDICE.md']:
            continue

        try:
            with open(md_file, 'r', encoding='utf-8') as f:
                content = f.read()

            # Extraer título del contenido
            title = md_file.stem.replace('-', ' ').title()
            for line in content.split('\n')[:10]:
                if line.startswith('# '):
                    title = line[2:].strip()
                    break

            # Generar nombre de archivo PDF
            pdf_filename = md_file.stem + '.pdf'

            # Crear PDF
            create_session_pdf(0, title, content, pdf_filename)

        except Exception as e:
            print(f"❌ Error procesando {md_file.name}: {e}")

    print()
    print("✅ PDFs generados exitosamente en:", OUTPUT_DIR)
    print(f"📊 Total de PDFs: {len([f for f in md_files if f.name not in ['README.md', 'INDICE.md']])}")


if __name__ == "__main__":
    main()

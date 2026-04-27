#!/usr/bin/env python3
"""
Script simple para generar PDFs con el estilo correcto
Usa conversión markdown -> latex -> pdf con encabezado personalizado
"""

import os
import subprocess
import re
from pathlib import Path

OUTPUT_DIR = Path("/Users/javierbenitez/Desktop/AI/oral7/public/resources")
CONTENT_DIR = Path("/Users/javierbenitez/Desktop/AI/oral7/contenido-pdfs")
OUTPUT_DIR.mkdir(parents=True, exist_ok=True)


# Encabezado LaTeX
HEADER = r"""\documentclass[a4paper,11pt]{article}
\usepackage[utf8]{inputenc}
\usepackage[spanish]{babel}
\usepackage{geometry}
\usepackage{enumitem}
\usepackage{sectsty}
\usepackage{titlesec}
\usepackage{tikz}
\usepackage{array}

\geometry{
    a4paper,
    left=20mm,
    top=18mm,
    right=20mm,
    bottom=20mm
}

% Sin números de página
\pagestyle{empty}

% Estilo de secciones con números en círculos
\newcommand{\circled}[1]{%
    \tikz[baseline=(char.base)]{%
        \node[shape=circle,draw,inner sep=0.5pt,fill=black,text=white,font=\bfseries\footnotesize] (char) {#1};%
    }%
}

% Formato de secciones
\titleformat{\section}
{\normalfont\Large\bfseries}
{\circled{\thesection}}{0.5em}{}

\titlespacing*{\section}{0pt}{12pt}{8pt}

\titleformat{\subsection}
{\normalfont\normalsize\bfseries}
{}{0em}{}

\titlespacing*{\subsection}{8pt}{4pt}{4pt}

\begin{document}

% Encabezado del curso
\begin{center}
\small{Universidad de Granada}

\vspace{0.3cm}

\textbf{\large{Producción e Interacción Oral - Nivel 7}}

\vspace{0.4cm}

\small
\begin{tabular}{@{}ll@{}}
\textbf{Grupos:} & A (Aula 24) y B (Aula 08) \\
\textbf{Centro:} & Centro de Lenguas Modernas / Edificio A \\
\textbf{Profesor:} & Javier Benítez Lainez \\
\textbf{Tutorías:} & Martes 9:00-10:00 y 14:30-15:30 \\
& Sala de profesores / Email: benitezl@go.ugr.es
\end{tabular}
\end{center}

\vspace{0.5cm}
"""

FOOTER = r"""
\end{document}
"""


def clean_markdown_for_latex(content):
    """Limpia markdown para LaTeX"""
    # Eliminar # extras
    content = re.sub(r'^####+', '##', content, flags=re.MULTILINE)
    # Eliminar espacios innecesarios
    lines = content.split('\n')
    cleaned = []
    for line in lines:
        line = line.strip()
        if line or (not cleaned or cleaned[-1] != ''):
            cleaned.append(line)
    return '\n'.join(cleaned)


def convert_md_to_latex(content):
    """Convierte markdown básico a LaTeX"""
    content = clean_markdown_for_latex(content)
    lines = content.split('\n')
    latex = []
    section_num = 0

    # Extraer título y restantes líneas
    title = "Material de Sesión"
    title_found = False
    remaining_lines = []

    for i, line in enumerate(lines):
        line = line.strip()
        if not title_found and (line.startswith('# ') or line.startswith('## ')):
            if line.startswith('# '):
                title = line[2:].strip()
            elif line.startswith('## '):
                title = line[3:].strip()
            title_found = True
        elif title_found or not (line.startswith('# ') or line.startswith('## ')):
            remaining_lines.append(line)

    # Agregar título centrado
    latex.append(f"\\section*{{{title}}}\n")
    latex.append("\\vspace{0.4cm}\n")

    i = 0
    while i < len(remaining_lines):
        line = remaining_lines[i]

        if not line:
            latex.append("\\vspace{0.2cm}\n")
            i += 1
            continue

        # Secciones ##
        if line.startswith('## '):
            section_num += 1
            text = line[3:].strip()
            text = re.sub(r'^\d+\.?\s*', '', text)  # Eliminar número al inicio
            latex.append(f"\\section{{{text}}}\n")
            i += 1

        # Subsecciones ###
        elif line.startswith('### '):
            text = line[4:].strip()
            text = re.sub(r'^\d+\.?\s*', '', text)
            latex.append(f"\\subsection{{{text}}}\n")
            i += 1

        # Listas con viñetas
        elif line.startswith('- '):
            latex.append("\\begin{itemize}\n")
            while i < len(remaining_lines) and remaining_lines[i].startswith('- '):
                text = remaining_lines[i][2:].strip()
                text = re.sub(r'\*\*(.+?)\*\*', r'\\textbf{\1}', text)
                latex.append(f"  \\item {text}\n")
                i += 1
            latex.append("\\end{itemize}\n")

        # Texto normal
        else:
            line = re.sub(r'\*\*(.+?)\*\*', r'\\textbf{\1}', line)
            latex.append(f"{line}\n")
            i += 1

    return '\n'.join(latex)


def create_pdf(md_file):
    """Crea un PDF desde markdown"""
    try:
        # Leer markdown
        with open(md_file, 'r', encoding='utf-8') as f:
            content = f.read()

        # Convertir a LaTeX
        latex_body = convert_md_to_latex(content)
        full_latex = HEADER + latex_body + FOOTER

        # Escribir archivo .tex temporal
        tex_file = md_file.with_suffix('.tex')
        with open(tex_file, 'w', encoding='utf-8') as f:
            f.write(full_latex)

        # Generar PDF con pdflatex
        pdf_path = OUTPUT_DIR / (md_file.stem + '.pdf')
        result = subprocess.run(
            ['pdflatex', '-interaction=nonstopmode', '-output-directory', str(OUTPUT_DIR), str(tex_file)],
            capture_output=True,
            text=True
        )

        # Limpiar archivos temporales
        for ext in ['.tex', '.log', '.aux']:
            temp_file = tex_file.with_suffix(ext)
            if temp_file.exists():
                temp_file.unlink()

        if result.returncode == 0:
            print(f"✓ Generado: {md_file.stem + '.pdf'}")
            return True
        else:
            print(f"❌ Error: {md_file.stem + '.pdf'} - {result.stderr[:100]}")
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

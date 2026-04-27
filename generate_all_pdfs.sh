#!/bin/bash
# Script para generar PDFs usando pandoc con estilo personalizado

OUTPUT_DIR="/Users/javierbenitez/Desktop/AI/oral7/public/resources"
CONTENT_DIR="/Users/javierbenitez/Desktop/AI/oral7/contenido-pdfs"
TEMPLATE="/Users/javierbenitez/Desktop/AI/oral7/template.tex"

# Crear directorio de salida
mkdir -p "$OUTPUT_DIR"

echo "📚 Generador de PDFs - Producción e Interacción Oral"
echo "======================================================"
echo ""

# Contador
count=0

# Procesar cada archivo markdown
for md_file in "$CONTENT_DIR"/*.md; do
    filename=$(basename "$md_file")

    # Skip README e INDICE
    if [[ "$filename" == "README.md" ]] || [[ "$filename" == "INDICE.md" ]]; then
        continue
    fi

    # Nombre del PDF
    pdf_name="${filename%.md}.pdf"
    pdf_path="$OUTPUT_DIR/$pdf_name"

    # Extraer título del markdown
    title=$(grep -m1 "^# " "$md_file" | sed 's/^# //' || echo "Material de Sesión")

    # Generar PDF con pandoc
    pandoc "$md_file" \
        --from markdown \
        --to pdf \
        --template="$TEMPLATE" \
        -V title="$title" \
        -V geometry:a4paper \
        -V geometry:margin=1.8cm \
        --variable=geometry:margin=1.8cm \
        -o "$pdf_path" \
        2>/dev/null

    if [[ $? -eq 0 ]]; then
        echo "✓ Generado: $pdf_name"
        ((count++))
    else
        echo "❌ Error: $pdf_name"
    fi
done

echo ""
echo "✅ PDFs generados en: $OUTPUT_DIR"
echo "📊 Total de PDFs: $count"
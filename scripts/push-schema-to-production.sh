#!/bin/bash

# Script para aplicar el schema de Prisma a la base de datos de producción
# Uso: ./scripts/push-schema-to-production.sh

echo "🚀 Aplicando schema a la base de datos de producción..."

# Verificar que DATABASE_URL_PRODUCTION existe
if [ -z "$DATABASE_URL_PRODUCTION" ]; then
  echo "❌ Error: DATABASE_URL_PRODUCTION no está definida"
  echo "Por favor, crea esta variable de entorno con la URL de tu base de datos de Neon"
  exit 1
fi

# Aplicar el schema
echo "📊 Ejecutando prisma db push..."
DATABASE_URL="$DATABASE_URL_PRODUCTION" npx prisma db push --skip-generate

if [ $? -eq 0 ]; then
  echo "✅ Schema aplicado exitosamente a producción"
else
  echo "❌ Error aplicando schema"
  exit 1
fi

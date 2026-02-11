#!/bin/bash

# Script para migrar del rate limiting en memoria a Redis
# Uso: ./install-redis-rate-limiting.sh

set -e

echo "🔄 Migrando a Rate Limiting con Redis..."
echo ""

# 1. Instalar dependencia de Redis
echo "1️⃣ Instalando ioredis..."
npm install ioredis@5

echo "✓ ioredis instalado"
echo ""

# 2. Reemplazar imports en todos los archivos que usan rate-limit
echo "2️⃣ Actualizando archivos para usar rate-limit-redis..."

FILES=(
  "src/app/api/auth/register/route.ts"
  "src/app/api/upload/route.ts"
  "src/app/api/submissions/route.ts"
  "src/app/api/checklist/route.ts"
  "src/app/api/contact/route.ts"
  "src/app/api/qr/generate/route.ts"
)

for file in "${FILES[@]}"; do
  if [ -f "$file" ]; then
    # Reemplazar el import de rate-limit por rate-limit-redis
    sed -i '' 's|from "@/lib/rate-limit"|from "@/lib/rate-limit-redis"|g' "$file"
    echo "✓ Actualizado: $file"
  fi
done

echo ""
echo "3️⃣ El archivo rate-limit.ts original se mantiene como backup"
echo ""

# 4. Verificar que REDIS_URL esté en .env.example
echo "4️⃣ Actualizando .env.example..."
if ! grep -q "REDIS_URL" .env.example; then
  echo "" >> .env.example
  echo "# Redis para rate limiting (Railway o Upstash)" >> .env.example
  echo 'REDIS_URL="redis://localhost:6379"' >> .env.example
  echo "✓ .env.example actualizado"
else
  echo "✓ .env.example ya tiene REDIS_URL"
fi

echo ""
echo "═══════════════════════════════════════════════════════════"
echo "✅ Migración completada!"
echo ""
echo "📋 PRÓXIMOS PASOS:"
echo ""
echo "1. Crea Redis en Railway:"
echo "   - Ve a: https://railway.app/"
echo "   - New Service > Database > Add Redis"
echo ""
echo "2. Copia la variable REDIS_URL de Railway"
echo ""
echo "3. Agrega REDIS_URL en Vercel:"
echo "   - Ve a: https://vercel.com/javierbenitezs-projects/oral7/settings/environment-variables"
echo "   - Agrega: REDIS_URL = (tu URL de Railway)"
echo "   - Selecciona: Production, Preview, Development"
echo ""
echo "4. Haz commit y push:"
echo "   git add ."
echo "   git commit -m 'feat: Migrate rate limiting to Redis'"
echo "   git push"
echo ""
echo "═══════════════════════════════════════════════════════════"

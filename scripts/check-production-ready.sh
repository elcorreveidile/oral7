#!/bin/bash

# Script de verificación pre-deploy para PIO-7
# Ejecutar antes de hacer deploy a producción

echo "========================================"
echo "🔍 VERIFICACIÓN PRE-DEPLOY"
echo "========================================"
echo ""

# Colores
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Contador de errores
ERRORS=0

# Función para imprimir resultado
print_result() {
    if [ $1 -eq 0 ]; then
        echo -e "${GREEN}✅ $2${NC}"
    else
        echo -e "${RED}❌ $2${NC}"
        ERRORS=$((ERRORS + 1))
    fi
}

# 1. Verificar que estamos en main
echo "📍 Verificando rama..."
BRANCH=$(git branch --show-current)
if [ "$BRANCH" = "main" ]; then
    print_result 0 "En rama main"
else
    print_result 1 "No estás en main (actual: $BRANCH)"
fi

# 2. Verificar cambios no commiteados
echo ""
echo "📝 Verificando cambios pendientes..."
CHANGES=$(git status --porcelain)
if [ -z "$CHANGES" ]; then
    print_result 0 "No hay cambios pendientes"
else
    print_result 1 "Hay cambios sin commitear"
    echo "$CHANGES"
fi

# 3. Verificar que el build funciona
echo ""
echo "🏗️  Verificando build..."
npm run build > /dev/null 2>&1
print_result $? "Build exitoso"

# 4. Verificar linting
echo ""
echo "🎨 Verificando linting..."
npm run lint > /dev/null 2>&1
print_result $? "Linting sin errores críticos"

# 5. Verificar variables de entorno requeridas
echo ""
echo "🔐 Verificando variables de entorno..."
REQUIRED_VARS=("DATABASE_URL" "NEXTAUTH_SECRET" "NEXTAUTH_URL")
for VAR in "${REQUIRED_VARS[@]}"; do
    if [ -n "${!VAR}" ]; then
        print_result 0 "$VAR configurada"
    else
        print_result 1 "$VAR no configurada"
    fi
done

# 6. Verificar Redis (opcional pero recomendado)
echo ""
echo "📦 Verificando Redis..."
if [ -n "$REDIS_URL" ]; then
    print_result 0 "REDIS_URL configurada"
else
    echo -e "${YELLOW}⚠️  REDIS_URL no configurada - Rate limiting deshabilitado${NC}"
fi

# 7. Verificar schema de base de datos
echo ""
echo "🗄️  Verificando schema de base de datos..."
npx prisma generate > /dev/null 2>&1
print_result $? "Prisma client generado"

# 8. Verificar tests de seguridad
echo ""
echo "🧪 Ejecutando tests de seguridad..."
npx tsx scripts/test-security-features.ts > /dev/null 2>&1
if [ $? -eq 0 ]; then
    print_result 0 "Tests de seguridad pasaron"
else
    print_result 1 "Tests de seguridad fallaron (ejecuta manualmente para detalles)"
fi

# 9. Verificar archivos críticos
echo ""
echo "📁 Verificando archivos críticos..."
CRITICAL_FILES=(
    "src/lib/twoFactor.ts"
    "src/lib/audit-logger.ts"
    "src/lib/rate-limit-redis.ts"
    "src/app/(main)/admin/configuracion/2fa/page.tsx"
    "src/app/(main)/admin/auditoria/page.tsx"
)

for FILE in "${CRITICAL_FILES[@]}"; do
    if [ -f "$FILE" ]; then
        print_result 0 "$FILE existe"
    else
        print_result 1 "$FILE no encontrado"
    fi
done

# 10. Verificar que el schema tiene los modelos necesarios
echo ""
echo "📊 Verificando modelos en schema..."
if grep -q "twoFactorEnabled" prisma/schema.prisma; then
    print_result 0 "Modelo User tiene campos 2FA"
else
    print_result 1 "Modelo User no tiene campos 2FA"
fi

if grep -q "model AuditLog" prisma/schema.prisma; then
    print_result 0 "Modelo AuditLog existe"
else
    print_result 1 "Modelo AuditLog no encontrado"
fi

# Resumen
echo ""
echo "========================================"
echo "📊 RESUMEN"
echo "========================================"
echo ""

if [ $ERRORS -eq 0 ]; then
    echo -e "${GREEN}✅ TODO LISTO PARA DEPLOY${NC}"
    echo ""
    echo "Próximos pasos:"
    echo "1. git push origin main"
    echo "2. Verificar deploy en Vercel dashboard"
    echo "3. Aplicar migración DB si es necesario"
    echo "4. Activar 2FA en cuenta admin"
    echo "5. Verificar funcionalidades post-deploy"
    exit 0
else
    echo -e "${RED}❌ HAY $ERRORS ERROR(ES) QUE DEBEN CORREGIRSE${NC}"
    echo ""
    echo "Corrige los errores antes de hacer deploy."
    exit 1
fi

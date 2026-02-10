#!/bin/bash

# Script de verificación de seguridad para producción
# Uso: ./check-production-security.sh

echo "🔍 Verificando seguridad de producción..."
echo ""

# Colores
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

ERRORS=0
WARNINGS=0

# 1. Verificar que .gitignore excluya archivos .env
echo "1️⃣ Verificando .gitignore..."
if grep -q "^\.env$" .gitignore && grep -q "^\.env\*\.local$" .gitignore; then
    echo -e "${GREEN}✓ .gitignore configura correctamente${NC}"
else
    echo -e "${RED}✗ .gitignore NO excluye archivos .env correctamente${NC}"
    ERRORS=$((ERRORS + 1))
fi

# 2. Verificar que no haya archivos .env sensibles en Git
echo ""
echo "2️⃣ Verificando archivos .env en Git..."
ENV_FILES=$(git ls-files | grep -E "^\.env" | grep -v "\.example$")
if [ -z "$ENV_FILES" ]; then
    echo -e "${GREEN}✓ No hay archivos .env sensibles en Git${NC}"
else
    echo -e "${RED}✗ Archivos .env sensibles encontrados en Git:${NC}"
    echo "$ENV_FILES"
    echo -e "${YELLOW}⚠️  Ejecuta: git rm --cached <archivo>${NC}"
    ERRORS=$((ERRORS + 1))
fi

# 3. Verificar variables de entorno necesarias
echo ""
echo "3️⃣ Verificando variables de entorno..."
REQUIRED_VARS=("DATABASE_URL" "NEXTAUTH_SECRET" "NEXTAUTH_URL" "STUDENT_INVITE_CODE")
MISSING_VARS=()

for var in "${REQUIRED_VARS[@]}"; do
    if ! grep -q "^$var=" .env.local 2>/dev/null; then
        MISSING_VARS+=("$var")
    fi
done

if [ ${#MISSING_VARS[@]} -eq 0 ]; then
    echo -e "${GREEN}✓ Variables de entorno necesarias encontradas${NC}"
else
    echo -e "${YELLOW}⚠️  Faltan variables de entorno: ${MISSING_VARS[*]}${NC}"
    WARNINGS=$((WARNINGS + 1))
fi

# 4. Verificar si hay rate limiting configurado
echo ""
echo "4️⃣ Verificando configuración de rate limiting..."
if grep -q "UPSTASH_REDIS_REST_URL" .env.local 2>/dev/null; then
    echo -e "${GREEN}✓ Upstash Redis configurado${NC}"
else
    echo -e "${YELLOW}⚠️  Upstash Redis NO configurado - Rate limiting NO funcionará en producción${NC}"
    echo -e "${YELLOW}   Ver: PRODUCCION-CAMBIOS-NECESARIOS.md - PASO 1${NC}"
    WARNINGS=$((WARNINGS + 1))
fi

# 5. Verificar si hay credenciales expuestas en código
echo ""
echo "5️⃣ Buscando credenciales expuestas en código..."
DANGEROUS_PATTERNS=("api_key" "secret" "password" "token")
FOUND_CREDENTIALS=0

for pattern in "${DANGEROUS_PATTERNS[@]}"; do
    # Buscar en archivos TypeScript/JavaScript (excluyendo node_modules y .next)
    RESULTS=$(grep -r "$pattern" src/ --include="*.ts" --include="*.tsx" --include="*.js" --include="*.jsx" 2>/dev/null | grep -v "// " | grep -v "process.env" | head -5)
    if [ -n "$RESULTS" ]; then
        if [ $FOUND_CREDENTIALS -eq 0 ]; then
            echo -e "${YELLOW}⚠️  Posibles credenciales encontradas:${NC}"
            FOUND_CREDENTIALS=1
        fi
        echo "$RESULTS"
    fi
done

if [ $FOUND_CREDENTIALS -eq 0 ]; then
    echo -e "${GREEN}✓ No se encontraron credenciales obvias en el código${NC}"
fi

# 6. Verificar que console.log no esté en producción
echo ""
echo "6️⃣ Buscando console.log en código..."
CONSOLE_LOGS=$(grep -r "console\." src/ --include="*.ts" --include="*.tsx" 2>/dev/null | wc -l | tr -d ' ')
if [ "$CONSOLE_LOGS" -eq 0 ]; then
    echo -e "${GREEN}✓ No hay console.log en el código${NC}"
else
    echo -e "${YELLOW}⚠️  Se encontraron $CONSOLE_LOGS llamadas a console.*${NC}"
fi

# Resumen
echo ""
echo "═══════════════════════════════════════════════════════════"
if [ $ERRORS -eq 0 ] && [ $WARNINGS -eq 0 ]; then
    echo -e "${GREEN}✅ Todo parece estar bien configurado${NC}"
    exit 0
elif [ $ERRORS -eq 0 ]; then
    echo -e "${YELLOW}⚠️  $WARNINGS advertencia(s) encontrada(s)${NC}"
    echo "Revisa PRODUCCION-CAMBIOS-NECESARIOS.md para más detalles"
    exit 0
else
    echo -e "${RED}❌ $ERRORS error(es) y $WARNINGS advertencia(s) encontrados${NC}"
    echo "Por favor corrige los errores antes de hacer deploy a producción"
    exit 1
fi

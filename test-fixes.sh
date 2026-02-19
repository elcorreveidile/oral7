#!/bin/bash

echo "🧪 TEST SUITE - CORRECCIONES IMPLEMENTADAS"
echo "=========================================="
echo ""

GREEN='\033[0;32m'
RED='\033[0;31m'
NC='\033[0m'

pass=0
fail=0

echo "📦 VERIFICACIONES AUTOMATIZADAS"
echo "------------------------------"

# Test 1: Next.js versión
if grep -q '"next": "14.2.35"' package.json; then
    echo -e "${GREEN}✓ Next.js 14.2.35${NC}"
    ((pass++))
else
    echo -e "${RED}✗ Next.js versión incorrecta${NC}"
    ((fail++))
fi

# Test 2: Console.logs
console_logs=$(grep -r "console\.log\|console\.warn" src/ --include="*.ts" --include="*.tsx" 2>/dev/null | wc -l | tr -d ' ')
if [ "$console_logs" = "0" ]; then
    echo -e "${GREEN}✓ Sin console.logs ($console_logs)${NC}"
    ((pass++))
else
    echo -e "${RED}✗ Hay $console_logs console.logs${NC}"
    ((fail++))
fi

# Test 3: html5-qrcode
if grep -q '"html5-qrcode"' package.json; then
    echo -e "${GREEN}✓ html5-qrcode instalado${NC}"
    ((pass++))
else
    echo -e "${RED}✗ Falta html5-qrcode${NC}"
    ((fail++))
fi

# Test 4: Transacciones (usando find para evitar paréntesis)
if find src/app/api/admin/update-session -name "*.ts" -exec grep -l 'prisma.$transaction' {} \; 2>/dev/null | grep -q .; then
    echo -e "${GREEN}✓ Transacciones en update-session${NC}"
    ((pass++))
else
    echo -e "${RED}✗ Sin transacciones${NC}"
    ((fail++))
fi

# Test 5: Memory leak fix
if find src/app -name "page.tsx" -path "*/admin/estudiantes/*" -exec grep -l 'URL.revokeObjectURL' {} \; 2>/dev/null | grep -q .; then
    echo -e "${GREEN}✓ Memory leak arreglado${NC}"
    ((pass++))
else
    echo -e "${RED}✗ Memory leak sin arreglar${NC}"
    ((fail++))
fi

# Test 6: N+1 fix
if find src/app/api/admin/submissions -name "*.ts" -exec grep -l 'Array.from(uniqueSessionNumbers)' {} \; 2>/dev/null | grep -q .; then
    echo -e "${GREEN}✓ N+1 query optimizado${NC}"
    ((pass++))
else
    echo -e "${RED}✗ N+1 no optimizado${NC}"
    ((fail++))
fi

# Test 7: GET /api/progress
if find src/app/api/progress -name "*.ts" -exec grep -l 'export async function GET' {} \; 2>/dev/null | grep -q .; then
    echo -e "${GREEN}✓ GET /api/progress implementado${NC}"
    ((pass++))
else
    echo -e "${RED}✗ GET /api/progress faltante${NC}"
    ((fail++))
fi

# Test 8: Upload fallback
if find src/app/api/upload -name "*.ts" -exec grep -l 'writeFile' {} \; 2>/dev/null | grep -q .; then
    echo -e "${GREEN}✓ Fallback uploads implementado${NC}"
    ((pass++))
else
    echo -e "${RED}✗ Fallback uploads faltante${NC}"
    ((fail++))
fi

echo ""
echo "📊 RESULTADO: $pass/$((pass+fail)) tests pasaron"
echo ""

if [ $fail -eq 0 ]; then
    echo -e "${GREEN}✓ TODOS LOS TESTS PASARON${NC}"
    echo ""
    echo "🚀 PARA PRUEBAS MANUALES:"
    echo "   npm run dev"
    echo "   Abrir http://localhost:3000"
    echo ""
    echo "📋 VERIFICAR MANUALMENTE:"
    echo "   1. Escáner QR: /asistencia → Activar cámara"
    echo "   2. Dashboard: /dashboard → Ver stats reales"
    echo "   3. Upload: /entregas → Subir archivo"
    echo "   4. Admin: /admin/estudiantes → Exportar CSV"
else
    echo -e "${RED}✗ $fail TESTS FALLARON${NC}"
fi

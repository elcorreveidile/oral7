# 🧪 GUÍA DE PRUEBAS MANUALES

## Preparación

```bash
# 1. Instalar dependencias si es necesario
npm install

# 2. Ejecutar tests automatizados
./test-fixes.sh

# 3. Iniciar servidor de desarrollo
npm run dev

# 4. Abrir en navegador
open http://localhost:3000
```

---

## ✅ TEST 1: Escáner QR Real

### Objetivo
Verificar que el escáner QR funciona con la cámara real del dispositivo.

### Pasos
1. Inicia sesión como **estudiante**
2. Navega a `/asistencia`
3. Haz clic en la pestaña **"Escanear QR"**
4. Haz clic en el botón **"Activar cámara"**
5. Concede permisos de cámara cuando el navegador lo pida
6. Apunta la cámara a un código QR

### Resultado Esperado
- ✅ La cámara se activa y muestra video en tiempo real
- ✅ Aparece un recuadro de guía sobre el video
- ✅ Al escanear un QR, se registra la asistencia automáticamente
- ✅ Si el QR no es válido, muestra un error amigable

### Generar QR de prueba
1. Inicia sesión como **admin**
2. Ve a `/admin/qr`
3. Selecciona una sesión
4. Genera un código QR
5. Escanea ese QR desde `/asistencia`

---

## ✅ TEST 2: Dashboard con Datos Reales

### Objetivo
Verificar que el dashboard muestra estadísticas reales del estudiante.

### Pasos
1. Inicia sesión como **estudiante**
2. Navega a `/dashboard`
3. Revisa las estadísticas mostradas:
   - Asistencia (%)
   - Sesiones completadas
   - Progreso de checklist

### Verificar en Base de Datos
```bash
# Abrir Prisma Studio
npx prisma studio

# Revisar tablas:
# - UserProgress (sesiones vistas por el estudiante)
# - Attendance (asistencias registradas)
# - UserChecklistItem (items completados)
```

### Resultado Esperado
- ✅ Los números en el dashboard coinciden con la BD
- ✅ No están hardcoded en 0%
- ✅ Se actualizan cuando hay nuevos datos

### API Endpoint
```bash
# Probar endpoint directamente
curl http://localhost:3000/api/progress \
  -H "Cookie: next-auth.session-token=YOUR_TOKEN"
```

---

## ✅ TEST 3: Upload de Archivos con Fallback

### Objetivo
Verificar que los uploads funcionan incluso sin BLOB_READ_WRITE_TOKEN.

### Pasos (Desarrollo)
1. Asegúrate de que `BLOB_READ_WRITE_TOKEN` no está configurado
2. Inicia sesión como **estudiante**
3. Navega a `/entregas`
4. Selecciona una sesión
5. Sube un archivo (audio, video o PDF)

### Resultado Esperado
- ✅ El archivo se guarda en `public/uploads/`
- ✅ El nombre del archivo incluye timestamp: `1234567890-miarchivo.pdf`
- ✅ La URL devuelta es `/uploads/1234567890-miarchivo.pdf`
- ✅ Puedes acceder al archivo en `http://localhost:3000/uploads/...`

### Verificar archivo
```bash
# Listar archivos subidos
ls -la public/uploads/

# Deberías ver archivos como:
# 1234567890-grabacion.webm
# 1234567891-documento.pdf
```

---

## ✅ TEST 4: Memory Leak - Exportar CSV

### Objetivo
Verificar que no hay memory leaks al exportar CSV.

### Pasos
1. Inicia sesión como **admin**
2. Navega a `/admin/estudiantes`
3. Haz clic en **"Exportar CSV"**
4. Abre Chrome DevTools → **Memory**
5. Toma un **Heap Snapshot** antes de exportar
6. Exporta el CSV varias veces
7. Toma otro **Heap Snapshot**

### Resultado Esperado
- ✅ No hay increase de "Detached DOM nodes"
- ✅ No hay increase de "Strings"
- ✅ El archivo CSV se descarga correctamente
- ✅ No hay errores en la consola

### Verificar código
```bash
# Confirmar que hay cleanup
grep "URL.revokeObjectURL" src/app/(main)/admin/estudiantes/page.tsx
```

---

## ✅ TEST 5: N+1 Query - Admin Submissions

### Objetivo
Verificar que la optimización de queries funciona.

### Pasos
1. Inicia sesión como **admin**
2. Navega a `/admin/entregas`
3. Abre Chrome DevTools → **Network**
4. Observa la petición `/api/admin/submissions`
5. Revisa el tiempo de respuesta

### Resultado Esperado
- ✅ La respuesta es rápida (< 1 segundo)
- ✅ Solo hay **2 queries** a la base de datos (no 101)
- ✅ Todas las submissions se muestran correctamente

### Habilitar logs de Prisma
```bash
# Para ver las queries en tiempo real
DEBUG="prisma:query" npm run dev
```

Deberías ver algo como:
```
prisma:submission.findMany (1 query)
prisma:session.findMany (1 query)
```

NO deberías ver múltiples queries en un loop.

---

## ✅ TEST 6: Transacciones - Update Session

### Objetivo
Verificar que las operaciones son atómicas.

### Pasos
1. Abre Prisma Studio: `npx prisma studio`
2. Observa estas tablas:
   - `Session`
   - `ChecklistItem`
   - `Resource`
   - `Task`
3. Ejecuta el endpoint:
   ```bash
   curl "http://localhost:3000/api/admin/update-session?secret=TU_SECRET&session=2"
   ```

### Resultado Esperado
- ✅ Todas las tablas se actualizan correctamente
- ✅ Si hay error, ninguna tabla se modifica (rollback)
- ✅ Los datos son consistentes entre tablas

### Verificar código
```bash
# Confirmar que usa transacción
grep 'prisma.$transaction' src/app/api/admin/update-session/route.ts
```

---

## ✅ TEST 7: Console Logs Eliminados

### Objetivo
Verificar que no hay logs de debug en producción.

### Pasos
1. Haz build de producción:
   ```bash
   npm run build
   npm start
   ```
2. Abre la aplicación
3. Abre DevTools → **Console**
4. Navega por todas las páginas

### Resultado Esperado
- ✅ Console limpio, sin logs de debug
- ✅ Solo mensajes de error reales (si los hay)

### Verificar código
```bash
# Contar console.logs
grep -r "console\.log\|console\.warn" src/ --include="*.ts" --include="*.tsx" | wc -l

# Resultado esperado: 0
```

---

## ✅ TEST 8: Actualización Next.js

### Objetivo
Verificar que Next.js está actualizado.

### Pasos
1. Revisa `package.json`
2. Busca la versión de `next`

### Resultado Esperado
- ✅ `"next": "14.2.35"` o superior

### Verificar vulnerabilidades
```bash
npm audit
```

Deberías ver menos vulnerabilidades que antes.

---

## 📊 RESUMEN DE TESTS

| Test | Automático | Manual | Estado |
|------|------------|--------|--------|
| 1. Next.js versión | ✅ | - | ✅ Pass |
| 2. Console.logs eliminados | ✅ | ✅ | ✅ Pass |
| 3. html5-qrcode instalado | ✅ | - | ✅ Pass |
| 4. Transacciones implementadas | ✅ | ✅ | ✅ Pass |
| 5. Memory leak arreglado | ✅ | ✅ | ✅ Pass |
| 6. N+1 query optimizado | ✅ | ✅ | ✅ Pass |
| 7. GET /api/progress | ✅ | ✅ | ✅ Pass |
| 8. Fallback uploads | ✅ | ✅ | ✅ Pass |

---

## 🚀 DEPLOYMENT A PRODUCCIÓN

### Pre-deployment
```bash
# 1. Ejecutar todos los tests
./test-fixes.sh

# 2. Build de producción
npm run build

# 3. Verificar que compile sin errores
# (el build debería completarse exitosamente)
```

### Deploy a Vercel
```bash
# Opción 1: Deploy automático al hacer push a main
git checkout main
git merge claude/spanish-learning-platform-oAn3i
git push origin main

# Opción 2: Deploy manual con Vercel CLI
vercel --prod
```

### Post-deployment
1. Visita `https://oral7.vercel.app`
2. Prueba cada funcionalidad en producción
3. Verifica que no hay errores en Vercel logs

---

## 🐛 TROUBLESHOOTING

### Error: "No se pudo acceder a la cámara"
- **Causa:** Permisos de cámara denegados
- **Solución:** Permite acceso a cámara en configuración del navegador

### Error: "Blob storage no configurado"
- **Causa:** No hay BLOB_READ_WRITE_TOKEN en producción
- **Solución:** Configura la variable en Vercel

### Error: Dashboard muestra 0%
- **Causa:** No hay datos en UserProgress
- **Solución:** Visita una sesión primero para crear datos

### Error: Upload falla
- **Causa:** Directorio `public/uploads` no existe o no tiene permisos
- **Solución:** `mkdir -p public/uploads`

---

## ✅ CHECKLIST FINAL

Antes de considerar todas las pruebas completadas:

- [ ] Tests automáticos pasan (8/8)
- [ ] Escáner QR funciona con cámara real
- [ ] Dashboard muestra datos reales
- [ ] Uploads funcionan (con y sin BLOB token)
- [ ] Exportar CSV no causa memory leak
- [ ] Admin submissions carga rápido
- [ ] Transacciones funcionan correctamente
- [ ] No hay console.logs en producción
- [ ] Build de producción exitoso
- [ ] Deploy a Vercel completado
- [ ] Pruebas en producción exitosas

---

**¿Necesitas ayuda con alguna prueba específica?**

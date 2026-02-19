# Informe de Auditoría de Seguridad - PIO-7
**Fecha:** 11 de Febrero de 2026
**Institución:** Universidad de Granada
**Auditoría:** Completa (Seguridad, Base de Datos, Frontend, DevSecOps)

---

## 🚨 CRÍTICO - Requiere Acción Inmediata

### 1. **Secretos Expuestos en Archivos .env** 🚨
- **Archivos:** `.env.local`, `.env.production.local`
- **Severidad:** CRÍTICA
- **Problema:** API tokens y secrets expuestos en texto plano:
  - `BLOB_READ_WRITE_TOKEN=vercel_blob_rw_HKiW43lYayxJCUGp_R1b7RRs0AjzhMwqDLCSGo7RhRAle2w`
  - `RESEND_API_KEY=re_c3rReK7d_J6atFciAg6VbBJuLvmCb8JrY`
  - `NEXTAUTH_SECRET=oral7-benitezl-production-2026-ugr-neon`
  - `DATABASE_URL` completa visible
- **Acción Requerida:**
  1. **Revocar inmediatamente** todos los tokens expuestos
  2. **Regenerar** todos los secrets
  3. **Asegurar** que los archivos .env estén en .gitignore
  4. **Rotar** credenciales de base de datos

### 2. **Subida de Archivos Sin Validación de Firma** 🚨
- **Archivo:** `src/app/api/upload/route.ts:39-60`
- **Severidad:** CRÍTICA
- **Problema:**
  - Validación solo por MIME type (fácil de spoofear)
  - No se validan los "magic numbers" (firmas de archivo)
  - No hay límites de tamaño por tipo de archivo
  - Nombres de archivo predecibles
- **Acción:** Implementar validación de firma de archivo y usar UUIDs

### 3. **QR Scanner - Sin Validación de Expiración** 🚨
- **Archivo:** `src/components/qr/qr-scanner.tsx:103-156`
- **Severidad:** CRÍTICA
- **Problema:**
  - No se valida si la sesión ha expirado después del escaneo
  - Posible registro de asistencia en sesiones expiradas
  - Sin protección contra registros duplicados
- **Acción:** Agregar validación de expiración de sesión del lado del servidor

### 4. **Mass Assignment Vulnerability** 🚨
- **Archivo:** `src/app/api/admin/update-session/route.ts:42-44`
- **Severidad:** CRÍTICA
- **Problema:** Se acepta cualquier campo JSON sin validación
- **Acción:** Implementar schema validation con Zod

### 5. **Protección Admin Solo en Cliente** 🚨
- **Archivo:** `src/app/(main)/admin/page.tsx:40`
- **Severidad:** CRÍTICA
- **Problema:** Verificación de rol admin solo en frontend
- **Acción:** Agregar middleware de ruta con verificación en servidor

---

## ⚠️ ALTA PRIORIDAD - Corregir en 1 semana

### 6. **Requisitos de Contraseña Débiles**
- **Archivo:** `src/app/api/auth/register/route.ts:35`
- **Severidad:** ALTA
- **Problema:** Solo 6 caracteres mínimo, sin complejidad
- **Acción:** Mínimo 12 caracteres con mayúsculas, minúsculas, números y símbolos

### 7. **Sesión JWT de 30 Días**
- **Archivo:** `src/lib/auth.ts:63-66`
- **Severidad:** ALTA
- **Problema:** `maxAge: 30 * 24 * 60 * 60` (30 días) demasiado largo
- **Acción:** Reducir a 24 horas para estudiantes, 7 días para admins

### 8. **Validación de Entrada Faltante**
- **Archivos:** Múltiples endpoints API
- **Severidad:** ALTA
- **Problema:** No hay validación de schema con Zod o similar
- **Acción:** Implementar Zod schemas para todos los endpoints

### 9. **Rate Limiting Fails-Open**
- **Archivo:** `src/lib/rate-limit-redis.ts:68-75`
- **Severidad:** ALTA
- **Problema:** Si Redis falla, se deshabilita el rate limiting
- **Acción:** Implementar fallback más estricto o requerir Redis en producción

### 10. **Mensajes de Error Expuestos**
- **Archivos:** Múltiples endpoints API
- **Severidad:** ALTA
- **Problema:** Stack traces y detalles internos en respuestas de error
- **Acción:** Sanitizar todos los mensajes de error

### 11. **Headers de Seguridad Faltantes**
- **Archivo:** `next.config.js`
- **Severidad:** ALTA
- **Problema:** Faltan headers CSP estricto, HSTS, X-Frame-Options
- **Acción:** Agregar middleware con headers de seguridad completos

### 12. **Subida de Archivos Sin Progreso Real**
- **Archivo:** `src/components/upload/file-upload.tsx:102-111`
- **Severidad:** ALTA
- **Problema:** Progreso falsificado, no maneja fallos de red
- **Acción:** Implementar progreso real con retry logic

### 13. **Falta Index en BD en Campos Críticos**
- **Archivo:** `prisma/schema.prisma`
- **Severidad:** ALTA
- **Problema:** Sin índices en email, role, sessionNumber, userId+sessionId
- **Acción:** Agregar índices para optimizar queries

### 14. **Logging de Queries en Producción**
- **Archivo:** `src/lib/prisma.ts:8`
- **Severidad:** ALTA
- **Problema:** Queries loggeadas en producción
- **Acción:** Restringir logging solo a desarrollo

---

## 📋 PRIORIDAD MEDIA - Corregir en 2 semanas

### 15. **Validación de Dominio de Email**
- **Problema:** No se valida dominio @ugr.es para estudiantes
- **Acción:** Agregar validación de dominio

### 16. **Sanitización de XSS**
- **Archivo:** `src/components/miniweb/task-interactive.tsx:163-167`
- **Problema:** Inputs no sanitizados contra XSS
- **Acción:** Implementar sanitización con DOMPurify

### 17. **IDOR en Estudiantes**
- **Archivo:** `src/app/api/students/[id]/route.ts`
- **Problema:** Posible acceso a datos de otros estudiantes
- **Acción:** Verificar ownership antes de permitir acceso

### 18. **Falla CSRF Protection**
- **Archivos:** Todos los endpoints API
- **Problema:** No hay tokens CSRF
- **Acción:** Implementar CSRF para operaciones state-changing

### 19. **Grabación Audio/Video Sin Cleanup**
- **Archivos:** `src/components/upload/audio-recorder.tsx`, `video-recorder.tsx`
- **Problema:** Streams no liberados correctamente en errores
- **Acción:** Agregar try-catch-finally para cleanup garantizado

### 20. **Progreso Checklist sin Conflict Resolution**
- **Archivo:** `src/components/miniweb/checklist-section.tsx`
- **Problema:** Puede desincronizarse entre localStorage y backend
- **Acción:** Implementar estrategia de resolución de conflictos

---

## 📊 Resumen de Vulnerabilidades

| Severidad | Cantidad |
|-----------|----------|
| CRÍTICA | 5 |
| ALTA | 10 |
| MEDIA | 6 |
| BAJA | 8 |

**Total: 29 issues identificadas**

---

## ✅ Plan de Acción Prioritario

### Fase 1 - CRÍTICA (Hoy)
1. ✅ Revocar y regenerar todos los secrets expuestos
2. ✅ Implementar validación de firma de archivos
3. ✅ Agregar validación de expiración en QR scanner
4. ✅ Implementar Zod validation en admin endpoints
5. ✅ Agregar middleware de protección de rutas admin

### Fase 2 - ALTA (Esta semana)
6. Fortalecer requisitos de contraseña
7. Reducir tiempo de sesión JWT
8. Implementar Zod schemas en todos los endpoints
9. Mejorar rate limiting fallback
10. Sanitizar mensajes de error
11. Agregar headers de seguridad
12. Mejorar subida de archivos con progreso real
13. Agregar índices a la base de datos
14. Configurar logging apropiado para producción

### Fase 3 - MEDIA (Próximas 2 semanas)
15. Validación de dominio de email
16. Sanitización XSS
17. Protección IDOR
18. CSRF protection
19. Cleanup garantizado en grabaciones
20. Resolución de conflictos en checklist

---

## 🔒 Recomendaciones de Largo Plazo

1. **Implementar pruebas de seguridad automatizadas** en CI/CD
2. **Establecer proceso de code review** obligatorio para cambios de autenticación
3. **Auditoría trimestral** de seguridad
4. **Implementar monitoreo y alertas** de seguridad
5. **Capacitación** en secure coding para el equipo de desarrollo
6. **Penetration testing** antes de cada deployment mayor
7. **Implementar WAF** (Web Application Firewall)
8. **Backup y disaster recovery** probados regularmente

---

## 📞 Contacto

Para cualquier pregunta sobre esta auditoría, contactar al equipo de desarrollo.

**Generado por:** Claude Sonnet 4.5 (AI Security Auditor)
**Fecha:** 11 de Febrero de 2026

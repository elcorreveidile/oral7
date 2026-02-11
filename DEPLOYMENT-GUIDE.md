# Guía de Deployment a Producción - PIO-7

Esta guía detalla el proceso completo para desplegar las mejoras de seguridad a producción en Vercel.

## 📋 Pre-requisitos

### Servicios Necesarios

1. **Base de datos PostgreSQL** (Neon, Railway, o similar)
   - Ya configurada en producción
   - URL disponible en `DATABASE_URL`

2. **Redis** (Obligatorio para rate limiting)
   - Opción recomendada: Railway, Upstash, o Redis Cloud
   - Crear instancia y obtener URL de conexión

3. **Vercel Blob Storage** (Ya configurado)
   - Token en `BLOB_READ_WRITE_TOKEN`

4. **Resend** (Para emails)
   - API key en `RESEND_API_KEY`

---

## 🚀 PASO 1: Configurar Variables de Entorno en Vercel

Accede a tu proyecto en Vercel → Settings → Environment Variables

### Variables Obligatorias

```bash
# Base de datos
DATABASE_URL="postgresql://..."

# Autenticación
NEXTAUTH_SECRET="<generar-con-openssl-rand-base64-32>"
NEXTAUTH_URL="https://pio8.cognoscencia.com"
TWO_FACTOR_ISSUER="PIO-7"

# Redis para Rate Limiting (NUEVO)
REDIS_URL="redis://default:password@host:port"

# Email
RESEND_API_KEY="re_..."

# Blob Storage
BLOB_READ_WRITE_TOKEN="vercel_blob_..."
```

### Variables Opcionales

```bash
# Escaneo de malware (recomendado)
CLAMAV_HOST="clamav.example.com"
CLAMAV_PORT="3310"

# Entorno
NODE_ENV="production"
```

---

## 🗄️ PASO 2: Aplicar Migración de Base de Datos

### Opción A: Desde Local (Recomendado)

```bash
# 1. Asegúrate de tener las variables de producción en .env
export DATABASE_URL="postgresql://..." # URL de producción

# 2. Aplica los cambios al schema
npx prisma db push --skip-generate

# 3. Verifica que las tablas se crearon
npx prisma studio
```

### Opción B: Usando Prisma Migrate

```bash
# Crear migración (si no existe)
npx prisma migrate dev --name add_2fa_and_audit_log --create-only

# Aplicar a producción
npx prisma migrate deploy
```

### Verificar Tablas Creadas

Ejecuta en tu base de datos de producción:

```sql
-- Verificar campos 2FA en users
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'users'
AND column_name IN ('two_factor_enabled', 'two_factor_secret');

-- Verificar tabla audit_logs
SELECT EXISTS (
  SELECT FROM information_schema.tables
  WHERE table_name = 'audit_logs'
);

-- Verificar índices de audit_logs
SELECT indexname FROM pg_indexes WHERE tablename = 'audit_logs';
```

**Esperado:**
- `two_factor_enabled` (boolean)
- `two_factor_secret` (text)
- Tabla `audit_logs` con índices en: `adminId`, `action`, `createdAt`

---

## 📦 PASO 3: Deploy a Vercel

### Desde CLI

```bash
# Instalar Vercel CLI si no lo tienes
npm i -g vercel

# Deploy a producción
vercel --prod
```

### Desde GitHub (Automático)

1. Push a rama `main`:
   ```bash
   git push origin main
   ```

2. Vercel detectará el cambio automáticamente y desplegará

3. Verifica el deploy en:
   - https://vercel.com/dashboard
   - URL de producción: https://pio8.cognoscencia.com

---

## ✅ PASO 4: Verificación Post-Deploy

### 4.1 Verificar Conexión Redis

```bash
# Desde Vercel Functions logs, buscar:
# "[RateLimit] Redis connected successfully"
```

O ejecutar este test:

```bash
curl -X POST https://pio8.cognoscencia.com/api/auth/callback/credentials \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@test.com","password":"wrong"}' \
  -v
```

Verificar headers de respuesta:
- `X-RateLimit-Limit: 5`
- `X-RateLimit-Remaining: 4`

### 4.2 Verificar 2FA

1. **Login como admin:**
   ```
   https://pio8.cognoscencia.com/login
   ```

2. **Acceder a configuración 2FA:**
   ```
   https://pio8.cognoscencia.com/admin/configuracion/2fa
   ```

3. **Generar secreto:**
   - Click en "Activar 2FA"
   - Debe aparecer un código QR
   - Escanear con Google Authenticator / Authy

4. **Verificar código:**
   - Introducir código TOTP de 6 dígitos
   - Click en "Verificar y Activar"

5. **Verificar login con 2FA:**
   - Logout
   - Login de nuevo
   - Debe pedir código TOTP después de email/password

### 4.3 Verificar Auditoría

1. **Realizar acción administrativa:**
   - Crear/editar/eliminar sesión
   - Generar código QR
   - Editar estudiante

2. **Ver logs:**
   ```
   https://pio8.cognoscencia.com/admin/auditoria
   ```

3. **Verificar que aparecen:**
   - Acción realizada
   - Usuario admin
   - IP address
   - Timestamp

### 4.4 Verificar Rate Limiting

**Test de rate limiting en login:**

```bash
# Ejecutar múltiples requests rápidamente
for i in {1..10}; do
  curl -X POST https://pio8.cognoscencia.com/api/auth/callback/credentials \
    -H "Content-Type: application/json" \
    -d '{"email":"admin@test.com","password":"test"}' \
    -w "\nStatus: %{http_code}\n" \
    -s
done
```

**Esperado:**
- Primeras 5 requests: Status 200/401 (según credenciales)
- Requests 6+: Status 429 (Too Many Requests)

---

## 🔐 PASO 5: Activar 2FA en Cuenta Admin Principal

### Proceso Manual

1. **Login como admin principal:**
   ```
   Email: [tu-email-admin]
   Password: [tu-password]
   ```

2. **Ir a configuración 2FA:**
   ```
   /admin/configuracion/2fa
   ```

3. **Activar 2FA:**
   - Click "Activar 2FA"
   - Escanear QR con Google Authenticator
   - Verificar código
   - Confirmar activación

4. **Verificar que funciona:**
   - Logout
   - Login de nuevo
   - Debe pedir código TOTP

### Backup de Código de Recuperación

**IMPORTANTE:** Guardar el secreto TOTP en un lugar seguro:

```sql
-- Obtener secreto cifrado (solo para backup de emergencia)
SELECT email, two_factor_enabled
FROM users
WHERE role = 'ADMIN';
```

---

## 📊 PASO 6: Monitoreo Inicial

### Dashboard de Vercel

1. **Functions → Logs:**
   - Buscar errores de Redis connection
   - Verificar rate limiting logs
   - Confirmar audit logs

2. **Analytics:**
   - Monitorear tiempos de respuesta
   - Verificar no hay spikes de error

### Verificar Funcionalidades Diarias

**Checklist diario primera semana:**

- [ ] Login admin con 2FA funciona
- [ ] Logs de auditoría aparecen en `/admin/auditoria`
- [ ] Rate limiting no bloquea usuarios legítimos
- [ ] No hay errores en Vercel logs relacionados con Redis
- [ ] Los uploads funcionan (malware scanning)

---

## 🚨 Troubleshooting

### Error: "REDIS_URL no configurado"

**Síntomas:**
- Rate limiting deshabilitado
- Logs: "[RateLimit] REDIS_URL no configurado"

**Solución:**
1. Verificar variable en Vercel → Settings → Environment Variables
2. Asegurar que REDIS_URL esté en Production environment
3. Redeploy: `vercel --prod`

### Error: "two_factor_enabled column does not exist"

**Síntomas:**
- Error 500 en /admin/configuracion/2fa
- Login no funciona

**Solución:**
```bash
# Verificar migración aplicada
npx prisma db push

# O manualmente en SQL:
ALTER TABLE users ADD COLUMN two_factor_enabled BOOLEAN DEFAULT false;
ALTER TABLE users ADD COLUMN two_factor_secret TEXT;
```

### Error: "AuditLog table doesn't exist"

**Síntomas:**
- Error al crear/editar sesiones
- Error al generar QR codes

**Solución:**
```sql
-- Crear tabla manualmente
CREATE TABLE audit_logs (
  id TEXT PRIMARY KEY,
  adminId TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  action TEXT NOT NULL,
  entityType TEXT NOT NULL,
  entityId TEXT,
  metadata JSONB,
  ipAddress TEXT,
  userAgent TEXT,
  createdAt TIMESTAMP DEFAULT NOW()
);

-- Crear índices
CREATE INDEX audit_logs_adminId_idx ON audit_logs(adminId);
CREATE INDEX audit_logs_action_idx ON audit_logs(action);
CREATE INDEX audit_logs_createdAt_idx ON audit_logs(createdAt);
```

### Rate Limiting Muy Agresivo

**Síntomas:**
- Usuarios legítimos bloqueados

**Solución:**
Ajustar límites en `src/lib/rate-limit-redis.ts`:

```typescript
export const RateLimitConfig = {
  auth: {
    limit: 10,  // Aumentar de 5 a 10
    window: 60,
  },
  // ...
}
```

---

## ✅ Checklist Final

Antes de considerar el deploy completo:

- [ ] Variables de entorno configuradas en Vercel
- [ ] Redis conectado y funcionando
- [ ] Migración de base de datos aplicada
- [ ] Deploy exitoso en Vercel
- [ ] 2FA activado en cuenta admin principal
- [ ] Logs de auditoría funcionando
- [ ] Rate limiting operativo (verificar con tests)
- [ ] No hay errores críticos en logs
- [ ] Login/registro funcionando normalmente
- [ ] Uploads funcionando con malware scanning

---

## 📞 Soporte

Si encuentras problemas durante el deploy:

1. Revisar Vercel Functions logs
2. Verificar variables de entorno
3. Ejecutar script de testing: `npx tsx scripts/test-security-features.ts`
4. Consultar esta guía de troubleshooting

**Logs útiles:**
- `[RateLimit]` - Rate limiting
- `[AuditLog]` - Auditoría
- `[2FA]` - Autenticación 2FA
- `[ClamAV]` - Escaneo de malware

---

**Fecha de última actualización:** Febrero 2026
**Versión:** 1.0
**Autor:** Equipo de Desarrollo PIO-7

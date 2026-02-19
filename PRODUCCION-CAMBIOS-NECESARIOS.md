# CAMBIOS NECESARIOS PARA PRODUCCIÓN

## 🚨 CRÍTICO - Problemas de Seguridad

### 1. RATE LIMITING EN VERCEL NO FUNCIONARÁ

**Problema:** El rate limiting actual usa memoria local del servidor. En Vercel (serverless), cada request puede ir a una instancia diferente, por lo que el rate limiting NO funcionará correctamente.

**Solución:** Necesitas usar un servicio externo. Te recomiendo **Upstash Redis** (tiene tier gratuito).

---

## 📋 PASOS A SEGUIR

### PASO 1: Configurar Upstash Redis para Rate Limiting

1. **Crear cuenta en Upstash:**
   - Ve a https://upstash.com/
   - Regístrate (es gratis)
   - Crea una base de datos Redis

2. **Obtener credenciales:**
   - Copia la `UPSTASH_REDIS_REST_URL`
   - Copia el `UPSTASH_REDIS_REST_TOKEN`

3. **Instalar SDK de Upstash:**
```bash
npm install @upstash/redis
```

4. **Agregar variables de entorno en Vercel:**
   - Ve a: https://vercel.com/javierbenitezs-projects/oral7/settings/environment-variables
   - Agrega:
     - `UPSTASH_REDIS_REST_URL` = (la URL que copiaste)
     - `UPSTASH_REDIS_REST_TOKEN` = (el token que copiaste)

**NOTA:** Avísame cuando hayas creado la cuenta de Upstash y yo actualizaré el código para usar Redis en lugar de memoria.

---

### PASO 2: Variables de Entorno en Vercel

Ve a: https://vercel.com/javierbenitezs-projects/oral7/settings/environment-variables

Verifica que tienes estas variables configuradas:

| Variable | Valor | ¿Necesaria? |
|----------|-------|-------------|
| `DATABASE_URL` | Tu URL de PostgreSQL Neon | ✅ Sí |
| `NEXTAUTH_SECRET` | Un secreto aleatorio único | ✅ Sí |
| `NEXTAUTH_URL` | `https://oral7.vercel.app` | ✅ Sí |
| `BLOB_READ_WRITE_TOKEN` | Token de Vercel Blob Storage | ✅ Sí |
| `RESEND_API_KEY` | `re_c3rReK7d_J6atFciAg6VbBJuLvmCb8JrY` | ✅ Sí |
| `STUDENT_INVITE_CODE` | `PIO7-2026-CLM` | ✅ Sí |

**IMPORTANTE:** Si alguna de estas variables NO está en Vercel, agrégala manualmente.

---

### PASO 3: Remover archivos .env del repositorio (SEGURIDAD)

**Problema crítico:** Tienes credenciales en archivos `.env` que están en tu repositorio.

**Acciones necesarias:**

1. **Verificar .gitignore:**
```bash
# Asegúrate de que .gitignore incluya:
.env
.env.local
.env.production.local
.env.*.local
```

2. **Remover archivos .env del historial de Git:**
```bash
# Esto removerá los archivos .env del historial de git
# PERO los mantendrá en tu disco local
git rm --cached .env
git rm --cached .env.local
git rm --cached .env.production.local

# Si existen otros archivos .env con credenciales
git rm --cached .env.production

# Hacer commit
git commit -m "chore: Remove sensitive .env files from git tracking"

# Push
git push
```

3. **Verificar que NO se hayan subido credenciales:**
   - Ve a: https://github.com/elcorreveidile/oral7
   - Busca si algún commit tiene archivos `.env` con credenciales reales
   - Si hay credenciales expuestas en el historial, necesitas:
     - Rotar todas las contraseñas/API keys
     - Considerar hacer el repositorio privado temporalmente

---

### PASO 4: Verificar configuración de Vercel

1. **Ve a tu dashboard de Vercel:**
   - https://vercel.com/javierbenitezs-projects/oral7

2. **Configuración del proyecto:**
   - Framework Preset: Next.js
   - Root Directory: `./`
   - Build Command: `npm run build`
   - Output Directory: `.next`

3. **Environment Variables:**
   - Todas las variables del PASO 2 deben estar configuradas
   - Selecciona "Production", "Preview", y "Development" según corresponda

---

### PASO 5: Deploy en producción

1. **Hacer merge a main (si estás en otra rama):**
```bash
git checkout main
git merge claude/spanish-learning-platform-oAn3i
git push origin main
```

2. **Vercel automáticamente detectará el cambio y hará deploy**

3. **Verificar el deployment:**
   - https://oral7.vercel.app
   - Prueba login, registro, uploads, etc.

---

## 🔧 CONFIGURACIONES ADICIONALES RECOMENDADAS

### 1. Dominio personalizado (Opcional)

Si quieres usar un dominio personalizado en lugar de `oral7.vercel.app`:

1. Compra un dominio (o usa uno existente)
2. En Vercel: Settings > Domains > Add Domain
3. Configura los DNS según las instrucciones de Vercel

### 2. Analytics

Vercel incluye analytics gratis. Actívalo en:
- Settings > Analytics > Vercel Analytics

### 3. Logs y monitoreo

Revisa los logs de producción en:
- Vercel Dashboard >oral7 > Logs > Deployment Logs
- Vercel Dashboard >oral7 > Logs > Runtime Logs

---

## ⚠️ AVISOS IMPORTANTES

1. **Rate Limiting:** Hasta que configures Upstash, el rate limiting NO funcionará correctamente en producción. Esto podría dejar tu app vulnerable a abusos.

2. **Credenciales expuestas:** Si tus archivos `.env` con credenciales reales están en el historial de Git, ROTARLAS INMEDIATAMENTE:
   - Cambiar `DATABASE_URL` (crear nueva base de datos o usuario)
   - Cambiar `NEXTAUTH_SECRET`
   - Cambiar `STUDENT_INVITE_CODE` (si se expuso)
   - Regenerar `RESEND_API_KEY`
   - Regenerar `BLOB_READ_WRITE_TOKEN`

3. **Backups:** Asegúrate de que Neon tiene backups automáticos configurados.

---

## ✅ CHECKLIST ANTES DE DECIR "PRODUCCIÓN LISTA"

- [ ] Upstash Redis configurado y rate limiting actualizado
- [ ] Variables de entorno en Vercel configuradas
- [ ] Archivos .env removidos de Git
- [ ] Credenciales rotadas si se expusieron
- [ ] Deploy probado en producción
- [ ] Login/Registro funcionando
- [ ] Uploads de archivos funcionando
- [ ] QR scanner funcionando
- [ ] Checklist sincronizando con backend
- [ ] Rate limiting funcionando (con Upstash)

---

## 📞 NECESITAS AYUDA

Cuando termines de configurar Upstash Redis, avísame y yo actualizaré el código del rate limiting para usar Redis.

Si tienes algún problema durante estos pasos, avísame inmediatamente.

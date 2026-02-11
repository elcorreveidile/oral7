# Configurar Redis en Railway para PIO-7

Guía paso a paso para configurar Redis en Railway y conectarlo con Vercel.

## 🚀 PASO 1: Crear Redis en Railway

### 1.1 Acceder a Railway

1. Ve a [railway.app](https://railway.app)
2. Login con tu cuenta existente
3. Ve al Dashboard

### 1.2 Crear Proyecto Redis

1. Click en **"New Project"**
2. Selecciona **"Provision Redis"**
3. Railway creará automáticamente una instancia de Redis

**El nombre por defecto será algo como:** `redis-12345`

---

## 🔗 PASO 2: Obtener URL de Conexión

### 2.1 Abrir Redis Instance

1. Click en el proyecto Redis que acabas de crear
2. Ve a la pestaña **"Variables"** o **"Connect"**

### 2.2 Copiar URL de Conexión

Railway te mostrará algo como:

```
REDIS_URL=redis://default:PASSWORD@HOST.railway.app:PORT
```

**Opción A: Variables tab (Recomendado)**
- Busca la variable `REDIS_URL`
- Click en "Copy" para copiar el valor completo

**Opción B: Connect tab**
- Busca "Connection URL"
- Debe empezar con `redis://`
- Copia la URL completa

**Ejemplo de cómo se ve:**
```
redis://default:AbCdEfGhIjKlMnOp@containers-us-west-123.railway.app:6379
```

---

## ⚙️ PASO 3: Configurar en Vercel

### 3.1 Ir a Vercel

1. Ve a [vercel.com](https://vercel.com)
2. Abre tu proyecto **oral7** (o el nombre que tenga)
3. Click en **Settings** → **Environment Variables**

### 3.2 Añadir Variable REDIS_URL

1. Click en **"Add"**
2. Llena los campos:
   - **Key:** `REDIS_URL`
   - **Value:** `redis://default:PASSWORD@HOST.railway.app:PORT`
   - **Environment:** Selecciona **Production** (y Preview si quieres)

3. Click **"Save"**

### 3.3 Importante: Redeploy

**Después de añadir la variable, DEBES hacer redeploy:**

**Opción A: Desde CLI**
```bash
vercel --prod
```

**Opción B: Desde Dashboard**
1. Ve a **Deployments**
2. Click en los **"..."** (tres puntos) del último deploy
3. Selecciona **"Redeploy"**

---

## ✅ PASO 4: Verificar Conexión

### 4.1 Verificar desde Logs de Vercel

1. Ve a tu proyecto en Vercel
2. Click en **Deployments**
3. Abre el último deploy
4. Click en **Functions** → **Logs**
5. Busca el mensaje:
   ```
   [RateLimit] Redis connected successfully
   ```

### 4.2 Test con curl

```bash
# Hacer múltiples requests para probar rate limiting
for i in {1..10}; do
  curl -X POST https://pio8.cognoscencia.com/api/auth/callback/credentials \
    -H "Content-Type: application/json" \
    -d '{"email":"admin@test.com","password":"test"}' \
    -w "\nRequest $i - Status: %{http_code}\n" \
    -s
done
```

**Resultado esperado:**
- Requests 1-5: Status 401 o 200 (depende de credenciales)
- Requests 6+: Status 429 (Too Many Requests)
- Ver headers: `X-RateLimit-Limit` y `X-RateLimit-Remaining`

---

## 🔧 Troubleshooting

### Error: "Redis connection failed"

**Verificar:**
1. Redis está corriendo en Railway:
   - Ve a Railway → Tu proyecto Redis → Metrics
   - Debe mostrar actividad

2. URL de conexión correcta:
   - Debe empezar con `redis://`
   - Debe incluir puerto (generalmente `:6379`)
   - No debe tener espacios

3. Variable en Vercel:
   - Verifica que `REDIS_URL` esté en **Production** environment
   - Verifica que el valor sea exactamente igual al de Railway

### Error: "Connection refused"

**Solución:**
1. Verifica que Railway no esté en "Sleep mode"
2. Railway free tier tiene límites, asegúrate de tener minutos disponibles
3. Considera upgrade si es necesario ($5/mes para always-on)

### Rate Limiting no funciona

**Verificar en logs:**
```
[RateLimit] REDIS_URL no configurado
```

Si ves este mensaje:
1. Variable no está configurada en Vercel
2. O no hiciste redeploy después de añadirla

---

## 💡 Tips de Railway

### Monitorear Redis

1. Ve a tu proyecto Redis en Railway
2. Click en **"Metrics"** tab
3. Verás:
   - Memoria usada
   - Conexiones activas
   - Commands ejecutados
   - Network I/O

### Ver Logs de Redis

1. Click en **"Deployments"** tab
2. Click en el deployment activo
3. Ve a **"Logs"**
4. Verás comandos ejecutados y errores

### Configurar Variables Adicionales

Si quieres personalizar Redis, añade estas variables en Railway:

```
REDIS_MAXMEMORY=256mb
REDIS_MAXMEMORY_POLICY=allkeys-lru
```

---

## 📊 Límites del Free Tier

**Railway Free Tier incluye:**
- $5 de crédito gratuito mensual
- Redis: ~500MB memoria
- Suficiente para proyectos pequeños/medianos

**Si necesitas más:**
- Pro Plan: $20/mes
- Incluye $20 de uso
- Always-on containers

---

## 🎯 Siguientes Pasos

Después de configurar Redis:

1. ✅ **Aplicar migración DB** (ver TESTING-COMPLETE-REPORT.md)
2. ✅ **Verificar deploy automático** en Vercel
3. ✅ **Activar 2FA** en cuenta admin
4. ✅ **Verificar funcionalidades** (auditoría, rate limiting)

---

## 🔐 Seguridad

**Importante:**
- ✅ La URL de Redis incluye credenciales
- ✅ NO la compartas ni la commitees en el código
- ✅ Solo debe estar en variables de entorno de Vercel
- ✅ Railway usa conexiones encriptadas (TLS)

---

**¿Necesitas ayuda con algún paso específico?**

# CONFIGURAR RAILWAY REDIS PARA RATE LIMITING

## 🚀 PASOS EN RAILWAY

### 1. Crear proyecto en Railway
1. Ve a: https://railway.app/
2. Login con tu cuenta
3. Crea un nuevo proyecto (o usa uno existente)

### 2. Agregar Redis al proyecto
1. En tu proyecto de Railway, haz clic en **"New Service"**
2. Selecciona **"Database"**
3. Selecciona **"Add Redis"**
4. Railway creará una instancia de Redis automáticamente

### 3. Obtener las credenciales de Redis
1. En tu servicio de Redis en Railway
2. Haz clic en la pestaña **"Variables"** o **"Connect"**
3. Copia la variable `REDIS_URL` o los datos de conexión

**La URL tendrá un formato como:**
```
redis://default:<password>@host:port
```

---

## 🔧 CONFIGURACIÓN EN VERCEL

### Agregar variables de entorno en Vercel

1. Ve a: https://vercel.com/javierbenitezs-projects/oral7/settings/environment-variables

2. Agrega estas variables:

| Variable | Valor |
|----------|-------|
| `REDIS_URL` | (La URL que copiaste de Railway) |
| `REDIS_PASSWORD` | (El password de Railway si está separado) |

**IMPORTANTE:** Selecciona los entornos:
- ✅ Production
- ✅ Preview
- ✅ Development

---

## 📝 AVISARME CUANDO TERMINES

Cuando hayas creado el Redis en Railway y agregado la variable `REDIS_URL` en Vercel, avísame y yo actualizaré el código del rate limiting para usar Redis.

---

## 🎯 OPCIÓN ALTERNATIVA: Rate Limiting con IP (sin Redis)

Si prefieres NO usar Redis por ahora, puedo implementar una versión simplificada del rate limiting que:

- ✅ Funciona en Vercel sin servicios externos
- ✅ Protege contra ataques básicos
- ⚠️ No es tan robusto como Redis (puede ser evadido por atacantes persistentes)

**¿Qué prefieres?**
1. **Usar Railway Redis** (recomendado - más robusto)
2. **Rate limiting simplificado sin Redis** (más simple, menos seguro)

Avísame y preparo el código inmediatamente.

# 🚀 Instrucciones para Configurar Producción

## Problema actual
- El despliegue está funcionando pero no puedes hacer login
- La recuperación de contraseña no envía emails (no está configurado)

## Solución: Ejecutar script de inicialización

### Paso 1: Obtener DATABASE_URL de producción

1. Ve a [Vercel Dashboard](https://vercel.com/dashboard)
2. Entra al proyecto **oral7**
3. Ve a **Settings** → **Environment Variables**
4. Busca la variable `DATABASE_URL`
5. Haz clic en el icono de 👁️ para ver el valor
6. Copia la URL completa (algo como `postgresql://...)

### Paso 2: Ejecutar scripts de inicialización

**2.1 Crear usuario admin**

**Opción A: Con .env.production (más fácil)**

1. Edita el archivo `.env.production` en la raíz del proyecto
2. Sustituye `TU_DATABASE_URL_AQUI` con la URL que copiaste
3. Ejecuta:

```bash
npx ts-node -e 'require("dotenv").config({ path: ".env.production" }); require("./scripts/setup-production.ts")'
```

**Opción B: Directamente con DATABASE_URL**

```bash
DATABASE_URL="postgresql://..." npx ts-node scripts/setup-production.ts
```

Sustituye `postgresql://...` con tu URL completa.

**2.2 Crear temas de debates**

```bash
DATABASE_URL="postgresql://..." npx ts-node scripts/seed-debates-production.ts
```

O con .env.production:

```bash
npx ts-node -e 'require("dotenv").config({ path: ".env.production" }); require("./scripts/seed-debates-production.ts")'
```

### Paso 3: Hacer login

Una vez ejecutado el script:

1. Ve a https://oral7.vercel.app/login
2. Usa las credenciales:
   - **Email:** admin@pio7.ugr.es
   - **Contraseña:** Admin2025!

### Paso 4: (Opcional) Cambiar contraseña

Después de hacer login, puedes cambiar la contraseña desde el perfil.

### Paso 5: Limpiar

Borra el archivo `.env.production` después de usarlo:

```bash
rm .env.production
```

## 📝 ¿Qué hacen los scripts?

**setup-production.ts:**
1. Crea el usuario admin si no existe
2. Establece la contraseña a `Admin2025!`
3. Crea la configuración global si no existe

**seed-debates-production.ts:**
1. Crea los 12 temas de debate
2. Habilita el sistema de votación para estudiantes

## 🔧 Si algo falla

### Error: "Cannot connect to database"
- Verifica que la DATABASE_URL es correcta
- Verifica que la base de datos esté online
- Verifica que no haya restricciones IP en tu proveedor de BD

### Error: "Role does not exist" o tablas no existen

Ejecuta las migraciones de Prisma para crear las tablas:

```bash
DATABASE_URL="postgresql://..." npx prisma db push
```

### Error de permisos
- Asegúrate de que el usuario de la BD tiene permisos CREATE

### Verificar que las tablas se crearon

```bash
DATABASE_URL="postgresql://..." npx prisma studio
```

Se abrirá una interfaz web donde puedes verificar que se crearon las tablas.

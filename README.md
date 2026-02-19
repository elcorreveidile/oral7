🗣️ Oral-7

Plataforma web dinámica para la asignatura "Producción e interacción oral en español" (Nivel C1) del Centro de Lenguas Modernas (Universidad de Granada).

Este proyecto facilita la gestión docente y el aprendizaje autónomo de estudiantes internacionales, con un enfoque híbrido para grupos mixtos (Estadounidenses y Chinos).

---

## 📝 Descripción

Oral-7 es una aplicación web Full Stack diseñada para acompañar el curso semestral de Producción Oral C1. Ofrece una experiencia de aprendizaje inmersiva donde cada sesión de clase dispone de su propia "Miniweb" interactiva, integrando recursos multimedia, tareas interactivas y sistemas de autoevaluación.

### Modos Pedagógicos

- **Modo A (Integrador)**: Dinámicas colaborativas, interacción espontánea y conversaciones exploratorias
- **Modo B (Analítico/Visual)**: Soporte extra con estructuras gramaticales, desgloses visuales y ejercicios guiados

---

## ✨ Características Principales

| Característica | Descripción |
|----------------|-------------|
| 📅 **Calendario Académico** | Gestión automática de fechas 2026, días festivos y exámenes orales |
| 📷 **Asistencia QR** | Códigos dinámicos generados por el profesor, escaneados por alumnos |
| 📚 **Miniwebs por Sesión** | Timing, objetivos, tareas interactivas, checklists y recursos |
| 🌍 **Adaptación Cultural** | Enfoques comunicativos (Occidente) y analíticos (China) |
| 👨‍🏫 **Panel de Admin** | Gestión de contenidos, asistencia y progreso del grupo |
| 🎨 **Diseño Moderno** | Mobile-first, responsivo, con Shadcn UI |

---

## 🛠️ Stack Tecnológico

- **Frontend**: Next.js 14 (App Router), React, Tailwind CSS, Shadcn UI
- **Backend**: Next.js API Routes, Server Actions
- **Base de Datos**: PostgreSQL con Prisma ORM
- **Autenticación**: NextAuth.js con roles (ADMIN/STUDENT)
- **Lenguaje**: TypeScript

---

## 🚀 Instalación y Uso

### Prerrequisitos

- Node.js 18+ instalado
- PostgreSQL instalado o base de datos en la nube (Supabase/Neon/Vercel Postgres)

### Pasos de Instalación

1. **Clonar el repositorio**
   ```bash
   git clone https://github.com/tu-usuario/oral-7.git
   cd oral-7
   ```

2. **Instalar dependencias**
   ```bash
   npm install
   ```

3. **Configurar variables de entorno**

   Crea un archivo `.env` en la raíz:
   ```env
   DATABASE_URL="postgresql://usuario:password@localhost:5432/oral7"
   NEXTAUTH_SECRET="tu-secreto-super-seguro-generado-con-openssl"
   NEXTAUTH_URL="http://localhost:3000"
   ```

   Para generar `NEXTAUTH_SECRET`:
   ```bash
   openssl rand -base64 32
   ```

4. **Inicializar la Base de Datos**
   ```bash
   # Generar cliente Prisma
   npx prisma generate

   # Crear tablas (desarrollo)
   npx prisma db push

   # O crear migración (producción)
   npx prisma migrate dev --name init

   # Poblar con contenido didáctico (16 sesiones C1)
   npm run seed
   ```

5. **Ejecutar el servidor de desarrollo**
   ```bash
   npm run dev
   ```

6. **Abrir en el navegador**
   - Navega a `http://localhost:3000`
   - Landing page pública
   - Login: `http://localhost:3000/login`

---

## 🔐 Credenciales de Prueba (Después del Seed)

| Rol | Email | Password | Nota |
|-----|-------|----------|------|
| Admin (Profesor) | `benitezl@go.ugr.es` | `admin123` | Javier Benítez Láinez |
| Test Student 1 | `test.student1@ugr.es` | `estudiante123` | Solo para desarrollo |
| Test Student 2 | `test.student2@ugr.es` | `estudiante123` | Solo para desarrollo |
| Test Student 3 | `test.student3@ugr.es` | `estudiante123` | Solo para desarrollo |

**⚠️ Importante**: En producción, los estudiantes reales se registrarán por sí mismos en la plataforma. Los usuarios de prueba son solo para desarrollo local.

---

## 📦 Contenido del Seed

El archivo `prisma/seed.ts` incluye:

- **4 usuarios** (1 admin, 3 estudiantes de prueba)
  - Admin: Javier Benítez Láinez (benitezl@go.ugr.es)
  - 3 estudiantes de prueba para desarrollo local
  - **Nota**: En producción, los estudiantes reales se auto-registrarán
- **15 sesiones C1** con calendario real 2026:
  - Horario: Martes y Jueves
  - Febrero: 8 sesiones (3, 5, 10, 12, 17, 19, 24, 26)
  - Marzo: 7 sesiones (3, 5, 10, 12, 17, 19, 31) - 26/3 es examen parcial
  - Abril: 8 sesiones (7, 9, 14, 16, 21, 23, 28, 30) - excluye Semana Santa
  - Mayo: 4 sesiones (5, 7, 12, 14) - última clase el 14/5
- **Fiestas excluidas**: Semana Santa (30 mar-3 abr), 1 mayo
- **Exámenes**: 26 marzo (parcial), 21 mayo (final)
- **Tareas interactivas**, **checklists**, **recursos**
- **Configuración global** del curso (2 feb - 21 may 2026)

---

## 🌐 Despliegue en Vercel

### 1. Preparar Base de Datos

**Recomendación: Vercel Postgres** ✅

Tu proyecto ya está configurado para PostgreSQL + Prisma. Vercel Postgres es la mejor opción porque:

- ✅ Integración nativa con Vercel
- ✅ Compatible con Prisma (tu proyecto ya lo usa)
- ✅ PostgreSQL completo (relaciones, foreign keys, etc.)
- ✅ Gratis hasta 512MB (suficiente para el curso)
- ✅ Escalable automáticamente
- ✅ Backup automático

**Pasos para crear Vercel Postgres**:

1. En tu proyecto Vercel: **Storage** → **Create Database**
2. Selecciona **Vercel Postgres**
3. Copia la `DATABASE_URL` proporcionada

> **❌ No uses Firebase**: Tu proyecto usa Prisma + PostgreSQL, no es compatible con Firebase (NoSQL).

### 2. Variables de Entorno en Vercel

Ve a: Settings → Environment Variables

Añade estas variables:

```env
DATABASE_URL=tu_connection_string_de_vercel_postgres
NEXTAUTH_SECRET=tu_secreto_generado
NEXTAUTH_URL=https://tu-dominio.vercel.app
```

### 3. Ejecutar Migraciones y Seed

Opción A: Desde Vercel Dashboard
1. Deploy → Git → Deploy Now
2. Una vez desplegado, ve a tu proyecto en Vercel Postgres
3. Abre "Prisma Studio" o ejecuta comandos desde el terminal

Opción B: Desde local (recomendado)

```bash
# Instalar Vercel CLI
npm i -g vercel

# Login
vercel login

# Pull variables de entorno
vercel env pull .env

# Ejecutar migraciones en la BD de Vercel
DATABASE_URL=$(vercel env get DATABASE_URL) npx prisma db push

# Ejecutar seed en la BD de Vercel
DATABASE_URL=$(vercel env get DATABASE_URL) npm run seed
```

### 4. Deploy

```bash
vercel --prod
```

---

## 👨‍🏫 Gestión de Estudiantes

Como administrador, puedes **añadir estudiantes manualmente** desde el panel de admin:

### Opción 1: Registro manual por el profesor

1. Accede al panel de admin
2. Ve a **"Ver estudiantes"** → `/admin/estudiantes`
3. Click en **"Añadir Estudiante"**
4. Rellena:
   - Nombre completo
   - Email
   - Password temporal
5. El estudiante podrá cambiar su password después

### Opción 2: Auto-registro de estudiantes

Los estudiantes también pueden registrarse por sí mismos en:
- Landing page → Click en "Comenzar" → Registro como estudiante

### Gestión de estudiantes

Desde `/admin/estudiantes` puedes:
- ✅ Ver lista completa de estudiantes
- ✅ Ver asistencias de cada estudiante
- ✅ Ver progreso (sesiones completadas)
- ✅ Añadir nuevos estudiantes manualmente
- ✅ Fecha de registro de cada estudiante

---

## 📂 Estructura del Proyecto

```
oral-7/
├── prisma/
│   ├── schema.prisma      # Esquema de base de datos
│   └── seed.ts            # Datos iniciales (16 sesiones C1)
├── public/
│   └── resources/         # PDFs, imágenes, vídeos
├── src/
│   ├── app/
│   │   ├── page.tsx       # Landing page (nueva)
│   │   ├── (auth)/        # Rutas de autenticación
│   │   ├── (main)/        # Rutas principales
│   │   │   ├── dashboard/
│   │   │   ├── sesiones/
│   │   │   ├── asistencia/
│   │   │   └── admin/
│   │   └── layout.tsx
│   ├── components/
│   │   ├── miniweb/       # Componentes de sesión
│   │   ├── ui/            # Shadcn UI
│   │   └── providers.tsx
│   └── lib/
│       ├── prisma.ts
│       └── auth.ts
├── package.json
└── README.md
```

---

## 🎓 Temario del Curso

### Bloque 1: Fundamentos (Sesiones 1-4)
1. **3 Feb** - Bienvenida y Evaluación Diagnóstica
2. **5 Feb** - Estructuras de Argumentación
3. **10 Feb** - Narración Avanzada
4. **12 Feb** - La Exposición Oral Formal

### Bloque 2: Interacción Avanzada (Sesiones 5-8)
5. **17 Feb** - Negociación y Mediación
6. **19 Feb** - El Debate Académico
7. **24 Feb** - Entrevista Profesional
8. **26 Feb** - Comunicación Intercultural

### Bloque 3: Perfeccionamiento (Sesiones 9-15)
9. **3 Mar** - Precisión Léxica
10. **5 Mar** - Pronunciación y Entonación
11. **10 Mar** - Coherencia y Cohesión
12. **12 Mar** - Ironía y Humor
13. **17 Mar** - Presentaciones Académicas
14. **19 Mar** - Repaso y Consolidación
15. **31 Mar** - Proyecto Final

**Exámenes**: 26 Mar (Parcial) | 21 May (Final)
**Última clase**: 14 May 2026

---

## 📄 Licencia

Este proyecto es de uso educativo interno para el CLM-UGR.

---

**Desarrollado por**: Javier Benítez Láinez
**Año**: 2025
**Versión**: 1.0.0

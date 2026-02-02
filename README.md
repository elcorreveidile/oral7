🗣️ Oral-7

Plataforma web dinámica para la asignatura "Producción e interacción oral en español" (Nivel C1) del Centro de Lenguas Modernas (Universidad de Granada).

Este proyecto facilita la gestión docente y el aprendizaje autónomo de estudiantes internacionales, con un enfoque híbrido para grupos mixtos (Estadounidenses y Chinos).

VersionNext.jsTypeScriptLicense

📝 Descripción

Oral-7 es una aplicación web Full Stack diseñada para acompañar el curso semestral de Producción Oral. Ofrece una experiencia de aprendizaje inmersiva donde cada sesión de clase dispone de su propia "Miniweb" interactiva, integrando recursos multimedia, tareas interactivas y sistemas de autoevaluación.

La plataforma atiende a las diferencias culturales y de aprendizaje mediante un sistema de Modos Pedagógicos:

Modo A (Integrador): Dinámicas colaborativas mixtas.
Modo B (Analítico/Visual): Soporte extra enfocado en estructuras gramaticales y desgloses visuales para estudiantes sinohablantes o aquellos que prefieren un aprendizaje más detallado.
✨ Características Principales

📅 Calendario Académico Inteligente: Gestión automática de fechas (2026), días festivos y exámenes orales.
📷 Control de Asistencia QR: El profesor genera códigos dinámicos; los alumnos registran su asistencia escaneando.
📚 Miniwebs por Sesión:
Timing detallado y objetivos.
Tareas interactivas (drag & drop, rellenar huecos).
Botones de "Copiar" para gramática y vocabulario.
Checklists de autoevaluación persistentes.
🌍 Adaptación Cultural: Opción para cambiar entre enfoques comunicativos (Occidente) y analíticos (China).
👨‍🏫 Panel de Admin (Profesor): Gestión de contenidos, seguimiento de asistencia y visualización del progreso del grupo.
🎨 Diseño Moderno: Interfaz responsiva, "Mobile-first" y遵守 estrictas normas de capitalización del español.
🛠️ Stack Tecnológico

Frontend: Next.js 14 (App Router), React, Tailwind CSS, Shadcn UI.
Backend: Next.js API Routes (Server Actions).
Base de Datos: PostgreSQL con Prisma ORM.
Autenticación: NextAuth.js (Simulada para desarrollo local).
Lenguaje: TypeScript.
🚀 Instalación y Uso

Prerrequisitos

Node.js 18+ instalado.
PostgreSQL instalado o base de datos en la nube (Supabase/Neon).
Pasos

Clonar el repositorio:
git clone https://github.com/tu-usuario/oral-7.gitcd oral-7
 Instalar dependencias:
bash

npm install
 Configurar variables de entorno: Crea un archivo .env en la raíz:
env

DATABASE_URL="postgresql://usuario:password@localhost:5432/oral7"
NEXTAUTH_SECRET="tu-secreto-super-seguro"
NEXTAUTH_URL="http://localhost:3000"
 Inicializar la Base de Datos:
bash

npx prisma generate
npx prisma db push
npm run seed  # Para poblar la BD con el temario inicial
 Ejecutar el servidor de desarrollo:
bash

npm run dev
 Abrir en el navegador: Navega a http://localhost:3000.
📂 Estructura del Proyecto

plaintext

oral-7/
├── prisma/
│   └── schema.prisma      # Esquema de la base de datos
├── public/                # Recursos estáticos (PDFs, imágenes)
├── src/
│   ├── app/               # Rutas y páginas de Next.js
│   ├── components/        # Componentes UI reutilizables
│   ├── lib/               # Utilidades y configuración de BD
│   └── types/             # Definiciones de TypeScript
├── README.md
└── package.json
 👥 Contexto Pedagógico

Este curso está diseñado para estudiantes del Curso de Estudios Hispánicos (CEH) de la Universidad de Granada. El contenido se alinea con el currículum del CLM para el Nivel 7 (Usuario Competente - C1), cubriendo:

 Argumentación formal y registro académico.
 La conferencia, la entrevista y el estilo indirecto.
 Lengua coloquial vs. formal.
 📄 Licencia

Este proyecto es de uso educativo interno para el CLM-UGR.

Desarrollado por: [Javier Benítez Láinez/Javier.soy]
Año: 2026

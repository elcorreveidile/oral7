#!/usr/bin/env ts-node

/**
 * Script para configurar el sistema de votación de debates
 * Crea las tablas necesarias y los 12 temas iniciales
 * Uso: npx ts-node scripts/setup-debates.ts
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Función para ejecutar comandos SQL individuales
async function runSQL(sql: string) {
  try {
    await prisma.$executeRawUnsafe(sql);
  } catch (error: any) {
    // Ignorar errores de "ya existe"
    if (!error.message.includes('already exists')) {
      throw error;
    }
  }
}

const debateTopics = [
  {
    title: 'Lugares de la ciudad',
    description: '¿Qué espacios definen la identidad granadina?',
    category: 'Experiencia personal',
    order: 1
  },
  {
    title: 'El turismo',
    description: '¿Impacto positivo o negativo en Granada?',
    category: 'Impacto social',
    order: 2
  },
  {
    title: 'Conservación cultural',
    description: '¿Cómo preservar la autenticidad?',
    category: 'Cultura',
    order: 3
  },
  {
    title: 'Estereotipos con Study Abroad',
    description: '¿Qué rompemos, qué reforzamos?',
    category: 'Reflexión',
    order: 4
  },
  {
    title: 'Listos para volver',
    description: '¿Cómo ha cambiado nuestra perspectiva?',
    category: 'Reflexión',
    order: 5
  },
  {
    title: 'Experiencia en familia española',
    description: '¿Inmersión o choque cultural?',
    category: 'Experiencia personal',
    order: 6
  },
  {
    title: 'La era digital y la comunicación',
    description: '¿Las redes sociales nos acercan o nos alejan culturalmente?',
    category: 'Tecnología',
    order: 7
  },
  {
    title: 'Sostenibilidad y turismo',
    description: '¿Debe limitarse el turismo en Granada para proteger la ciudad?',
    category: 'Impacto social',
    order: 8
  },
  {
    title: 'Español de España vs. Latinoamérica',
    description: '¿Qué español deberíamos aprender: el peninsular o el latino?',
    category: 'Lengua',
    order: 9
  },
  {
    title: 'Inteligencia Artificial y el aprendizaje de idiomas',
    description: '¿Sirve de algo estudiar idiomas con la IA avanzada?',
    category: 'Tecnología',
    order: 10
  },
  {
    title: 'Integración vs. Asimilación',
    description: '¿Debemos integrarnos o mantener nuestra identidad estadounidense?',
    category: 'Identidad',
    order: 11
  },
  {
    title: 'La influencia estadounidense global',
    description: '¿Es inevitable la "americanización" de otras culturas?',
    category: 'Cultura',
    order: 12
  }
];

async function main() {
  console.log('🚀 Configurando sistema de votación de debates...\n');

  try {
    // Paso 1: Crear las tablas usando SQL raw
    console.log('📝 Creando tablas en la base de datos...');

    // Crear tabla debate_topics
    await runSQL(`
      CREATE TABLE IF NOT EXISTS "debate_topics" (
        "id" TEXT NOT NULL,
        "title" TEXT NOT NULL,
        "description" TEXT NOT NULL,
        "category" TEXT NOT NULL,
        "order" INTEGER NOT NULL,
        "isActive" BOOLEAN NOT NULL DEFAULT true,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP(3) NOT NULL,
        CONSTRAINT "debate_topics_pkey" PRIMARY KEY ("id")
      )
    `);

    // Crear tabla debate_votes
    await runSQL(`
      CREATE TABLE IF NOT EXISTS "debate_votes" (
        "id" TEXT NOT NULL,
        "userId" TEXT NOT NULL,
        "topicId" TEXT NOT NULL,
        "rank" INTEGER NOT NULL,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT "debate_votes_pkey" PRIMARY KEY ("id")
      )
    `);

    // Crear índices
    await runSQL(`CREATE INDEX IF NOT EXISTS "debate_votes_userId_idx" ON "debate_votes"("userId")`);
    await runSQL(`CREATE INDEX IF NOT EXISTS "debate_votes_topicId_idx" ON "debate_votes"("topicId")`);

    // Crear constraint único
    await runSQL(`
      DO $$ BEGIN
        IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'debate_votes_userId_topicId_key') THEN
          ALTER TABLE "debate_votes" ADD CONSTRAINT "debate_votes_userId_topicId_key" UNIQUE ("userId", "topicId");
        END IF;
      END $$
    `);

    // Crear foreign keys
    await runSQL(`
      DO $$ BEGIN
        IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'debate_votes_userId_fkey') THEN
          ALTER TABLE "debate_votes" ADD CONSTRAINT "debate_votes_userId_fkey"
          FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
        END IF;
      END $$
    `);

    await runSQL(`
      DO $$ BEGIN
        IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'debate_votes_topicId_fkey') THEN
          ALTER TABLE "debate_votes" ADD CONSTRAINT "debate_votes_topicId_fkey"
          FOREIGN KEY ("topicId") REFERENCES "debate_topics"("id") ON DELETE CASCADE ON UPDATE CASCADE;
        END IF;
      END $$
    `);

    console.log('✅ Tablas creadas correctamente\n');

    // Paso 2: Limpiar datos existentes (si los hay)
    console.log('🗑️  Limpiando datos anteriores...');
    await prisma.$executeRaw`DELETE FROM "debate_votes"`;
    await prisma.$executeRaw`DELETE FROM "debate_topics"`;
    console.log('✅ Limpieza completada\n');

    // Paso 3: Crear los 12 temas
    console.log('📚 Creando 12 temas de debate...');

    for (const topic of debateTopics) {
      await prisma.$executeRaw`
        INSERT INTO "debate_topics" (id, title, description, category, "order", "isActive", "createdAt", "updatedAt")
        VALUES (
          gen_random_uuid(),
          ${topic.title},
          ${topic.description},
          ${topic.category},
          ${topic.order},
          true,
          CURRENT_TIMESTAMP,
          CURRENT_TIMESTAMP
        )
      `;
    }

    console.log('✅ Temas creados correctamente\n');

    // Paso 4: Verificar los temas creados
    const topics = await prisma.$queryRaw`
      SELECT title, description, category, "order"
      FROM "debate_topics"
      ORDER BY "order" ASC
    ` as Array<{ title: string; description: string; category: string; order: number }>;

    console.log('📋 TEMAS CREADOS:\n');
    topics.forEach((topic, index) => {
      console.log(`${index + 1}. ${topic.title}`);
      console.log(`   ${topic.description}`);
      console.log(`   Categoría: ${topic.category}\n`);
    });

    console.log('🎯 ¡Sistema listo para usar!');
    console.log('📱 Los estudiantes pueden votar en: /votacion-debates');
    console.log('📊 Los admin pueden ver resultados en: /admin/debates/resultados\n');

  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();

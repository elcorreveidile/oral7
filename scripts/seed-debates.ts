#!/usr/bin/env ts-node

/**
 * Script para inicializar los 12 temas de debate
 * Uso: npx ts-node scripts/seed-debates.ts
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

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
  console.log('🌱 Inicializando temas de debate...\n');

  try {
    // Limpiar votos y temas existentes
    console.log('🗑️  Limpiando datos existentes...');
    await prisma.debateVote.deleteMany({});
    await prisma.debateTopic.deleteMany({});

    // Crear los 12 temas
    console.log('📝 Creando 12 temas de debate...');
    const result = await prisma.debateTopic.createMany({
      data: debateTopics
    });

    console.log(`\n✅ Éxito! ${result.count} temas creados:\n`);

    // Mostrar los temas creados
    const topics = await prisma.debateTopic.findMany({
      orderBy: { order: 'asc' }
    });

    topics.forEach((topic, index) => {
      console.log(`${index + 1}. ${topic.title}`);
      console.log(`   ${topic.description}`);
      console.log(`   Categoría: ${topic.category}\n`);
    });

    console.log('🎯 Los estudiantes pueden ahora votar en /votacion-debates');
    console.log('📊 Los admin pueden ver resultados en /admin/debates/resultados\n');

  } catch (error) {
    console.error('❌ Error al inicializar temas:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();

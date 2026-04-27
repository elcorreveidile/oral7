#!/usr/bin/env ts-node

/**
 * Script para verificar los votos en la base de datos
 * Uso: npx ts-node scripts/check-votes.ts
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🔍 Verificando votos en la base de datos...\n');

  // Obtener todos los temas con sus votos
  const topics = await prisma.debateTopic.findMany({
    where: { isActive: true },
    include: {
      votes: {
        include: {
          user: {
            select: {
              name: true,
              email: true
            }
          }
        },
        orderBy: { rank: 'asc' }
      }
    },
    orderBy: { order: 'asc' }
  });

  console.log('📊 RESULTADOS DE LA VOTACIÓN:\n');

  const results = topics.map(topic => {
    const totalVotes = topic.votes.length;
    const score = totalVotes; // Sistema por cantidad: simplemente contar votos

    return {
      title: topic.title,
      totalVotes,
      score,
      votes: topic.votes
    };
  });

  // Ordenar por puntuación
  results.sort((a, b) => b.score - a.score);

  results.forEach((result, index) => {
    console.log(`${index + 1}. ${result.title}`);
    console.log(`   Votos: ${result.totalVotes}`);
    console.log(`   Puntuación: ${result.score}`);

    if (result.votes.length > 0) {
      console.log('   Detalle de votos:');
      result.votes.forEach(vote => {
        console.log(`     - Rank #${vote.rank} por ${vote.user.name}`);
      });
    }
    console.log('');
  });

  console.log('\n📈 RESUMEN POR USUARIO:\n');

  // Agrupar votos por usuario
  const votesByUser = await prisma.debateVote.findMany({
    include: {
      user: {
        select: {
          name: true,
          email: true
        }
      },
      topic: {
        select: {
          title: true
        }
      }
    },
    orderBy: { rank: 'asc' }
  });

  // Agrupar por usuario
  const userVotes: { [key: string]: any } = {};
  votesByUser.forEach(vote => {
    const userEmail = vote.user.email;
    if (!userVotes[userEmail]) {
      userVotes[userEmail] = {
        name: vote.user.name,
        votes: []
      };
    }
    userVotes[userEmail].votes.push({
      topic: vote.topic.title,
      rank: vote.rank,
      points: 5 - vote.rank
    });
  });

  Object.entries(userVotes).forEach(([email, data]: [string, any]) => {
    console.log(`${data.name} (${email}):`);
    data.votes.forEach((vote: any) => {
      console.log(`  Rank #${vote.rank}: ${vote.topic}`);
    });
    console.log('');
  });

  console.log(`\n📊 Total de votantes: ${Object.keys(userVotes).length}\n`);
}

main()
  .catch((e) => {
    console.error('❌ Error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

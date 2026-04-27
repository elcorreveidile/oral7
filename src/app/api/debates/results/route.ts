import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';

// GET /api/debates/results - Obtener resultados de la votación
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(req.url);
    const detailed = searchParams.get('detailed') === 'true';

    // VALIDAR QUE SOLO ADMINS PUEDEN VER RESULTADOS DETALLADOS
    if (detailed && session.user.role !== 'ADMIN') {
      return NextResponse.json(
        {
          error: 'Unauthorized',
          message: 'Solo los administradores pueden ver los resultados detallados con información de votantes'
        },
        { status: 403 }
      );
    }

    // Obtener todos los temas con sus votos
    const topics = await prisma.debateTopic.findMany({
      where: { isActive: true },
      include: {
        votes: {
          select: {
            rank: true,
            user: {
              select: {
                name: true
              }
            }
          }
        }
      },
      orderBy: { order: 'asc' }
    });

    // Calcular puntuación por cantidad de votos (sistema simple)
    const results = topics.map(topic => {
      const totalVotes = topic.votes.length;
      const score = totalVotes; // Sistema por cantidad: simplemente contar votos

      return {
        id: topic.id,
        title: topic.title,
        description: topic.description,
        category: topic.category,
        order: topic.order,
        totalVotes,
        score,
        averageScore: totalVotes, // En este sistema es lo mismo
        votes: detailed ? topic.votes : undefined
      };
    });

    // Ordenar por puntuación
    results.sort((a, b) => b.score - a.score);

    return NextResponse.json({
      results,
      top4: results.slice(0, 4),
      totalVoters: await prisma.debateVote.groupBy({
        by: ['userId'],
      }).then(groups => groups.length)
    });
  } catch (error) {
    console.error('Error fetching results:', error);
    return NextResponse.json(
      { error: 'Error fetching results' },
      { status: 500 }
    );
  }
}

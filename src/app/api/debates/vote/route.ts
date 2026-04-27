import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { validateRequest, debateVoteSchema } from '@/lib/validations';

// POST /api/debates/vote - Registrar votos de un usuario
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await req.json();

    // VALIDAR CON ZOD
    const validation = validateRequest(debateVoteSchema, body);
    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error },
        { status: 400 }
      );
    }

    const { votes } = validation.data;

    // VALIDAR QUE LOS TOPIC IDs EXISTEN
    const activeTopics = await prisma.debateTopic.findMany({
      where: { isActive: true },
      select: { id: true }
    });

    const validTopicIds = new Set(activeTopics.map(t => t.id));
    const invalidTopics = votes.filter((v: any) => !validTopicIds.has(v.topicId));

    if (invalidTopics.length > 0) {
      return NextResponse.json(
        {
          error: 'One or more topic IDs are invalid or inactive',
          invalidTopicIds: invalidTopics.map((v: any) => v.topicId)
        },
        { status: 400 }
      );
    }

    // VALIDAR QUE NO HAYA DUPLICADOS EN TOPIC IDs
    const topicIds = votes.map((v: any) => v.topicId);
    const uniqueTopicIds = new Set(topicIds);
    if (uniqueTopicIds.size !== topicIds.length) {
      return NextResponse.json(
        { error: 'Cannot vote for the same topic multiple times' },
        { status: 400 }
      );
    }

    // VERIFICAR SI EL USUARIO YA VOTÓ Y APLICAR LOCK DE 24 HORAS
    const VOTE_LOCK_HOURS = 24;
    const existingVote = await prisma.debateVote.findFirst({
      where: { userId: session.user.id },
      orderBy: { createdAt: 'asc' }
    });

    if (existingVote) {
      const hoursSinceVote = (Date.now() - existingVote.createdAt.getTime()) / (1000 * 60 * 60);

      if (hoursSinceVote < VOTE_LOCK_HOURS) {
        const hoursRemaining = Math.ceil(VOTE_LOCK_HOURS - hoursSinceVote);
        return NextResponse.json(
          {
            error: `Ya has votado. Para mantener la integridad de la votación, puedes cambiar tu voto hasta ${VOTE_LOCK_HOURS} horas después de tu primer voto.`,
            canChangeVote: false,
            hoursRemaining: hoursRemaining,
            voteLockedUntil: new Date(existingVote.createdAt.getTime() + VOTE_LOCK_HOURS * 60 * 60 * 1000).toISOString()
          },
          { status: 403 }
        );
      }

      // Si han pasado 24 horas, permitir cambio pero loggearlo
      if (process.env.NODE_ENV === 'development') {
        console.log(`[Vote] User ${session.user.id} changing vote after ${hoursSinceVote.toFixed(1)} hours`);
      }
    }

    // Eliminar votos anteriores del usuario (solo si ha pasado el lock)
    await prisma.debateVote.deleteMany({
      where: { userId: session.user.id }
    });

    // Crear nuevos votos
    const newVotes = await Promise.all(
      votes.map(vote =>
        prisma.debateVote.create({
          data: {
            userId: session.user.id,
            topicId: vote.topicId,
            rank: vote.rank
          }
        })
      )
    );

    return NextResponse.json({
      success: true,
      votes: newVotes
    });
  } catch (error) {
    console.error('Error recording vote:', error);
    return NextResponse.json(
      { error: 'Error recording vote' },
      { status: 500 }
    );
  }
}

// GET /api/debates/vote - Obtener votos del usuario actual
export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const votes = await prisma.debateVote.findMany({
      where: { userId: session.user.id },
      include: {
        topic: true
      },
      orderBy: { rank: 'asc' }
    });

    return NextResponse.json(votes);
  } catch (error) {
    console.error('Error fetching votes:', error);
    return NextResponse.json(
      { error: 'Error fetching votes' },
      { status: 500 }
    );
  }
}

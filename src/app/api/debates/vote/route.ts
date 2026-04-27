import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';

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
    const { votes } = body; // Array de { topicId, rank }

    if (!votes || !Array.isArray(votes) || votes.length !== 4) {
      return NextResponse.json(
        { error: 'Must select exactly 4 topics' },
        { status: 400 }
      );
    }

    // Validar que los rangos sean 1-4 y únicos
    const ranks = votes.map(v => v.rank).sort((a, b) => a - b);
    const validRanks = [1, 2, 3, 4];

    if (JSON.stringify(ranks) !== JSON.stringify(validRanks)) {
      return NextResponse.json(
        { error: 'Ranks must be 1, 2, 3, and 4 (unique)' },
        { status: 400 }
      );
    }

    // Eliminar votos anteriores del usuario
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

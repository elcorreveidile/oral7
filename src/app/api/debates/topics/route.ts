import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';

// GET /api/debates/topics - Obtener todos los temas de debate
export async function GET() {
  try {
    const topics = await prisma.debateTopic.findMany({
      where: { isActive: true },
      orderBy: { order: 'asc' },
      include: {
        _count: {
          select: { votes: true }
        }
      }
    });

    return NextResponse.json(topics);
  } catch (error) {
    console.error('Error fetching debate topics:', error);
    return NextResponse.json(
      { error: 'Error fetching debate topics' },
      { status: 500 }
    );
  }
}

// POST /api/debates/topics - Crear nuevos temas (solo admin)
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await req.json();

    const topic = await prisma.debateTopic.create({
      data: {
        title: body.title,
        description: body.description,
        category: body.category,
        order: body.order
      }
    });

    return NextResponse.json(topic, { status: 201 });
  } catch (error) {
    console.error('Error creating debate topic:', error);
    return NextResponse.json(
      { error: 'Error creating debate topic' },
      { status: 500 }
    );
  }
}

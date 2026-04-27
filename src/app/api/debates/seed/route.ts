import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';

// POST /api/debates/seed - Inicializar temas de debate (solo admin)
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Limpiar temas existentes
    await prisma.debateVote.deleteMany({});
    await prisma.debateTopic.deleteMany({});

    // Crear los 12 temas de debate
    const topics = await prisma.debateTopic.createMany({
      data: [
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
      ]
    });

    return NextResponse.json({
      success: true,
      message: `Created ${topics.count} debate topics`,
      count: topics.count
    });
  } catch (error) {
    console.error('Error seeding debate topics:', error);
    return NextResponse.json(
      { error: 'Error seeding debate topics' },
      { status: 500 }
    );
  }
}

import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import prisma from '@/lib/prisma'

// Endpoint protegido para actualizar contenido de sesiones
// Requiere autenticación de administrador (session-based)
// Uso: POST /api/admin/update-session con body { sessionNumber: 2, data: {...} }

export async function POST(req: Request) {
  // Verificar autenticación de administrador usando NextAuth
  const session = await getServerSession(authOptions)

  if (!session || !session.user || session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  }

  try {
    const body = await req.json()
    const { sessionNumber, data } = body

    if (!sessionNumber || !data) {
      return NextResponse.json(
        { error: 'sessionNumber y data son requeridos' },
        { status: 400 }
      )
    }

    // Verificar que la sesión existe
    const existingSession = await prisma.session.findUnique({
      where: { sessionNumber },
    })

    if (!existingSession) {
      return NextResponse.json({ error: 'Sesión no encontrada' }, { status: 404 })
    }

    // Ejecutar todas las operaciones en una transacción para asegurar atomicidad
    const result = await prisma.$transaction(async (tx) => {
      // Actualizar la sesión
      const updatedSession = await tx.session.update({
        where: { sessionNumber },
        data,
      })

      return updatedSession
    })

    return NextResponse.json({
      success: true,
      message: `Sesión ${sessionNumber} actualizada correctamente`,
      session: {
        id: result.id,
        title: result.title,
        subtitle: result.subtitle,
      },
    })
  } catch (error) {

    return NextResponse.json(
      { error: 'Error al actualizar la sesión', details: String(error) },
      { status: 500 }
    )
  }
}

// GET endpoint para obtener datos de una sesión (requiere admin)
export async function GET(req: Request) {
  // Verificar autenticación de administrador usando NextAuth
  const session = await getServerSession(authOptions)

  if (!session || !session.user || session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  }

  try {
    const { searchParams } = new URL(req.url)
    const sessionNum = parseInt(searchParams.get('session') || '2')

    const sessionData = await prisma.session.findUnique({
      where: { sessionNumber: sessionNum },
      include: {
        checklistItems: {
          orderBy: { order: 'asc' },
        },
        resources: {
          orderBy: { order: 'asc' },
        },
        tasks: {
          orderBy: { order: 'asc' },
        },
      },
    })

    if (!sessionData) {
      return NextResponse.json({ error: 'Sesión no encontrada' }, { status: 404 })
    }

    return NextResponse.json({
      session: sessionData,
    })
  } catch (error) {

    return NextResponse.json(
      { error: 'Error al obtener la sesión', details: String(error) },
      { status: 500 }
    )
  }
}

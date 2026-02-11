import { NextResponse } from 'next/server'
import { getAdminSession } from '@/lib/admin-auth'
import prisma from '@/lib/prisma'
import { validateRequest, updateSessionSchema } from '@/lib/validations'
import { logAdminAction } from '@/lib/audit-logger'

// Endpoint protegido para actualizar contenido de sesiones
// Requiere autenticación de administrador (session-based)
// Uso: POST /api/admin/update-session con body { sessionNumber: 2, data: {...} }

export async function POST(req: Request) {
  // Verificar autenticación de administrador usando centralized auth
  const session = await getAdminSession()

  if (!session) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 403 })
  }

  try {
    const body = await req.json()

    // Validate request body with Zod schema
    const validation = validateRequest(updateSessionSchema, body)
    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error },
        { status: 400 }
      )
    }

    const { sessionNumber, data } = validation.data

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

    await logAdminAction(
      session.user.id,
      'SESSION_UPDATE',
      'Session',
      result.id,
      { sessionNumber },
      req
    )

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
    if (process.env.NODE_ENV === 'development') {
      console.error('[Admin Update Session] Failed to update session')
    }

    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}

// GET endpoint para obtener datos de una sesión (requiere admin)
export async function GET(req: Request) {
  // Verificar autenticación de administrador usando centralized auth
  const session = await getAdminSession()

  if (!session) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 403 })
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
    if (process.env.NODE_ENV === 'development') {
      console.error('[Admin Update Session] Failed to fetch session')
    }

    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'
import { validateRequest, createStudentSchema } from '@/lib/validations'
import { Prisma } from '@prisma/client'
import { logAdminAction } from '@/lib/audit-logger'

const CANCELLED_SUBTITLE_FRAGMENT = "cancelad"

// GET - Obtener todos los estudiantes
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get filter parameter from URL
    const { searchParams } = new URL(request.url)
    const filter = searchParams.get('filter')

    // Calculate completed sessions (excluding cancelled)
    const now = new Date()
    const completedSessionsWhere: Prisma.SessionWhereInput = {
      date: { lt: now },
      NOT: {
        subtitle: { contains: CANCELLED_SUBTITLE_FRAGMENT, mode: Prisma.QueryMode.insensitive },
      },
    }

    const completedSessions = await prisma.session.count({
      where: completedSessionsWhere,
    })

    const students = await prisma.user.findMany({
      where: {
        role: 'STUDENT',
      },
      orderBy: {
        name: 'asc',
      },
      select: {
        id: true,
        name: true,
        email: true,
        createdAt: true,
        _count: {
          select: {
            attendances: true,
            progress: true,
          },
        },
        attendances: {
          where: {
            session: completedSessionsWhere,
          },
        },
      },
    })

    // Calculate risk status for each student
    const studentsWithRisk = students.map(student => {
      const attendanceRate = completedSessions > 0
        ? student.attendances.length / completedSessions
        : 1 // If no completed sessions, not at risk
      const isAtRisk = attendanceRate < 0.5

      return {
        id: student.id,
        name: student.name,
        email: student.email,
        createdAt: student.createdAt,
        _count: student._count,
        isAtRisk,
        attendanceRate: Math.round(attendanceRate * 100),
      }
    })

    // Filter if requested
    const filteredStudents = filter === 'atrisk'
      ? studentsWithRisk.filter(s => s.isAtRisk)
      : studentsWithRisk

    return NextResponse.json(filteredStudents)
  } catch (error) {
    console.error('[Students API] Error:', error)
    return NextResponse.json({ error: 'Error fetching students' }, { status: 500 })
  }
}

// POST - Crear nuevo estudiante
export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()

    // Validate request body with Zod schema
    const validation = validateRequest(createStudentSchema, body)
    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error },
        { status: 400 }
      )
    }

    const { name, email, password } = validation.data

    // Verificar si el email ya existe
    const existingUser = await prisma.user.findUnique({
      where: { email },
    })

    if (existingUser) {
      return NextResponse.json(
        { error: 'El email ya está registrado' },
        { status: 400 }
      )
    }

    // Hashear password
    const hashedPassword = await bcrypt.hash(password, 10)

    // Crear estudiante
    const student = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role: 'STUDENT',
      },
      select: {
        id: true,
        name: true,
        email: true,
        createdAt: true,
      },
    })

    await logAdminAction(
      session.user.id,
      'STUDENT_CREATE',
      'User',
      student.id,
      { email: student.email },
      req
    )

    return NextResponse.json(student, { status: 201 })
  } catch (error) {

    return NextResponse.json({ error: 'Error creating student' }, { status: 500 })
  }
}

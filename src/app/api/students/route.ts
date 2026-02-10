import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'

// GET - Obtener todos los estudiantes
export async function GET() {
  try {
    const session = await getServerSession(authOptions)

    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

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
      },
    })

    return NextResponse.json(students)
  } catch (error) {

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
    const { name, email, password } = body

    // Validaciones
    if (!name || !email || !password) {
      return NextResponse.json(
        { error: 'Nombre, email y password son requeridos' },
        { status: 400 }
      )
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: 'El password debe tener al menos 6 caracteres' },
        { status: 400 }
      )
    }

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

    return NextResponse.json(student, { status: 201 })
  } catch (error) {

    return NextResponse.json({ error: 'Error creating student' }, { status: 500 })
  }
}

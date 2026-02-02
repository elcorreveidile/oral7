import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'

// GET - Obtener un estudiante individual con detalles completos
export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const student = await prisma.user.findUnique({
      where: {
        id: params.id,
        role: 'STUDENT',
      },
      select: {
        id: true,
        name: true,
        email: true,
        createdAt: true,
        attendances: {
          include: {
            session: {
              select: {
                sessionNumber: true,
                title: true,
                date: true,
              },
            },
          },
          orderBy: {
            registeredAt: 'desc',
          },
        },
        progress: {
          include: {
            session: {
              select: {
                sessionNumber: true,
                title: true,
                date: true,
              },
            },
          },
          orderBy: {
            lastAccess: 'desc',
          },
        },
        checklistItems: {
          where: {
            isCompleted: true,
          },
        },
        submissions: {
          include: {
            task: {
              select: {
                title: true,
                session: {
                  select: {
                    sessionNumber: true,
                    title: true,
                  },
                },
              },
            },
          },
        },
      },
    })

    if (!student) {
      return NextResponse.json({ error: 'Student not found' }, { status: 404 })
    }

    return NextResponse.json(student)
  } catch (error) {
    console.error('Error fetching student:', error)
    return NextResponse.json({ error: 'Error fetching student' }, { status: 500 })
  }
}

// PUT - Actualizar estudiante
export async function PUT(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()
    const { name, email, password } = body

    // Verificar que el estudiante existe
    const existingStudent = await prisma.user.findUnique({
      where: { id: params.id },
    })

    if (!existingStudent) {
      return NextResponse.json({ error: 'Estudiante no encontrado' }, { status: 404 })
    }

    // Verificar si el email ya está en uso por otro usuario
    if (email && email !== existingStudent.email) {
      const emailExists = await prisma.user.findUnique({
        where: { email },
      })

      if (emailExists) {
        return NextResponse.json(
          { error: 'El email ya está en uso' },
          { status: 400 }
        )
      }
    }

    // Preparar datos de actualización
    const updateData: any = {}
    if (name) updateData.name = name
    if (email) updateData.email = email
    if (password && password.length >= 6) {
      updateData.password = await bcrypt.hash(password, 10)
    }

    // Actualizar estudiante
    const updatedStudent = await prisma.user.update({
      where: { id: params.id },
      data: updateData,
      select: {
        id: true,
        name: true,
        email: true,
        createdAt: true,
      },
    })

    return NextResponse.json(updatedStudent)
  } catch (error) {
    console.error('Error updating student:', error)
    return NextResponse.json({ error: 'Error updating student' }, { status: 500 })
  }
}

// DELETE - Eliminar estudiante
export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Verificar que el estudiante existe
    const existingStudent = await prisma.user.findUnique({
      where: { id: params.id, role: 'STUDENT' },
    })

    if (!existingStudent) {
      return NextResponse.json({ error: 'Estudiante no encontrado' }, { status: 404 })
    }

    // Eliminar estudiante (CASCADE eliminará registros relacionados)
    await prisma.user.delete({
      where: { id: params.id },
    })

    return NextResponse.json({ message: 'Estudiante eliminado correctamente' })
  } catch (error) {
    console.error('Error deleting student:', error)
    return NextResponse.json({ error: 'Error deleting student' }, { status: 500 })
  }
}

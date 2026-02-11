import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { hash } from 'bcryptjs'

export async function POST(request: NextRequest) {
  try {
    const { token, password } = await request.json()

    if (!token || !password) {
      return NextResponse.json(
        { error: 'Token y contraseña son requeridos' },
        { status: 400 }
      )
    }

    // Validar longitud mínima de contraseña
    if (password.length < 8) {
      return NextResponse.json(
        { error: 'La contraseña debe tener al menos 8 caracteres' },
        { status: 400 }
      )
    }

    // Buscar el token en la base de datos
    const resetToken = await prisma.passwordResetToken.findUnique({
      where: { token }
    })

    if (!resetToken) {
      return NextResponse.json(
        { error: 'Token inválido' },
        { status: 400 }
      )
    }

    // Verificar si el token ya fue usado
    if (resetToken.usedAt) {
      return NextResponse.json(
        { error: 'Este enlace ya ha sido utilizado' },
        { status: 400 }
      )
    }

    // Verificar si el token ha expirado
    if (new Date() > resetToken.expiresAt) {
      return NextResponse.json(
        { error: 'Este enlace ha expirado. Solicita uno nuevo.' },
        { status: 400 }
      )
    }

    // Buscar el usuario
    const user = await prisma.user.findUnique({
      where: { email: resetToken.email }
    })

    if (!user) {
      return NextResponse.json(
        { error: 'Usuario no encontrado' },
        { status: 404 }
      )
    }

    // Hashear la nueva contraseña
    const hashedPassword = await hash(password, 12)

    // Actualizar la contraseña del usuario
    await prisma.user.update({
      where: { email: resetToken.email },
      data: { password: hashedPassword }
    })

    // Marcar el token como usado
    await prisma.passwordResetToken.update({
      where: { token },
      data: { usedAt: new Date() }
    })

    console.log('[Reset Password] Contraseña actualizada para:', user.email)

    return NextResponse.json({
      message: 'Contraseña actualizada exitosamente'
    })
  } catch (error) {
    console.error('[Reset Password] Error:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}

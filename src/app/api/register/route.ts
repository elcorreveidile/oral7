import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"
import { z } from "zod"

const registerSchema = z.object({
  name: z.string().min(2, "El nombre debe tener al menos 2 caracteres"),
  email: z.string().email("Email inválido"),
  password: z.string().min(6, "La contraseña debe tener al menos 6 caracteres"),
  registrationCode: z.string().min(1, "El código de registro es obligatorio"),
})

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()

    // Validar datos
    const validatedData = registerSchema.parse(body)

    // Verificar si el usuario ya existe
    const existingUser = await prisma.user.findUnique({
      where: { email: validatedData.email },
    })

    if (existingUser) {
      return NextResponse.json(
        { error: "Ya existe un usuario con este email" },
        { status: 400 }
      )
    }

    // Verificar el código de registro
    const code = await prisma.registrationCode.findUnique({
      where: { code: validatedData.registrationCode },
      include: { registrations: true },
    })

    if (!code) {
      return NextResponse.json(
        { error: "Código de registro inválido" },
        { status: 400 }
      )
    }

    if (!code.isActive) {
      return NextResponse.json(
        { error: "Este código de registro no está activo" },
        { status: 400 }
      )
    }

    if (code.expiresAt && new Date() > code.expiresAt) {
      return NextResponse.json(
        { error: "Este código de registro ha expirado" },
        { status: 400 }
      )
    }

    if (code.usedCount >= code.maxUses) {
      return NextResponse.json(
        { error: "Este código de registro ya ha sido usado completamente" },
        { status: 400 }
      )
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(validatedData.password, 10)

    // Crear usuario
    const user = await prisma.user.create({
      data: {
        name: validatedData.name,
        email: validatedData.email,
        password: hashedPassword,
        role: "STUDENT",
      },
    })

    // Registrar el uso del código
    await prisma.registrationCode.update({
      where: { id: code.id },
      data: {
        usedCount: code.usedCount + 1,
      },
    })

    await prisma.userRegistration.create({
      data: {
        userId: user.id,
        codeId: code.id,
      },
    })

    return NextResponse.json(
      {
        message: "Registro exitoso",
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
        },
      },
      { status: 201 }
    )
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Datos inválidos", details: error.errors },
        { status: 400 }
      )
    }

    console.error("Error en registro:", error)
    return NextResponse.json(
      { error: "Error al registrar usuario" },
      { status: 500 }
    )
  }
}

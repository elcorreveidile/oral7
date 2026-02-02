import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

// GET - Listar códigos (solo admin)
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || session.user?.role !== "ADMIN") {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    const codes = await prisma.registrationCode.findMany({
      include: {
        _count: {
          select: { registrations: true },
        },
      },
      orderBy: { createdAt: "desc" },
    })

    return NextResponse.json(codes)
  } catch (error) {
    console.error("Error al obtener códigos:", error)
    return NextResponse.json(
      { error: "Error al obtener códigos" },
      { status: 500 }
    )
  }
}

// POST - Crear nuevo código (solo admin)
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || session.user?.role !== "ADMIN") {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    const body = await req.json()
    const { maxUses = 1, description } = body

    // Generar código único de 6 caracteres
    let code = ""
    let isUnique = false
    let attempts = 0

    while (!isUnique && attempts < 10) {
      code = Math.random().toString(36).substring(2, 8).toUpperCase()
      const existing = await prisma.registrationCode.findUnique({
        where: { code },
      })
      if (!existing) {
        isUnique = true
      }
      attempts++
    }

    if (!isUnique || !code) {
      return NextResponse.json(
        { error: "No se pudo generar un código único" },
        { status: 500 }
      )
    }

    const newCode = await prisma.registrationCode.create({
      data: {
        code,
        maxUses,
        description,
      },
      include: {
        _count: {
          select: { registrations: true },
        },
      },
    })

    return NextResponse.json(newCode, { status: 201 })
  } catch (error) {
    console.error("Error al crear código:", error)
    return NextResponse.json(
      { error: "Error al crear código" },
      { status: 500 }
    )
  }
}

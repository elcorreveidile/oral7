import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import prisma from "@/lib/prisma"

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json(
        { error: "No autorizado. Inicia sesión primero." },
        { status: 401 }
      )
    }

    const { code } = await request.json()

    if (!code) {
      return NextResponse.json(
        { error: "Código no proporcionado" },
        { status: 400 }
      )
    }

    // Find the QR code
    const qrCode = await prisma.qRCode.findFirst({
      where: {
        code: code.toUpperCase(),
        isActive: true,
        expiresAt: {
          gt: new Date(),
        },
      },
    })

    if (!qrCode) {
      return NextResponse.json(
        { error: "Código inválido o expirado. Pide al profesor un nuevo código." },
        { status: 400 }
      )
    }

    // Check if already registered
    const existingAttendance = await prisma.attendance.findFirst({
      where: {
        userId: session.user.id,
        sessionId: qrCode.sessionId,
      },
    })

    if (existingAttendance) {
      return NextResponse.json(
        { error: "Ya has registrado tu asistencia para esta sesión." },
        { status: 400 }
      )
    }

    // Register attendance
    const attendance = await prisma.attendance.create({
      data: {
        userId: session.user.id,
        sessionId: qrCode.sessionId,
        method: "MANUAL_CODE", // or QR_SCAN based on how they submitted
      },
    })

    return NextResponse.json({
      success: true,
      message: "Asistencia registrada correctamente",
      attendance: {
        id: attendance.id,
        registeredAt: attendance.registeredAt,
      },
    })
  } catch (error) {
    console.error("Error registering attendance:", error)
    return NextResponse.json(
      { error: "Error al registrar la asistencia. Inténtalo de nuevo." },
      { status: 500 }
    )
  }
}

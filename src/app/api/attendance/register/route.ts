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

    // Find the QR code without expiration filter first to give specific error
    const qrCode = await prisma.qRCode.findFirst({
      where: {
        code: code.toUpperCase(),
      },
    })

    // Check if QR code exists
    if (!qrCode) {
      return NextResponse.json(
        { error: "Código inválido. Verifica que hayas introducido el código correcto." },
        { status: 404 }
      )
    }

    // Check if QR code is active
    if (!qrCode.isActive) {
      return NextResponse.json(
        { error: "Este código QR ya no está activo. Pide al profesor un nuevo código." },
        { status: 400 }
      )
    }

    // Check if QR code has expired
    if (qrCode.expiresAt < new Date()) {
      return NextResponse.json(
        { error: "El código QR ha expirado. Pide al profesor un nuevo código." },
        { status: 400 }
      )
    }

    // Fetch the session to check if it has already passed
    const sessionData = await prisma.session.findUnique({
      where: {
        id: qrCode.sessionId,
      },
      select: {
        id: true,
        date: true,
        title: true,
        sessionNumber: true,
      },
    })

    if (!sessionData) {
      return NextResponse.json(
        { error: "Sesión no encontrada. Contacta al administrador." },
        { status: 404 }
      )
    }

    // Check if session has already passed
    const sessionDate = new Date(sessionData.date)
    const now = new Date()
    // End of the session day (23:59:59)
    const endOfSessionDay = new Date(sessionDate)
    endOfSessionDay.setHours(23, 59, 59, 999)

    if (now > endOfSessionDay) {
      return NextResponse.json(
        {
          error: `La sesión ${sessionData.sessionNumber} (${sessionData.title}) ya ha finalizado. No se puede registrar asistencia.`,
        },
        { status: 400 }
      )
    }

    // Check if user is already registered for this session
    const existingAttendance = await prisma.attendance.findFirst({
      where: {
        userId: session.user.id,
        sessionId: qrCode.sessionId,
      },
    })

    if (existingAttendance) {
      return NextResponse.json(
        {
          error: "Ya has registrado tu asistencia para esta sesión.",
          alreadyRegistered: true,
        },
        { status: 400 }
      )
    }

    // Register attendance
    const attendance = await prisma.attendance.create({
      data: {
        userId: session.user.id,
        sessionId: qrCode.sessionId,
        method: "QR_SCAN",
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

import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import prisma from "@/lib/prisma"
import {
  RateLimitConfig,
  addRateLimitHeaders,
  getClientIp,
  rateLimit,
  rateLimitResponse,
} from "@/lib/rate-limit-redis"

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json(
        { error: "No autorizado. Inicia sesión primero." },
        { status: 401 }
      )
    }

    // Apply rate limiting to prevent brute force attacks
    const ip = getClientIp(request)
    const rateLimitResult = await rateLimit(`attendance:${ip}`, RateLimitConfig.auth)

    if (!rateLimitResult.success) {
      const response = rateLimitResponse(rateLimitResult.resetTime)
      // Use generic error message to avoid revealing rate limit details
      return NextResponse.json(
        { error: "Demasiados intentos. Espera un momento antes de volver a intentarlo." },
        { status: 429 }
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
      },
    })

    // Generic error message for all invalid/expired/inactive codes to prevent enumeration
    const GENERIC_ERROR = "Código inválido o expirado. Solicita un nuevo código al profesor."

    // Check if QR code exists
    if (!qrCode) {
      // Log internally for debugging (development only)
      if (process.env.NODE_ENV === 'development') {
        console.log('[Attendance] QR code not found')
      }
      return NextResponse.json(
        { error: GENERIC_ERROR },
        { status: 400 }
      )
    }

    // Check if QR code is active
    if (!qrCode.isActive) {
      if (process.env.NODE_ENV === 'development') {
        console.log('[Attendance] QR code inactive')
      }
      return NextResponse.json(
        { error: GENERIC_ERROR },
        { status: 400 }
      )
    }

    // Check if QR code has expired
    if (qrCode.expiresAt < new Date()) {
      if (process.env.NODE_ENV === 'development') {
        console.log('[Attendance] QR code expired')
      }
      return NextResponse.json(
        { error: GENERIC_ERROR },
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

    const response = NextResponse.json({
      success: true,
      message: "Asistencia registrada correctamente",
      attendance: {
        id: attendance.id,
        registeredAt: attendance.registeredAt,
      },
    })

    // Add rate limit headers to response
    return addRateLimitHeaders(
      response,
      RateLimitConfig.auth.limit,
      rateLimitResult.remaining,
      rateLimitResult.resetTime
    )
  } catch (error) {
    // Log generic error only in development
    if (process.env.NODE_ENV === 'development') {
      console.error("[Attendance] Error registering attendance")
    }

    return NextResponse.json(
      { error: "Error al registrar la asistencia. Inténtalo de nuevo." },
      { status: 500 }
    )
  }
}

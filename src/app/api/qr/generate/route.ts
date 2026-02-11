import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import prisma from "@/lib/prisma"
import { rateLimit, rateLimitResponse, addRateLimitHeaders, RateLimitConfig } from "@/lib/rate-limit-redis"
import { logAdminAction } from "@/lib/audit-logger"

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "No autorizado" },
        { status: 401 }
      )
    }

    // Apply rate limiting based on user ID
    const userId = session.user.id
    const rateLimitResult = await rateLimit(`qr:${userId}`, RateLimitConfig.qr)

    if (!rateLimitResult.success) {
      return rateLimitResponse(rateLimitResult.resetTime)
    }

    const { code, sessionNumber, expiresAt } = await request.json()

    if (!code || !sessionNumber || !expiresAt) {
      return NextResponse.json(
        { error: "Faltan datos requeridos" },
        { status: 400 }
      )
    }

    // Find the session by sessionNumber to get the real DB ID
    const found = await prisma.session.findUnique({
      where: { sessionNumber },
    })

    const dbSession =
      found ??
      (await (async () => {
        // If DB wasn't seeded/synced yet, bootstrap the session from static data.
        const { sessionsData } = await import("@/data/sessions")
        const s = sessionsData.find((x) => x.sessionNumber === sessionNumber)
        if (!s) return null

        return prisma.session.upsert({
          where: { sessionNumber },
          update: {},
          create: {
            sessionNumber: s.sessionNumber,
            date: s.date,
            title: s.title,
            subtitle: s.subtitle,
            blockNumber: s.blockNumber,
            blockTitle: s.blockTitle,
            isExamDay: s.isExamDay,
            examType: (s as any).examType,
            objectives: s.objectives as any,
            timing: s.timing as any,
            dynamics: s.dynamics as any,
            grammarContent: s.grammarContent as any,
            vocabularyContent: s.vocabularyContent as any,
            modeAContent: s.modeAContent as any,
            modeBContent: s.modeBContent as any,
          },
        })
      })())

    if (!dbSession) {
      return NextResponse.json({ error: "Sesión no encontrada" }, { status: 404 })
    }

    // Deactivate any previous active codes for this session
    await prisma.qRCode.updateMany({
      where: {
        sessionId: dbSession.id,
        isActive: true,
      },
      data: {
        isActive: false,
      },
    })

    // Create new QR code
    const qrCode = await prisma.qRCode.create({
      data: {
        code,
        sessionId: dbSession.id,
        expiresAt: new Date(expiresAt),
        isActive: true,
      },
    })

    await logAdminAction(
      session.user.id,
      "QR_GENERATE",
      "QRCode",
      qrCode.id,
      {
        sessionNumber,
        expiresAt: qrCode.expiresAt.toISOString(),
      },
      request
    )

    const response = NextResponse.json({
      success: true,
      qrCode: {
        id: qrCode.id,
        code: qrCode.code,
        expiresAt: qrCode.expiresAt,
      },
    })

    return addRateLimitHeaders(
      response,
      RateLimitConfig.qr.limit,
      rateLimitResult.remaining,
      rateLimitResult.resetTime
    )
  } catch (error) {

    return NextResponse.json(
      { error: "Error al generar el código" },
      { status: 500 }
    )
  }
}

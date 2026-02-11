import { NextRequest, NextResponse } from "next/server"
import { getAdminSession } from "@/lib/admin-auth"
import prisma from "@/lib/prisma"
import { decryptSecret, verifyToken } from "@/lib/twoFactor"
import { logAdminAction } from "@/lib/audit-logger"
import {
  addRateLimitHeaders,
  getClientIp,
  rateLimit,
  rateLimitResponse,
  RateLimitConfig,
} from "@/lib/rate-limit-redis"

export async function POST(request: NextRequest) {
  const session = await getAdminSession()
  if (!session) {
    return NextResponse.json({ error: "No autorizado" }, { status: 403 })
  }

  const ip = getClientIp(request)
  const limiter = await rateLimit(`admin-2fa-verify:${session.user.id}:${ip}`, RateLimitConfig.auth)
  if (!limiter.success) {
    return rateLimitResponse(limiter.resetTime)
  }

  try {
    const body = await request.json().catch(() => null)
    const token = typeof body?.token === "string" ? body.token.trim() : ""

    if (!token) {
      const response = NextResponse.json({ error: "Código 2FA requerido" }, { status: 400 })
      return addRateLimitHeaders(response, RateLimitConfig.auth.limit, limiter.remaining, limiter.resetTime)
    }

    const admin = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { twoFactorSecret: true },
    })

    if (!admin?.twoFactorSecret) {
      const response = NextResponse.json(
        { error: "Primero debes iniciar la configuración de 2FA" },
        { status: 400 }
      )
      return addRateLimitHeaders(response, RateLimitConfig.auth.limit, limiter.remaining, limiter.resetTime)
    }

    let secret: string
    try {
      secret = decryptSecret(admin.twoFactorSecret)
    } catch {
      const response = NextResponse.json(
        { error: "No se pudo leer el secreto de 2FA. Reconfigura 2FA." },
        { status: 400 }
      )
      return addRateLimitHeaders(response, RateLimitConfig.auth.limit, limiter.remaining, limiter.resetTime)
    }

    const valid = verifyToken(secret, token)
    if (!valid) {
      const response = NextResponse.json({ error: "Código 2FA inválido" }, { status: 400 })
      return addRateLimitHeaders(response, RateLimitConfig.auth.limit, limiter.remaining, limiter.resetTime)
    }

    await prisma.user.update({
      where: { id: session.user.id },
      data: { twoFactorEnabled: true },
    })

    await logAdminAction(
      session.user.id,
      "ADMIN_2FA_ENABLED",
      "User",
      session.user.id,
      undefined,
      request
    )

    const response = NextResponse.json({
      success: true,
      message: "2FA activado correctamente.",
    })
    return addRateLimitHeaders(response, RateLimitConfig.auth.limit, limiter.remaining, limiter.resetTime)
  } catch (error) {
    const response = NextResponse.json({ error: "No se pudo verificar el código 2FA" }, { status: 500 })
    return addRateLimitHeaders(response, RateLimitConfig.auth.limit, limiter.remaining, limiter.resetTime)
  }
}

import { NextResponse } from "next/server"
import { hash } from "bcryptjs"
import { prisma } from "@/lib/prisma"
import { rateLimit, getClientIp, rateLimitResponse, addRateLimitHeaders, RateLimitConfig } from "@/lib/rate-limit-redis"
import { validateRequest, registerSchema } from "@/lib/validations"

export async function POST(req: Request) {
  // Apply rate limiting based on IP address
  const ip = getClientIp(req)
  const rateLimitResult = await rateLimit(ip, RateLimitConfig.auth)

  if (!rateLimitResult.success) {
    return rateLimitResponse(rateLimitResult.resetTime)
  }

  try {
    const body = await req.json()

    // Validate request body with Zod schema
    const validation = validateRequest(registerSchema, body)
    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error },
        { status: 400 }
      )
    }

    const { name, email, password, inviteCode } = validation.data

    // Validate invite code
    const validInviteCode = process.env.STUDENT_INVITE_CODE
    if (!validInviteCode || inviteCode !== validInviteCode) {
      return NextResponse.json(
        { error: "Código de invitación inválido. Solicítalo a tu profesor." },
        { status: 403 }
      )
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    })

    if (existingUser) {
      return NextResponse.json(
        { error: "Ya existe una cuenta con este correo electrónico" },
        { status: 400 }
      )
    }

    // Hash password
    const hashedPassword = await hash(password, 12)

    // Create user (default role is STUDENT)
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role: "STUDENT",
      },
    })

    const response = NextResponse.json(
      {
        message: "Usuario creado exitosamente",
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
        },
      },
      { status: 201 }
    )

    // Add rate limit headers
    return addRateLimitHeaders(
      response,
      RateLimitConfig.auth.limit,
      rateLimitResult.remaining,
      rateLimitResult.resetTime
    )
  } catch (error) {

    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    )
  }
}

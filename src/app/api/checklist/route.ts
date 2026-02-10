import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import prisma from "@/lib/prisma"
import { rateLimit, rateLimitResponse, addRateLimitHeaders, RateLimitConfig } from "@/lib/rate-limit"

// GET - Obtener items completados por el usuario para una sesión
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json(
        { error: "No autorizado" },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const sessionId = searchParams.get("sessionId")

    if (!sessionId) {
      return NextResponse.json(
        { error: "sessionId es requerido" },
        { status: 400 }
      )
    }

    // Get completed items for this user and session
    const userChecklistItems = await prisma.userChecklistItem.findMany({
      where: {
        userId: session.user.id,
        checklistItem: {
          sessionId,
        },
        isCompleted: true,
      },
      select: {
        checklistItemId: true,
      },
    })

    const completedItems = userChecklistItems.map((item) => item.checklistItemId)

    return NextResponse.json({
      completedItems,
    })
  } catch (error) {

    return NextResponse.json(
      { error: "Error al cargar el progreso" },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json(
        { error: "No autorizado" },
        { status: 401 }
      )
    }

    // Apply rate limiting based on user ID
    const userId = session.user.id
    const rateLimitResult = rateLimit(`checklist:${userId}`, RateLimitConfig.standard)

    if (!rateLimitResult.success) {
      return rateLimitResponse(rateLimitResult.resetTime)
    }

    const { sessionId, completedItems } = await request.json()

    if (!sessionId || !Array.isArray(completedItems)) {
      return NextResponse.json(
        { error: "Datos inválidos" },
        { status: 400 }
      )
    }

    // Get all checklist items for this session
    const checklistItems = await prisma.checklistItem.findMany({
      where: {
        sessionId,
      },
    })

    // Update or create user checklist items
    for (const item of checklistItems) {
      const isCompleted = completedItems.includes(item.id)

      await prisma.userChecklistItem.upsert({
        where: {
          userId_checklistItemId: {
            userId: session.user.id,
            checklistItemId: item.id,
          },
        },
        update: {
          isCompleted,
          completedAt: isCompleted ? new Date() : null,
        },
        create: {
          userId: session.user.id,
          checklistItemId: item.id,
          isCompleted,
          completedAt: isCompleted ? new Date() : null,
        },
      })
    }

    const response = NextResponse.json({
      success: true,
      message: "Progreso guardado",
    })

    return addRateLimitHeaders(
      response,
      RateLimitConfig.standard.limit,
      rateLimitResult.remaining,
      rateLimitResult.resetTime
    )
  } catch (error) {

    return NextResponse.json(
      { error: "Error al guardar el progreso" },
      { status: 500 }
    )
  }
}

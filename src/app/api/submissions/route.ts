import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import prisma from "@/lib/prisma"
import { rateLimit, rateLimitResponse, addRateLimitHeaders, RateLimitConfig } from "@/lib/rate-limit-redis"

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
    const rateLimitResult = await rateLimit(`submission:${userId}`, RateLimitConfig.submission)

    if (!rateLimitResult.success) {
      return rateLimitResponse(rateLimitResult.resetTime)
    }

    const { taskId, files } = await request.json()

    if (!taskId || !files || !Array.isArray(files) || files.length === 0) {
      return NextResponse.json(
        { error: "Datos inválidos" },
        { status: 400 }
      )
    }

    // Check if task exists
    const task = await prisma.task.findUnique({
      where: { id: taskId },
    })

    if (!task) {
      return NextResponse.json(
        { error: "Tarea no encontrada" },
        { status: 404 }
      )
    }

    // Create or update submission
    const submission = await prisma.submission.upsert({
      where: {
        userId_taskId: {
          userId: session.user.id,
          taskId,
        },
      },
      update: {
        content: { files },
      },
      create: {
        userId: session.user.id,
        taskId,
        content: { files },
      },
    })

    const response = NextResponse.json({
      success: true,
      submission,
    })

    return addRateLimitHeaders(
      response,
      RateLimitConfig.submission.limit,
      rateLimitResult.remaining,
      rateLimitResult.resetTime
    )
  } catch (error) {

    return NextResponse.json(
      { error: "Error al guardar la entrega" },
      { status: 500 }
    )
  }
}

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
    const taskId = searchParams.get("taskId")

    if (!taskId) {
      return NextResponse.json(
        { error: "Falta el taskId" },
        { status: 400 }
      )
    }

    const submission = await prisma.submission.findUnique({
      where: {
        userId_taskId: {
          userId: session.user.id,
          taskId,
        },
      },
    })

    return NextResponse.json({ submission })
  } catch (error) {

    return NextResponse.json(
      { error: "Error al obtener la entrega" },
      { status: 500 }
    )
  }
}

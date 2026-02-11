import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import prisma from "@/lib/prisma"
import { rateLimit, rateLimitResponse, addRateLimitHeaders, RateLimitConfig } from "@/lib/rate-limit-redis"
import { validateRequest, sessionSubmissionSchema } from "@/lib/validations"
import {
  ensureSessionUploadTask,
  ensureSessionUploadTasksForSessions,
  getSessionUploadTaskId,
} from "@/lib/session-upload-tasks"

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json(
        { error: "No autorizado" },
        { status: 401 }
      )
    }

    if (session.user.role !== "STUDENT") {
      return NextResponse.json(
        { error: "Solo estudiantes" },
        { status: 403 }
      )
    }

    const userId = session.user.id
    const rateLimitResult = await rateLimit(`session-submission:${userId}`, RateLimitConfig.submission)
    if (!rateLimitResult.success) {
      return rateLimitResponse(rateLimitResult.resetTime)
    }

    const body = await request.json().catch(() => null)
    const validation = validateRequest(sessionSubmissionSchema, body)
    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error },
        { status: 400 }
      )
    }

    const { sessionNumber, files } = validation.data

    // Check if session exists
    const sessionRecord = await prisma.session.findUnique({
      where: { sessionNumber },
    })

    if (!sessionRecord) {
      return NextResponse.json(
        { error: "Sesión no encontrada" },
        { status: 404 }
      )
    }

    // Ensure the designated upload task exists for this session.
    await ensureSessionUploadTask({
      id: sessionRecord.id,
      sessionNumber: sessionRecord.sessionNumber,
      title: sessionRecord.title,
      isExamDay: sessionRecord.isExamDay,
    })

    const taskId = getSessionUploadTaskId(sessionNumber)

    // Create or update submission
    const submission = await prisma.submission.upsert({
      where: {
        userId_taskId: {
          userId,
          taskId,
        },
      },
      update: {
        content: { files },
      },
      create: {
        userId,
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
      {
        error: "Error al guardar la entrega",
      },
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

    if (session.user.role !== "STUDENT") {
      return NextResponse.json(
        { error: "Solo estudiantes" },
        { status: 403 }
      )
    }

    const sessions = await prisma.session.findMany({
      where: {
        isExamDay: false,
      },
      select: {
        id: true,
        sessionNumber: true,
        title: true,
        date: true,
        isExamDay: true,
      },
      orderBy: {
        sessionNumber: "asc",
      },
    })

    // Ensure designated upload tasks exist for all non-exam sessions.
    // This prevents "empty assignments" screens after syncs/migrations.
    try {
      await ensureSessionUploadTasksForSessions(sessions)
    } catch {
      console.error("[SessionSubmissions] Could not ensure upload tasks")
    }

    // Get all session submissions for this user
    const submissions = await prisma.submission.findMany({
      where: {
        userId: session.user.id,
        taskId: {
          startsWith: "session-",
        },
      },
    })

    const assignments = sessions.map((sessionItem) => ({
      sessionId: sessionItem.id,
      sessionNumber: sessionItem.sessionNumber,
      sessionTitle: sessionItem.title,
      sessionDate: sessionItem.date,
      taskId: getSessionUploadTaskId(sessionItem.sessionNumber),
      taskType: "DOCUMENT_UPLOAD" as const,
    }))

    return NextResponse.json({ submissions, assignments })
  } catch (error) {
    return NextResponse.json(
      { error: "Error al obtener las entregas" },
      { status: 500 }
    )
  }
}

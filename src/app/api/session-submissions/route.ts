import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import prisma from "@/lib/prisma"

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json(
        { error: "No autorizado" },
        { status: 401 }
      )
    }

    const { sessionNumber, files } = await request.json()

    if (!sessionNumber || !files || !Array.isArray(files) || files.length === 0) {
      return NextResponse.json(
        { error: "Datos inválidos" },
        { status: 400 }
      )
    }

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

    // Create submission record with a synthetic ID
    const taskId = `session-${sessionNumber}`

    // Ensure task exists (create a dummy task for file submissions)
    const existingTask = await prisma.task.findUnique({
      where: { id: taskId },
    })

    if (!existingTask) {
      await prisma.task.create({
        data: {
          id: taskId,
          sessionId: sessionRecord.id,
          title: `Entrega de archivos - Sesión ${sessionNumber}`,
          type: "FREE_TEXT",
          content: {},
          order: 999,
        },
      })
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

    return NextResponse.json({
      success: true,
      submission,
    })
  } catch (error) {
    console.error("Error saving submission:", error)
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

    // Get all session submissions for this user
    const submissions = await prisma.submission.findMany({
      where: {
        userId: session.user.id,
        taskId: {
          startsWith: "session-",
        },
      },
    })

    return NextResponse.json({ submissions })
  } catch (error) {
    console.error("Error fetching submissions:", error)
    return NextResponse.json(
      { error: "Error al obtener las entregas" },
      { status: 500 }
    )
  }
}

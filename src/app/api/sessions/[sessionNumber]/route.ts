import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import prisma from "@/lib/prisma"

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ sessionNumber: string }> }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json(
        { error: "No autorizado" },
        { status: 401 }
      )
    }

    const { sessionNumber } = await params
    const sessionNum = parseInt(sessionNumber)

    const sessionData = await prisma.session.findUnique({
      where: {
        sessionNumber: sessionNum,
      },
      include: {
        tasks: {
          orderBy: {
            order: "asc",
          },
        },
        checklistItems: {
          orderBy: {
            order: "asc",
          },
        },
        resources: {
          orderBy: {
            order: "asc",
          },
        },
      },
    })

    if (!sessionData) {
      return NextResponse.json(
        { error: "Sesión no encontrada" },
        { status: 404 }
      )
    }

    // Get user's progress for this session
    const userProgress = await prisma.userProgress.findUnique({
      where: {
        userId_sessionId: {
          userId: session.user.id,
          sessionId: sessionData.id,
        },
      },
    })

    // Get user's checklist items
    const userChecklistItems = await prisma.userChecklistItem.findMany({
      where: {
        userId: session.user.id,
        checklistItem: {
          sessionId: sessionData.id,
        },
      },
    })

    // Record view
    if (!userProgress) {
      await prisma.userProgress.create({
        data: {
          userId: session.user.id,
          sessionId: sessionData.id,
          viewedAt: new Date(),
        },
      })
    } else {
      await prisma.userProgress.update({
        where: {
          id: userProgress.id,
        },
        data: {
          lastAccess: new Date(),
        },
      })
    }

    return NextResponse.json({
      session: sessionData,
      progress: userProgress,
      completedChecklist: userChecklistItems
        .filter((item) => item.isCompleted)
        .map((item) => item.checklistItemId),
    })
  } catch (error) {
    console.error("Error fetching session:", error)
    return NextResponse.json(
      { error: "Error al obtener la sesión" },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ sessionNumber: string }> }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "No autorizado" },
        { status: 401 }
      )
    }

    const { sessionNumber } = await params
    const sessionNum = parseInt(sessionNumber)
    const data = await request.json()

    const updatedSession = await prisma.session.update({
      where: {
        sessionNumber: sessionNum,
      },
      data: {
        title: data.title,
        subtitle: data.subtitle,
        blockNumber: data.blockNumber,
        blockTitle: data.blockTitle,
        objectives: data.objectives,
        timing: data.timing,
        dynamics: data.dynamics,
        grammarContent: data.grammarContent,
        vocabularyContent: data.vocabularyContent,
        modeAContent: data.modeAContent,
        modeBContent: data.modeBContent,
      },
    })

    return NextResponse.json({
      success: true,
      session: updatedSession,
    })
  } catch (error) {
    console.error("Error updating session:", error)
    return NextResponse.json(
      { error: "Error al actualizar la sesión" },
      { status: 500 }
    )
  }
}

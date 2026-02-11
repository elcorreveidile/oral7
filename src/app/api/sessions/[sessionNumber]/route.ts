import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import prisma from "@/lib/prisma"
import { validateRequest, updateSessionDataSchema } from "@/lib/validations"

export async function GET(
  request: NextRequest,
  { params }: { params: { sessionNumber: string } }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json(
        { error: "No autorizado" },
        { status: 401 }
      )
    }

    const { sessionNumber } = params
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

    // Progress tracking (Student only)
    const isStudent = session.user.role === "STUDENT"
    const progress = isStudent
      ? await prisma.userProgress.findUnique({
          where: {
            userId_sessionId: {
              userId: session.user.id,
              sessionId: sessionData.id,
            },
          },
          select: { viewedAt: true, timeSpent: true, lastAccess: true },
        })
      : null

    const completedChecklist = isStudent
      ? await prisma.userChecklistItem
          .findMany({
            where: {
              userId: session.user.id,
              isCompleted: true,
              checklistItem: { sessionId: sessionData.id },
            },
            select: { checklistItemId: true },
          })
          .then((rows) => rows.map((r) => r.checklistItemId))
      : []

    return NextResponse.json({
      session: sessionData,
      progress,
      completedChecklist,
    })
  } catch (error) {

    return NextResponse.json(
      { error: "Error al obtener la sesión" },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { sessionNumber: string } }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "No autorizado" },
        { status: 401 }
      )
    }

    const { sessionNumber } = params
    const sessionNum = parseInt(sessionNumber)
    const body = await request.json()

    // Validate request body with Zod schema
    const validation = validateRequest(updateSessionDataSchema, body)
    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error },
        { status: 400 }
      )
    }

    const data = validation.data

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

    return NextResponse.json(
      { error: "Error al actualizar la sesión" },
      { status: 500 }
    )
  }
}

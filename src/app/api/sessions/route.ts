import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import prisma from "@/lib/prisma"
import { validateRequest, createSessionSchema } from "@/lib/validations"

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json(
        { error: "No autorizado" },
        { status: 401 }
      )
    }

    const sessions = await prisma.session.findMany({
      orderBy: {
        sessionNumber: "asc",
      },
      include: {
        _count: {
          select: {
            attendances: true,
            tasks: true,
            checklistItems: true,
          },
        },
      },
    })

    // For students, hide exam content until the day
    const isStudent = session.user.role === "STUDENT"
    const today = new Date()

    const processedSessions = sessions.map((s) => {
      // Hide future exam details for students
      if (isStudent && s.isExamDay && s.date > today) {
        return {
          id: s.id,
          sessionNumber: s.sessionNumber,
          date: s.date,
          title: s.examType === "PARTIAL" ? "Examen parcial" : "Examen final",
          blockNumber: s.blockNumber,
          blockTitle: s.blockTitle,
          isExamDay: true,
          examType: s.examType,
          // Hide other content
          objectives: [],
          timing: [],
          dynamics: [],
        }
      }
      return s
    })

    return NextResponse.json({
      sessions: processedSessions,
    })
  } catch (error) {

    return NextResponse.json(
      { error: "Error al obtener las sesiones" },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "No autorizado" },
        { status: 401 }
      )
    }

    const body = await request.json()

    // Validate request body with Zod schema
    const validation = validateRequest(createSessionSchema, body)
    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error },
        { status: 400 }
      )
    }

    const data = validation.data

    const newSession = await prisma.session.create({
      data: {
        sessionNumber: data.sessionNumber,
        date: new Date(data.date),
        title: data.title,
        subtitle: data.subtitle,
        blockNumber: data.blockNumber,
        blockTitle: data.blockTitle,
        isExamDay: data.isExamDay || false,
        examType: data.examType,
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
      session: newSession,
    })
  } catch (error) {

    return NextResponse.json(
      { error: "Error al crear la sesión" },
      { status: 500 }
    )
  }
}

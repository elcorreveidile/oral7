import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import prisma from "@/lib/prisma"

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json(
        { error: "No autorizado" },
        { status: 401 }
      )
    }

    // Get session number from query param or use current from settings
    const searchParams = request.nextUrl.searchParams
    const sessionNumberParam = searchParams.get("sessionNumber")

    let targetSessionNumber: number

    if (sessionNumberParam) {
      // Use specific session number (for ADMIN)
      if (session.user.role !== "ADMIN") {
        return NextResponse.json(
          { error: "No autorizado" },
          { status: 403 }
        )
      }
      targetSessionNumber = parseInt(sessionNumberParam)
    } else {
      // Get current session from settings
      const settings = await prisma.settings.findUnique({
        where: { id: "global" },
      })

      if (!settings) {
        return NextResponse.json(
          { error: "Configuración no encontrada" },
          { status: 404 }
        )
      }

      targetSessionNumber = settings.currentSession
    }

    // Find the session
    const sessionData = await prisma.session.findUnique({
      where: { sessionNumber: targetSessionNumber },
    })

    if (!sessionData) {
      return NextResponse.json(
        { error: `Sesión ${targetSessionNumber} no encontrada` },
        { status: 404 }
      )
    }

    return NextResponse.json({
      id: sessionData.id,
      sessionNumber: sessionData.sessionNumber,
      date: sessionData.date,
      title: sessionData.title,
      subtitle: sessionData.subtitle,
      blockNumber: sessionData.blockNumber,
      blockTitle: sessionData.blockTitle,
      isExamDay: sessionData.isExamDay,
      examType: sessionData.examType,
    })
  } catch (error) {
    console.error("Error fetching session:", error)
    return NextResponse.json(
      { error: "Error al obtener la sesión" },
      { status: 500 }
    )
  }
}

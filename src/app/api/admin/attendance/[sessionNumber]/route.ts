import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import prisma from "@/lib/prisma"

export async function GET(
  request: NextRequest,
  { params }: { params: { sessionNumber: string } }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    const sessionNum = parseInt(params.sessionNumber, 10)
    if (!Number.isFinite(sessionNum)) {
      return NextResponse.json({ error: "sessionNumber inválido" }, { status: 400 })
    }

    const dbSession = await prisma.session.findUnique({
      where: { sessionNumber: sessionNum },
      select: {
        id: true,
        sessionNumber: true,
        date: true,
        title: true,
        isExamDay: true,
        attendances: {
          orderBy: { registeredAt: "asc" },
          select: {
            id: true,
            registeredAt: true,
            method: true,
            user: {
              select: { id: true, name: true, email: true },
            },
          },
        },
      },
    })

    if (!dbSession) {
      return NextResponse.json({ error: "Sesión no encontrada" }, { status: 404 })
    }

    // We only compute "absent" for sessions that have already been taught (strictly before today),
    // to avoid showing everyone as absent for future sessions.
    const now = new Date()
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    const sessionDate = new Date(dbSession.date)
    const sessionStart = new Date(sessionDate.getFullYear(), sessionDate.getMonth(), sessionDate.getDate())
    const isCompleted = sessionStart < todayStart
    const state = isCompleted ? "COMPLETED" : sessionStart.getTime() === todayStart.getTime() ? "TODAY" : "UPCOMING"

    const students = await prisma.user.findMany({
      where: { role: "STUDENT" },
      select: { id: true, name: true, email: true },
      orderBy: { name: "asc" },
    })

    const presentIds = new Set(dbSession.attendances.map((a) => a.user.id))
    const present = dbSession.attendances.map((a) => ({
      id: a.id,
      registeredAt: a.registeredAt,
      method: a.method,
      user: a.user,
    }))
    const absent = isCompleted ? students.filter((s) => !presentIds.has(s.id)) : []

    return NextResponse.json({
      meta: { state },
      session: {
        id: dbSession.id,
        sessionNumber: dbSession.sessionNumber,
        date: dbSession.date,
        title: dbSession.title,
        isExamDay: dbSession.isExamDay,
      },
      totals: {
        totalStudents: students.length,
        present: present.length,
        absent: absent.length,
      },
      present,
      absent,
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    console.error("Error fetching attendance detail:", message)
    return NextResponse.json({ error: "Error al obtener la asistencia", message }, { status: 500 })
  }
}

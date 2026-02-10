import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import prisma from "@/lib/prisma"

function isCancelledSubtitle(subtitle: string | null | undefined) {
  return (subtitle || "").toLowerCase().includes("cancelad")
}

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
        subtitle: true,
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
    const isCancelled = isCancelledSubtitle(dbSession.subtitle)
    const state = isCancelled
      ? "CANCELLED"
      : isCompleted
        ? "COMPLETED"
        : sessionStart.getTime() === todayStart.getTime()
          ? "TODAY"
          : "UPCOMING"

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
    const absent = isCompleted && !isCancelled ? students.filter((s) => !presentIds.has(s.id)) : []

    return NextResponse.json({
      meta: { state },
      session: {
        id: dbSession.id,
        sessionNumber: dbSession.sessionNumber,
        date: dbSession.date,
        title: dbSession.title,
        subtitle: dbSession.subtitle,
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

export async function PUT(
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

    const body = await request.json().catch(() => null)
    const presentStudentIds = Array.isArray(body?.presentStudentIds) ? body.presentStudentIds : null

    if (!presentStudentIds) {
      return NextResponse.json({ error: "presentStudentIds requerido (array)" }, { status: 400 })
    }

    const dbSession = await prisma.session.findUnique({
      where: { sessionNumber: sessionNum },
      select: {
        id: true,
        attendances: {
          select: { id: true, userId: true },
        },
      },
    })

    if (!dbSession) {
      return NextResponse.json({ error: "Sesión no encontrada" }, { status: 404 })
    }

    const desired = new Set<string>(presentStudentIds.filter((x: any) => typeof x === "string" && x.length > 0))
    const existing = new Map<string, string>(dbSession.attendances.map((a) => [a.userId, a.id]))

    const toDeleteIds: string[] = []
    for (const [userId, attendanceId] of Array.from(existing.entries())) {
      if (!desired.has(userId)) toDeleteIds.push(attendanceId)
    }

    const toCreate = Array.from(desired)
      .filter((userId) => !existing.has(userId))
      .map((userId) => ({
        userId,
        sessionId: dbSession.id,
        method: "ADMIN" as const,
      }))

    const ops: any[] = []
    if (toDeleteIds.length > 0) {
      ops.push(prisma.attendance.deleteMany({ where: { id: { in: toDeleteIds } } }))
    }
    if (toCreate.length > 0) {
      ops.push(prisma.attendance.createMany({ data: toCreate, skipDuplicates: true }))
    }
    if (ops.length > 0) {
      await prisma.$transaction(ops)
    }

    return NextResponse.json({
      success: true,
      deleted: toDeleteIds.length,
      created: toCreate.length,
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    console.error("Error updating attendance:", message)
    return NextResponse.json({ error: "Error al actualizar la asistencia", message }, { status: 500 })
  }
}

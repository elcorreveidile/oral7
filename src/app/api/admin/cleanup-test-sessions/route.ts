import { NextRequest, NextResponse } from "next/server"
import { getAdminSession } from "@/lib/admin-auth"
import prisma from "@/lib/prisma"
import { logAdminAction } from "@/lib/audit-logger"

export async function POST(request: NextRequest) {
  try {
    const session = await getAdminSession()

    if (!session) {
      return NextResponse.json(
        { error: "No autorizado" },
        { status: 403 }
      )
    }

    // Find test sessions (sessionNumber >= 100 or specific test sessions)
    const testSessions = await prisma.session.findMany({
      where: {
        OR: [
          { sessionNumber: { gte: 100 } },
          { title: { contains: "test", mode: "insensitive" } },
          { title: { contains: "asistencia", mode: "insensitive" } },
        ],
      },
      select: {
        id: true,
        sessionNumber: true,
        title: true,
      },
    })

    if (testSessions.length === 0) {
      return NextResponse.json({
        success: true,
        message: "No se encontraron sesiones de prueba para eliminar.",
        deleted: 0,
      })
    }

    // Delete associated tasks
    const taskIds = testSessions.map((s) => `session-${s.sessionNumber}`)
    await prisma.task.deleteMany({
      where: {
        id: { in: taskIds },
      },
    })

    // Delete sessions
    const deleteResult = await prisma.session.deleteMany({
      where: {
        id: {
          in: testSessions.map((s) => s.id),
        },
      },
    })

    await logAdminAction(
      session.user.id,
      "CLEANUP_TEST_SESSIONS",
      "Session",
      undefined,
      {
        deletedCount: deleteResult.count,
        sessions: testSessions.map((s) => ({
          sessionNumber: s.sessionNumber,
          title: s.title,
        })),
      },
      request
    )

    return NextResponse.json({
      success: true,
      message: `✅ Eliminadas ${deleteResult.count} sesiones de prueba.`,
      deleted: deleteResult.count,
      sessions: testSessions,
    })
  } catch (error) {

    return NextResponse.json(
      { error: "Error al limpiar sesiones de prueba" },
      { status: 500 }
    )
  }
}

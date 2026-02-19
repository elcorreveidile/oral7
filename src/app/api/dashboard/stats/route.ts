import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

export async function GET() {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    // Contar estudiantes reales
    const totalStudents = await prisma.user.count({
      where: { role: "STUDENT" },
    })

    // Obtener settings para saber la sesión actual
    const settings = await prisma.settings.findUnique({
      where: { id: "global" },
    })

    const totalSessions = 27 // Número fijo de sesiones del curso
    const currentSession = settings?.currentSession || 1

    return NextResponse.json({
      totalStudents,
      totalSessions,
      currentSession,
    })
  } catch (error) {
    console.error("Error fetching dashboard stats:", error)
    return NextResponse.json(
      { error: "Error al obtener estadísticas" },
      { status: 500 }
    )
  }
}

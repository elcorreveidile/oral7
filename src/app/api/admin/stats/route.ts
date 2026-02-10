import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import prisma from "@/lib/prisma"

const CANCELLED_SUBTITLE_FRAGMENT = "cancelad"

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || !session.user || session.user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "No autorizado" },
        { status: 401 }
      )
    }

    // Count total students
    const totalStudents = await prisma.user.count({
      where: {
        role: "STUDENT"
      }
    })

    // Get current session number from settings
    const settings = await prisma.settings.findUnique({
      where: { id: "global" }
    })

    const currentSession = settings?.currentSession || 1

    // Calculate students at risk (less than 50% attendance in completed sessions)
    const courseStartDate = settings?.courseStartDate || new Date("2026-02-03")
    const now = new Date()

    const completedSessionsWhere = {
      date: { lt: now },
      OR: [
        { subtitle: null },
        { subtitle: { not: { contains: CANCELLED_SUBTITLE_FRAGMENT, mode: "insensitive" as const } } },
      ],
    }

    // Only calculate risk if course has started
    let studentsAtRisk = 0
    if (now >= courseStartDate) {
      // Get completed sessions (sessions before today)
      const completedSessions = await prisma.session.count({
        where: completedSessionsWhere,
      })

      if (completedSessions > 0) {
        // Find students with less than 50% attendance
        const students = await prisma.user.findMany({
          where: {
            role: "STUDENT"
          },
          include: {
            attendances: {
              where: {
                session: completedSessionsWhere,
              },
            },
          }
        })

        studentsAtRisk = students.filter(student => {
          const attendanceRate = student.attendances.length / completedSessions
          return attendanceRate < 0.5
        }).length
      }
    }

    // Calculate average attendance rate
    let averageAttendance = 0
    const totalAttendances = await prisma.attendance.count({
      where: {
        session: completedSessionsWhere,
      },
    })
    const totalCompletedSessions = await prisma.session.count({
      where: completedSessionsWhere,
    })

    if (totalStudents > 0 && totalCompletedSessions > 0) {
      averageAttendance = Math.round((totalAttendances / (totalStudents * totalCompletedSessions)) * 100)
    }

    return NextResponse.json({
      totalStudents,
      averageAttendance,
      currentSession,
      totalSessions: 27,
      studentsAtRisk
    })
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error)
    console.error("Error fetching stats:", errorMessage)

    return NextResponse.json(
      {
        error: "Error al obtener las estadísticas",
        message: errorMessage
      },
      { status: 500 }
    )
  }
}

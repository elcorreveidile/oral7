import { NextRequest, NextResponse } from "next/server"
import { getAdminSession } from "@/lib/admin-auth"
import { Prisma } from "@prisma/client"
import prisma from "@/lib/prisma"

const CANCELLED_SUBTITLE_FRAGMENT = "cancelad"

export async function GET(request: NextRequest) {
  try {
    const session = await getAdminSession()

    if (!session) {
      return NextResponse.json(
        { error: "No autorizado" },
        { status: 403 }
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

    const completedSessionsWhere: Prisma.SessionWhereInput = {
      date: { lt: now },
      // Exclude cancelled sessions (subtitle contains "cancelad*"), but keep null subtitles.
      NOT: {
        subtitle: { contains: CANCELLED_SUBTITLE_FRAGMENT, mode: Prisma.QueryMode.insensitive },
      },
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
    if (process.env.NODE_ENV === "development") {
      console.error("[Admin Stats] Failed to retrieve statistics")
    }

    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    )
  }
}

import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import prisma from "@/lib/prisma"

// GET - Fetch student progress statistics for the dashboard
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }
    if (session.user.role !== "STUDENT") {
      return NextResponse.json({ error: "Solo estudiantes" }, { status: 403 })
    }

    // Get all sessions count
    const totalSessions = await prisma.session.count()

    // Get user's attendance records
    const attendances = await prisma.attendance.count({
      where: { userId: session.user.id },
    })

    // Get user's progress records (sessions viewed)
    const progressRecords = await prisma.userProgress.findMany({
      where: { userId: session.user.id },
      select: { sessionId: true, viewedAt: true },
    })

    // Get completed checklist items count
    const completedChecklists = await prisma.userChecklistItem.count({
      where: {
        userId: session.user.id,
        isCompleted: true,
      },
    })

    // Calculate sessions completed (viewed)
    const sessionsCompleted = progressRecords.length

    // Calculate attendance rate
    const attendanceRate = totalSessions > 0
      ? Math.round((attendances / totalSessions) * 100)
      : 0

    // Calculate total checklist items for percentage
    const totalChecklistItems = await prisma.checklistItem.count()
    const checklistProgress = totalChecklistItems > 0
      ? Math.round((completedChecklists / totalChecklistItems) * 100)
      : 0

    return NextResponse.json({
      attendanceRate,
      sessionsCompleted,
      totalSessions,
      checklistProgress,
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)

    return NextResponse.json({ error: "Error al obtener estadísticas", message }, { status: 500 })
  }
}

// Track that a student visited a session and (optionally) how long they spent on it.
// This powers `/admin/estudiantes` progress counts (UserProgress records).
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }
    if (session.user.role !== "STUDENT") {
      return NextResponse.json({ error: "Solo estudiantes" }, { status: 403 })
    }

    const body = await request.json().catch(() => ({}))
    const sessionNumber = Number(body?.sessionNumber)
    const secondsSpentRaw = body?.secondsSpent
    const secondsSpent = Number.isFinite(secondsSpentRaw) ? Number(secondsSpentRaw) : 0

    if (!Number.isFinite(sessionNumber) || sessionNumber <= 0) {
      return NextResponse.json({ error: "sessionNumber inválido" }, { status: 400 })
    }

    // Guardrail: ignore absurd values.
    const secondsToAdd = Math.max(0, Math.min(60 * 60, Math.floor(secondsSpent)))

    const dbSession = await prisma.session.findUnique({
      where: { sessionNumber },
      select: { id: true },
    })
    const ensuredSession =
      dbSession ??
      (await (async () => {
        // If sessions weren't seeded/synced yet, bootstrap the single session from the static data.
        const { sessionsData } = await import("@/data/sessions")
        const s = sessionsData.find((x) => x.sessionNumber === sessionNumber)
        if (!s) return null

        const created = await prisma.session.upsert({
          where: { sessionNumber },
          update: {},
          create: {
            sessionNumber: s.sessionNumber,
            date: s.date,
            title: s.title,
            subtitle: s.subtitle,
            blockNumber: s.blockNumber,
            blockTitle: s.blockTitle,
            isExamDay: s.isExamDay,
            examType: (s as any).examType,
            objectives: s.objectives as any,
            timing: s.timing as any,
            dynamics: s.dynamics as any,
            grammarContent: s.grammarContent as any,
            vocabularyContent: s.vocabularyContent as any,
            modeAContent: s.modeAContent as any,
            modeBContent: s.modeBContent as any,
          },
          select: { id: true },
        })

        return created
      })())

    if (!ensuredSession) {
      return NextResponse.json({ error: "Sesión no encontrada" }, { status: 404 })
    }

    const now = new Date()

    const existing = await prisma.userProgress.findUnique({
      where: {
        userId_sessionId: {
          userId: session.user.id,
          sessionId: ensuredSession.id,
        },
      },
      select: { id: true, viewedAt: true },
    })

    const progress = existing
      ? await prisma.userProgress.update({
          where: { id: existing.id },
          data: {
            viewedAt: existing.viewedAt ?? now,
            lastAccess: now,
            timeSpent: secondsToAdd ? { increment: secondsToAdd } : undefined,
          },
          select: { viewedAt: true, lastAccess: true, timeSpent: true },
        })
      : await prisma.userProgress.create({
          data: {
            userId: session.user.id,
            sessionId: ensuredSession.id,
            viewedAt: now,
            lastAccess: now,
            timeSpent: secondsToAdd,
          },
          select: { viewedAt: true, lastAccess: true, timeSpent: true },
        })

    return NextResponse.json({
      success: true,
      progress,
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)

    return NextResponse.json({ error: "Error al guardar el progreso", message }, { status: 500 })
  }
}

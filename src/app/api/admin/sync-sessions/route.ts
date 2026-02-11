import { NextRequest, NextResponse } from "next/server"
import { getAdminSession } from "@/lib/admin-auth"
import prisma from "@/lib/prisma"
import { logAdminAction } from "@/lib/audit-logger"
import { ensureSessionUploadTasksForSessions } from "@/lib/session-upload-tasks"

export async function POST(request: NextRequest) {
  try {
    const session = await getAdminSession()

    if (!session) {
      return NextResponse.json(
        { error: "No autorizado" },
        { status: 403 }
      )
    }

    // Import sessions dynamically
    const { sessionsData } = await import('@/data/sessions')

    let created = 0
    let updated = 0

    for (const sessionData of sessionsData) {
      // Check if session exists
      const existing = await prisma.session.findUnique({
        where: { sessionNumber: sessionData.sessionNumber },
      })

      if (existing) {
        // Update existing session
        await prisma.session.update({
          where: { sessionNumber: sessionData.sessionNumber },
          data: {
            date: sessionData.date,
            title: sessionData.title,
            subtitle: sessionData.subtitle,
            blockNumber: sessionData.blockNumber,
            blockTitle: sessionData.blockTitle,
            isExamDay: sessionData.isExamDay,
            objectives: sessionData.objectives as any,
            timing: sessionData.timing as any,
            dynamics: sessionData.dynamics as any,
            grammarContent: sessionData.grammarContent as any,
            vocabularyContent: sessionData.vocabularyContent as any,
            modeAContent: sessionData.modeAContent as any,
            modeBContent: sessionData.modeBContent as any,
          },
        })
        updated++
      } else {
        // Create new session
        await prisma.session.create({
          data: {
            sessionNumber: sessionData.sessionNumber,
            date: sessionData.date,
            title: sessionData.title,
            subtitle: sessionData.subtitle,
            blockNumber: sessionData.blockNumber,
            blockTitle: sessionData.blockTitle,
            isExamDay: sessionData.isExamDay,
            objectives: sessionData.objectives as any,
            timing: sessionData.timing as any,
            dynamics: sessionData.dynamics as any,
            grammarContent: sessionData.grammarContent as any,
            vocabularyContent: sessionData.vocabularyContent as any,
            modeAContent: sessionData.modeAContent as any,
            modeBContent: sessionData.modeBContent as any,
          },
        })
        created++
      }
    }

    const syncedSessions = await prisma.session.findMany({
      select: {
        id: true,
        sessionNumber: true,
        title: true,
        isExamDay: true,
      },
      orderBy: {
        sessionNumber: "asc",
      },
    })

    const uploadTaskSync = await ensureSessionUploadTasksForSessions(syncedSessions)

    await logAdminAction(
      session.user.id,
      "SESSIONS_SYNC",
      "Session",
      undefined,
      {
        created,
        updated,
        total: sessionsData.length,
        uploadTasksCreated: uploadTaskSync.created,
        uploadTasksUpdated: uploadTaskSync.updated,
      },
      request
    )

    return NextResponse.json({
      success: true,
      message: `✅ Sync complete! Sessions created: ${created}, updated: ${updated}. Upload tasks created: ${uploadTaskSync.created}, updated: ${uploadTaskSync.updated}.`
    })
  } catch (error) {

    return NextResponse.json(
      { error: "Error al sincronizar las sesiones" },
      { status: 500 }
    )
  }
}

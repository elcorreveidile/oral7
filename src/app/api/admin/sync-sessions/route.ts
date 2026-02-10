import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import prisma from "@/lib/prisma"

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "No autorizado" },
        { status: 401 }
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

    return NextResponse.json({
      success: true,
      message: `✅ Sync complete! Created: ${created}, Updated: ${updated}, Total: ${sessionsData.length}`
    })
  } catch (error) {

    return NextResponse.json(
      { error: "Error al sincronizar las sesiones" },
      { status: 500 }
    )
  }
}


import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import prisma from "@/lib/prisma"

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json(
        { error: "No autorizado" },
        { status: 401 }
      )
    }

    const { sessionId, completedItems } = await request.json()

    if (!sessionId || !Array.isArray(completedItems)) {
      return NextResponse.json(
        { error: "Datos inválidos" },
        { status: 400 }
      )
    }

    // Get all checklist items for this session
    const checklistItems = await prisma.checklistItem.findMany({
      where: {
        sessionId,
      },
    })

    // Update or create user checklist items
    for (const item of checklistItems) {
      const isCompleted = completedItems.includes(item.id)

      await prisma.userChecklistItem.upsert({
        where: {
          userId_checklistItemId: {
            userId: session.user.id,
            checklistItemId: item.id,
          },
        },
        update: {
          isCompleted,
          completedAt: isCompleted ? new Date() : null,
        },
        create: {
          userId: session.user.id,
          checklistItemId: item.id,
          isCompleted,
          completedAt: isCompleted ? new Date() : null,
        },
      })
    }

    return NextResponse.json({
      success: true,
      message: "Progreso guardado",
    })
  } catch (error) {
    console.error("Error saving checklist:", error)
    return NextResponse.json(
      { error: "Error al guardar el progreso" },
      { status: 500 }
    )
  }
}

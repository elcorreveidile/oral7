import { NextRequest, NextResponse } from "next/server"
import { getAdminSession } from "@/lib/admin-auth"
import prisma from "@/lib/prisma"

export async function GET(request: NextRequest) {
  try {
    const session = await getAdminSession()

    if (!session) {
      return NextResponse.json(
        { error: "No autorizado" },
        { status: 403 }
      )
    }

    // Get all session submissions with user and session info
    const submissions = await prisma.submission.findMany({
      where: {
        taskId: {
          startsWith: "session-",
        },
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        task: {
          select: {
            id: true,
            sessionId: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    })

    // Extract unique sessionNumbers from all submissions (avoid N+1 query)
    const uniqueSessionNumbers = new Set(
      submissions
        .map((sub) => parseInt(sub.taskId.replace("session-", "")))
        .filter((num) => !isNaN(num))
    )
    const sessionNumbers = Array.from(uniqueSessionNumbers)

    // Fetch all sessions in a single query
    const sessions = await prisma.session.findMany({
      where: {
        sessionNumber: { in: sessionNumbers },
      },
      select: {
        sessionNumber: true,
        title: true,
        date: true,
      },
    })

    // Create a map for O(1) lookup
    const sessionMap = new Map(
      sessions.map((s) => [s.sessionNumber, s])
    )

    // Enrich submissions with session data from map
    const enrichedSubmissions = submissions
      .map((sub) => {
        const sessionNumber = parseInt(sub.taskId.replace("session-", ""))

        // Skip if sessionNumber is invalid
        if (isNaN(sessionNumber)) {
          return null
        }

        const sessionData = sessionMap.get(sessionNumber)

        return {
          id: sub.id,
          userId: sub.user.id,
          userName: sub.user.name,
          userEmail: sub.user.email,
          sessionNumber,
          sessionTitle: sessionData?.title,
          sessionDate: sessionData?.date,
          files: (sub.content as any)?.files || [],
          createdAt: sub.createdAt,
        }
      })
      .filter((sub): sub is any => sub !== null)

    return NextResponse.json({ submissions: enrichedSubmissions })
  } catch (error) {

    return NextResponse.json(
      { error: "Error al obtener las entregas" },
      { status: 500 }
    )
  }
}

import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import prisma from "@/lib/prisma"

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "No autorizado" },
        { status: 401 }
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

    // Enrich with session details
    const enrichedSubmissions = await Promise.all(
      submissions.map(async (sub) => {
        const sessionNumber = parseInt(sub.taskId.replace("session-", ""))
        const sessionData = await prisma.session.findUnique({
          where: { sessionNumber },
          select: {
            sessionNumber: true,
            title: true,
            date: true,
          },
        })

        return {
          id: sub.id,
          userId: sub.user.id,
          userName: sub.user.name,
          userEmail: sub.user.email,
          sessionNumber,
          sessionTitle: sessionData?.title,
          sessionDate: sessionData?.date,
          files: sub.content.files || [],
          createdAt: sub.createdAt,
        }
      })
    )

    return NextResponse.json({ submissions: enrichedSubmissions })
  } catch (error) {
    console.error("Error fetching submissions:", error)
    return NextResponse.json(
      { error: "Error al obtener las entregas" },
      { status: 500 }
    )
  }
}

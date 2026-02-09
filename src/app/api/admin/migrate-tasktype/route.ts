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

    // Check if DOCUMENT_UPLOAD already exists
    const checkResult = await prisma.$queryRaw<Array<{ enumlabel: string }>>`
      SELECT enumlabel
      FROM pg_enum
      WHERE enumtypid = (
        SELECT oid FROM pg_type WHERE typname = 'TaskType'
      )
      AND enumlabel = 'DOCUMENT_UPLOAD'
    `

    if (checkResult.length > 0) {
      return NextResponse.json({
        success: true,
        message: "DOCUMENT_UPLOAD ya existe en el enum TaskType",
      })
    }

    // Add DOCUMENT_UPLOAD to TaskType enum
    await prisma.$executeRaw`
      ALTER TYPE "TaskType" ADD VALUE 'DOCUMENT_UPLOAD'
    `

    return NextResponse.json({
      success: true,
      message: "DOCUMENT_UPLOAD añadido exitosamente al enum TaskType",
    })

  } catch (error) {
    console.error("Migration error:", error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Error desconocido"
      },
      { status: 500 }
    )
  }
}


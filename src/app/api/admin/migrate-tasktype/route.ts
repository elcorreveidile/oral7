import { NextRequest, NextResponse } from "next/server"
import { getAdminSession } from "@/lib/admin-auth"
import prisma from "@/lib/prisma"
import { logAdminAction } from "@/lib/audit-logger"

export async function POST(request: NextRequest) {
  try {
    const session = await getAdminSession()

    if (!session) {
      return NextResponse.json(
        { error: "No autorizado" },
        { status: 403 }
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
      await logAdminAction(
        session.user.id,
        "TASKTYPE_MIGRATION_CHECK",
        "TaskType",
        undefined,
        { alreadyExists: true },
        request
      )

      return NextResponse.json({
        success: true,
        message: "DOCUMENT_UPLOAD ya existe en el enum TaskType",
      })
    }

    // Add DOCUMENT_UPLOAD to TaskType enum
    await prisma.$executeRaw`
      ALTER TYPE "TaskType" ADD VALUE 'DOCUMENT_UPLOAD'
    `

    await logAdminAction(
      session.user.id,
      "TASKTYPE_MIGRATION_EXECUTED",
      "TaskType",
      undefined,
      { value: "DOCUMENT_UPLOAD" },
      request
    )

    return NextResponse.json({
      success: true,
      message: "DOCUMENT_UPLOAD añadido exitosamente al enum TaskType",
    })

  } catch (error) {
    if (process.env.NODE_ENV === "development") {
      console.error("[Admin TaskType Migration] Failed to execute migration")
    }

    return NextResponse.json(
      {
        success: false,
        error: "Error interno del servidor"
      },
      { status: 500 }
    )
  }
}

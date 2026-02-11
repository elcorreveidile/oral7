import { NextRequest, NextResponse } from "next/server"
import { getAdminSession } from "@/lib/admin-auth"
import prisma from "@/lib/prisma"
import { logAdminAction } from "@/lib/audit-logger"
import { validateRequest, adminSubmissionUpdateSchema } from "@/lib/validations"
import { deleteSubmissionFiles, StoredSubmissionFile } from "@/lib/submission-storage"

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getAdminSession()

    if (!session) {
      return NextResponse.json({ error: "No autorizado" }, { status: 403 })
    }

    const body = await request.json().catch(() => null)
    const validation = validateRequest(adminSubmissionUpdateSchema, body)
    if (!validation.success) {
      return NextResponse.json({ error: validation.error }, { status: 400 })
    }

    const submissionId = params.id
    const feedbackRaw = validation.data.feedback
    const scoreRaw = validation.data.score

    const updateData: { feedback?: string; score?: number | null } = {}

    if (feedbackRaw !== undefined) {
      const feedback = feedbackRaw.trim()
      if (feedback.length === 0) {
        return NextResponse.json(
          { error: "El feedback no puede estar vacío" },
          { status: 400 }
        )
      }
      updateData.feedback = feedback
    }

    if (scoreRaw !== undefined) {
      updateData.score = scoreRaw
    }

    const updatedSubmission = await prisma.submission.update({
      where: { id: submissionId },
      data: updateData,
      select: {
        id: true,
        feedback: true,
        score: true,
        updatedAt: true,
      },
    })

    await logAdminAction(
      session.user.id,
      "SUBMISSION_FEEDBACK_UPDATE",
      "Submission",
      submissionId,
      {
        feedbackUpdated: updateData.feedback !== undefined,
        scoreUpdated: updateData.score !== undefined,
      },
      request
    )

    return NextResponse.json({
      success: true,
      submission: updatedSubmission,
      message: "Feedback guardado correctamente",
    })
  } catch {
    return NextResponse.json(
      { error: "No se pudo actualizar la entrega" },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getAdminSession()

    if (!session) {
      return NextResponse.json({ error: "No autorizado" }, { status: 403 })
    }

    const submissionId = params.id
    const submission = await prisma.submission.findUnique({
      where: { id: submissionId },
      select: {
        id: true,
        taskId: true,
        userId: true,
        feedback: true,
        content: true,
      },
    })

    if (!submission) {
      return NextResponse.json({ error: "Entrega no encontrada" }, { status: 404 })
    }

    if (!submission.feedback || submission.feedback.trim().length === 0) {
      return NextResponse.json(
        { error: "Debes responder al estudiante antes de borrar archivos" },
        { status: 400 }
      )
    }

    const filesRaw = (submission.content as any)?.files
    const files: StoredSubmissionFile[] = Array.isArray(filesRaw)
      ? filesRaw.map((file: any) => ({
          url: typeof file?.url === "string" ? file.url : undefined,
          filename: typeof file?.filename === "string" ? file.filename : undefined,
          name: typeof file?.name === "string" ? file.name : undefined,
        }))
      : []

    if (files.length > 0) {
      const deletion = await deleteSubmissionFiles(files)
      if (deletion.failed > 0) {
        return NextResponse.json(
          {
            error: "No se pudieron borrar todos los archivos. Inténtalo de nuevo.",
            failed: deletion.failed,
          },
          { status: 503 }
        )
      }
    }

    const currentContent =
      typeof submission.content === "object" && submission.content !== null
        ? (submission.content as Record<string, unknown>)
        : {}

    const nextContent = {
      ...currentContent,
      files: [],
      filesPurgedAt: new Date().toISOString(),
      filesPurgedBy: session.user.id,
    }

    await prisma.submission.update({
      where: { id: submissionId },
      data: {
        content: nextContent,
      },
    })

    await logAdminAction(
      session.user.id,
      "SUBMISSION_FILES_PURGED",
      "Submission",
      submissionId,
      {
        userId: submission.userId,
        taskId: submission.taskId,
        deletedFiles: files.length,
      },
      request
    )

    return NextResponse.json({
      success: true,
      deletedFiles: files.length,
      message: "Archivos eliminados correctamente",
    })
  } catch {
    return NextResponse.json(
      { error: "No se pudieron borrar los archivos de la entrega" },
      { status: 500 }
    )
  }
}

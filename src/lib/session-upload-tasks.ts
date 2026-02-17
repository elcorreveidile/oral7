import prisma from "@/lib/prisma"

type SessionLite = {
  id: string
  sessionNumber: number
  title: string
  isExamDay: boolean
  homeworkInstructions?: string | null
}

export const SESSION_UPLOAD_TASK_PREFIX = "session-"
export const SESSION_UPLOAD_TASK_ORDER = 900

function buildSessionUploadTaskTitle(sessionNumber: number): string {
  return `Entrega de archivos - Sesión ${sessionNumber}`
}

function buildSessionUploadTaskDescription(sessionTitle: string): string {
  return `Sube tu entrega para "${sessionTitle}". El profesor revisará y enviará feedback.`
}

function buildSessionUploadTaskContent(homeworkInstructions?: string | null) {
  const instructions = homeworkInstructions
    ? homeworkInstructions
    : "Sube tus evidencias de la sesión (audio, vídeo o documento). Máximo 10 archivos."

  return {
    instructions,
    acceptedFileTypes: ["audio", "video", "document"],
    maxFiles: 10,
  }
}

export function getSessionUploadTaskId(sessionNumber: number): string {
  return `${SESSION_UPLOAD_TASK_PREFIX}${sessionNumber}`
}

export function parseSessionNumberFromUploadTaskId(taskId: string): number | null {
  if (!taskId.startsWith(SESSION_UPLOAD_TASK_PREFIX)) {
    return null
  }

  const raw = taskId.slice(SESSION_UPLOAD_TASK_PREFIX.length)
  if (!/^\d+$/.test(raw)) {
    return null
  }

  const sessionNumber = Number.parseInt(raw, 10)
  if (!Number.isFinite(sessionNumber) || sessionNumber <= 0) {
    return null
  }

  return sessionNumber
}

export function isSessionUploadTaskId(taskId: string): boolean {
  return parseSessionNumberFromUploadTaskId(taskId) !== null
}

export async function ensureSessionUploadTask(session: SessionLite): Promise<void> {
  if (session.isExamDay) {
    return
  }

  const taskId = getSessionUploadTaskId(session.sessionNumber)

  await prisma.task.upsert({
    where: { id: taskId },
    update: {
      sessionId: session.id,
      title: buildSessionUploadTaskTitle(session.sessionNumber),
      description: buildSessionUploadTaskDescription(session.title),
      type: "DOCUMENT_UPLOAD",
      content: buildSessionUploadTaskContent(session.homeworkInstructions),
      order: SESSION_UPLOAD_TASK_ORDER,
      isModeBOnly: false,
    },
    create: {
      id: taskId,
      sessionId: session.id,
      title: buildSessionUploadTaskTitle(session.sessionNumber),
      description: buildSessionUploadTaskDescription(session.title),
      type: "DOCUMENT_UPLOAD",
      content: buildSessionUploadTaskContent(session.homeworkInstructions),
      order: SESSION_UPLOAD_TASK_ORDER,
      isModeBOnly: false,
    },
  })
}

export async function ensureSessionUploadTasksForSessions(sessions: SessionLite[]): Promise<{
  created: number
  updated: number
  skippedExamSessions: number
}> {
  let created = 0
  let updated = 0
  let skippedExamSessions = 0

  const updatableSessions = sessions.filter((session) => {
    if (session.isExamDay) {
      skippedExamSessions += 1
      return false
    }
    return true
  })

  if (updatableSessions.length === 0) {
    return { created, updated, skippedExamSessions }
  }

  const taskIds = updatableSessions.map((session) => getSessionUploadTaskId(session.sessionNumber))
  const existingTasks = await prisma.task.findMany({
    where: {
      id: {
        in: taskIds,
      },
    },
    select: {
      id: true,
      sessionId: true,
      title: true,
      description: true,
      content: true,
      type: true,
      order: true,
      isModeBOnly: true,
    },
  })
  const existingTaskById = new Map(existingTasks.map((task) => [task.id, task]))
  const toCreate: {
    id: string
    sessionId: string
    title: string
    description: string
    type: "DOCUMENT_UPLOAD"
    content: ReturnType<typeof buildSessionUploadTaskContent>
    order: number
    isModeBOnly: false
  }[] = []
  const toUpdate: {
    id: string
    data: {
      sessionId: string
      title: string
      description: string
      type: "DOCUMENT_UPLOAD"
      content: ReturnType<typeof buildSessionUploadTaskContent>
      order: number
      isModeBOnly: false
    }
  }[] = []

  for (const session of updatableSessions) {
    const taskId = getSessionUploadTaskId(session.sessionNumber)
    const title = buildSessionUploadTaskTitle(session.sessionNumber)
    const description = buildSessionUploadTaskDescription(session.title)
    const content = buildSessionUploadTaskContent(session.homeworkInstructions)

    const existingTask = existingTaskById.get(taskId)
    if (!existingTask) {
      toCreate.push({
        id: taskId,
        sessionId: session.id,
        title,
        description,
        type: "DOCUMENT_UPLOAD",
        content,
        order: SESSION_UPLOAD_TASK_ORDER,
        isModeBOnly: false,
      })
      continue
    }

    // Compare content as JSON string to detect changes in homeworkInstructions
    const existingContentStr = JSON.stringify(existingTask.content)
    const newContentStr = JSON.stringify(content)
    const contentChanged = existingContentStr !== newContentStr

    const needsUpdate =
      existingTask.sessionId !== session.id ||
      existingTask.type !== "DOCUMENT_UPLOAD" ||
      existingTask.title !== title ||
      existingTask.description !== description ||
      existingTask.order !== SESSION_UPLOAD_TASK_ORDER ||
      existingTask.isModeBOnly !== false ||
      contentChanged

    if (needsUpdate) {
      toUpdate.push({
        id: taskId,
        data: {
          sessionId: session.id,
          title,
          description,
          type: "DOCUMENT_UPLOAD",
          content,
          order: SESSION_UPLOAD_TASK_ORDER,
          isModeBOnly: false,
        },
      })
    }
  }

  if (toCreate.length > 0) {
    await prisma.task.createMany({
      data: toCreate,
      skipDuplicates: true,
    })
    created = toCreate.length
  }

  for (const item of toUpdate) {
    await prisma.task.update({
      where: { id: item.id },
      data: item.data,
    })
    updated += 1
  }

  return { created, updated, skippedExamSessions }
}

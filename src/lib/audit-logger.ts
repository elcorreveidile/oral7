import prisma from "@/lib/prisma"
import { getClientIp } from "@/lib/rate-limit-redis"

export async function logAdminAction(
  adminId: string,
  action: string,
  entityType: string,
  entityId?: string,
  metadata?: unknown,
  req?: Request
): Promise<void> {
  try {
    const ipAddress = req ? getClientIp(req) : undefined
    const userAgent = req?.headers.get("user-agent")?.slice(0, 1024) || undefined

    await prisma.auditLog.create({
      data: {
        adminId,
        action,
        entityType,
        entityId: entityId || null,
        metadata: metadata === undefined ? undefined : (metadata as any),
        ipAddress,
        userAgent,
      },
    })
  } catch (error) {
    // El logging de auditoría no debe romper acciones de negocio.
    console.error("[AuditLog] Failed to persist admin action")
  }
}

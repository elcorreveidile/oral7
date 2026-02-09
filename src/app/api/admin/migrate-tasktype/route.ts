import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

export async function GET() {
  const session = await getServerSession(authOptions)

  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 })
  }

  // Prisma schema already includes DOCUMENT_UPLOAD in TaskType enum.
  // Running schema changes via an HTTP endpoint is risky; keep this as a safe no-op.
  return NextResponse.json({
    ok: true,
    message: "Migracion no necesaria: DOCUMENT_UPLOAD ya esta contemplado en el esquema (no-op).",
  })
}


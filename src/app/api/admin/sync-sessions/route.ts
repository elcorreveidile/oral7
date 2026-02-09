import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

export async function GET() {
  const session = await getServerSession(authOptions)

  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 })
  }

  // Este proyecto ya gestiona las sesiones desde la base de datos.
  // Dejamos el endpoint para compatibilidad con despliegues anteriores que
  // mostraban el boton en el panel.
  return NextResponse.json({
    ok: true,
    message: "Sincronizacion no necesaria: las sesiones ya se gestionan en base de datos (no-op).",
  })
}


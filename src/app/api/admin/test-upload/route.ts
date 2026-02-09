import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

export async function GET() {
  const session = await getServerSession(authOptions)

  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 })
  }

  const token = process.env.BLOB_READ_WRITE_TOKEN
  if (!token) {
    return NextResponse.json(
      { error: "Falta BLOB_READ_WRITE_TOKEN en el entorno." },
      { status: 500 },
    )
  }

  if (!token.startsWith("vercel_blob_")) {
    return NextResponse.json(
      { error: "El token tiene un formato incorrecto. Debe empezar con 'vercel_blob_'." },
      { status: 400 },
    )
  }

  // Nota: no hacemos una subida real para evitar escrituras/side-effects desde el panel.
  return NextResponse.json({
    ok: true,
    message: "Configuracion OK. (Test de subida real deshabilitado; solo validacion de token.)",
  })
}


import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "No autorizado" },
        { status: 401 }
      )
    }

    const token = process.env.BLOB_READ_WRITE_TOKEN

    if (!token) {
      return NextResponse.json({
        configured: false,
        message: "BLOB_READ_WRITE_TOKEN no está configurado en las variables de entorno de Vercel"
      })
    }

    // Test the connection - just check if token format is valid
    if (!token.startsWith('vercel_blob_')) {
      return NextResponse.json({
        configured: false,
        message: "El token tiene un formato incorrecto. Debe empezar con 'vercel_blob_'"
      })
    }

    return NextResponse.json({
      configured: true,
      message: "Vercel Blob Storage está configurado correctamente",
      tokenPreview: token.substring(0, 20) + "..."
    })

  } catch (error) {
    console.error("Error checking blob:", error)
    return NextResponse.json(
      {
        configured: false,
        message: "Error al verificar la conexión",
        error: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    )
  }
}

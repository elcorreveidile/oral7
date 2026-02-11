import { NextRequest, NextResponse } from "next/server"
import { getAdminSession } from "@/lib/admin-auth"

export async function GET(request: NextRequest) {
  try {
    const session = await getAdminSession()

    if (!session) {
      return NextResponse.json(
        { error: "No autorizado" },
        { status: 403 }
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
    // Better error logging to prevent "n" output
    const errorMessage = error instanceof Error ? error.message : String(error)


    return NextResponse.json(
      {
        configured: false,
        message: "Error al verificar la conexión",
        error: errorMessage
      },
      { status: 500 }
    )
  }
}


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
        message: "BLOB_READ_WRITE_TOKEN no está configurado en las variables de entorno"
      })
    }

    // Test the connection
    const testUrl = `https://${token}@blob.vercel-storage.com/test-connection.txt`

    const response = await fetch(testUrl, {
      method: 'PUT',
      body: 'test',
      headers: {
        'Content-Type': 'text/plain',
      },
      // @ts-ignore
      duplex: 'half',
    })

    if (response.ok) {
      const data = await response.json()
      return NextResponse.json({
        configured: true,
        message: "Conexión exitosa con Vercel Blob Storage",
        testUrl: data.url,
      })
    } else {
      return NextResponse.json({
        configured: true,
        message: `Error de conexión: ${response.status}`,
        error: await response.text(),
      })
    }
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

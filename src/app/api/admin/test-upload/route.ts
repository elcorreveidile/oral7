import { NextRequest, NextResponse } from "next/server"
import { getAdminSession } from "@/lib/admin-auth"

export async function POST(request: NextRequest) {
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
        success: false,
        error: "BLOB_READ_WRITE_TOKEN no configurado"
      })
    }

    // Create a simple test file
    const testContent = "Test file content"
    const filename = `test-${Date.now()}.txt`
    const blobUrl = `https://blob.vercel-storage.com/${filename}`



    const response = await fetch(blobUrl, {
      method: 'PUT',
      body: testContent,
      headers: {
        'authorization': `Bearer ${token}`,
        'Content-Type': 'text/plain',
      },
    })




    if (!response.ok) {
      const errorText = await response.text()
      if (process.env.NODE_ENV === "development") {
        console.error(`[Admin Test Upload] Blob service error ${response.status}: ${errorText}`)
      }

      return NextResponse.json({
        success: false,
        error: "El servicio de almacenamiento no está disponible",
        status: response.status,
      })
    }

    const data = await response.json()

    return NextResponse.json({
      success: true,
      message: "Test file uploaded successfully",
      url: data.url,
    })

  } catch (error) {
    if (process.env.NODE_ENV === "development") {
      console.error("[Admin Test Upload] Unexpected error while testing upload")
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

import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json(
        { error: "No autorizado" },
        { status: 401 }
      )
    }

    const formData = await request.formData()
    const file = formData.get("file") as File
    const taskId = formData.get("taskId") as string

    if (!file) {
      return NextResponse.json(
        { error: "No se proporcionó ningún archivo" },
        { status: 400 }
      )
    }

    // Validate file type
    const allowedTypes = [
      "audio/mp3",
      "audio/wav",
      "audio/mpeg",
      "audio/webm",
      "video/mp4",
      "video/webm",
      "video/quicktime",
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ]

    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: "Tipo de archivo no permitido" },
        { status: 400 }
      )
    }

    // Validate file size (max 50MB)
    const maxSize = 50 * 1024 * 1024 // 50MB
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: "El archivo es demasiado grande (máximo 50MB)" },
        { status: 400 }
      )
    }

    // Generate unique filename
    const timestamp = Date.now()
    const originalName = file.name.replace(/[^a-zA-Z0-9.-]/g, "_")
    const filename = `${session.user.id}/${taskId}/${timestamp}-${originalName}`

    // Upload to Vercel Blob using REST API
    const blobUrl = `https://${process.env.BLOB_READ_WRITE_TOKEN}@blob.vercel-storage.com/${filename}`

    const blobResponse = await fetch(blobUrl, {
      method: 'PUT',
      body: file,
      headers: {
        'x-api-version': '1',
        'Content-Type': file.type,
      },
    })

    if (!blobResponse.ok) {
      throw new Error('Failed to upload to Vercel Blob')
    }

    const blobData = await blobResponse.json()

    return NextResponse.json({
      success: true,
      file: {
        url: blobData.url,
        name: file.name,
        type: file.type,
        size: file.size,
        filename,
      },
    })
  } catch (error) {
    console.error("Error uploading file:", error)
    return NextResponse.json(
      { error: "Error al subir el archivo" },
      { status: 500 }
    )
  }
}

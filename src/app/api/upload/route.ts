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

    console.log("Upload request:", {
      fileName: file.name,
      fileType: file.type,
      fileSize: file.size,
      taskId,
    })

    // Validate file type
    const allowedTypes = [
      "audio/mp3",
      "audio/wav",
      "audio/mpeg",
      "audio/webm",
      "audio/ogg",
      "video/mp4",
      "video/webm",
      "video/quicktime",
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ]

    if (!allowedTypes.includes(file.type)) {
      console.log("File type not allowed:", file.type)
      return NextResponse.json(
        { error: `Tipo de archivo no permitido: ${file.type}` },
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
    const token = process.env.BLOB_READ_WRITE_TOKEN

    if (!token) {
      console.error("BLOB_READ_WRITE_TOKEN is not set in environment")
      return NextResponse.json(
        {
          error: "Blob storage no configurado",
          details: "Contacta al administrador para configurar BLOB_READ_WRITE_TOKEN"
        },
        { status: 500 }
      )
    }

    // URL encode the filename for the path
    const encodedPath = filename.split('/').map(encodeURIComponent).join('/')

    // Use Authorization header instead of URL credentials
    const blobUrl = `https://blob.vercel-storage.com/${encodedPath}`

    console.log("Uploading to:", blobUrl)

    // Convert File to ArrayBuffer to avoid duplex issues
    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    const blobResponse = await fetch(blobUrl, {
      method: 'PUT',
      body: buffer,
      headers: {
        'authorization': `Bearer ${token}`,
        'x-api-version': '1',
        'Content-Type': file.type,
      },
    })

    console.log("Blob response status:", blobResponse.status)

    if (!blobResponse.ok) {
      const errorText = await blobResponse.text()
      console.error("Blob upload failed:", blobResponse.status, errorText)
      return NextResponse.json(
        {
          error: "Error al subir a Vercel Blob",
          details: `Status: ${blobResponse.status}, Error: ${errorText}`
        },
        { status: 500 }
      )
    }

    const blobData = await blobResponse.json()
    console.log("Upload successful:", blobData.url)

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

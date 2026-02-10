import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { writeFile, mkdir } from "fs/promises"
import { join } from "path"
import { existsSync } from "fs"

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
      "audio/ogg",
      "video/mp4",
      "video/webm",
      "video/quicktime",
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ]

    if (!allowedTypes.includes(file.type)) {

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

    // Generate unique filename (simplified, without slashes)
    const timestamp = Date.now()
    const originalName = file.name.replace(/[^a-zA-Z0-9.-]/g, "_")
    const filename = `${timestamp}-${originalName}`

    // Upload to Vercel Blob using REST API
    const token = process.env.BLOB_READ_WRITE_TOKEN
    const isDev = process.env.NODE_ENV === "development"

    if (!token) {
      // Fallback: Save locally in development
      if (isDev) {


        // Create uploads directory if it doesn't exist
        const uploadsDir = join(process.cwd(), "public", "uploads")
        if (!existsSync(uploadsDir)) {
          await mkdir(uploadsDir, { recursive: true })
        }

        // Convert File to Buffer and save locally
        const arrayBuffer = await file.arrayBuffer()
        const buffer = Buffer.from(arrayBuffer)
        const localPath = join(uploadsDir, filename)

        await writeFile(localPath, buffer)


        return NextResponse.json({
          success: true,
          file: {
            url: `/uploads/${filename}`,
            name: file.name,
            type: file.type,
            size: file.size,
            filename,
          },
        })
      }

      // In production without token, return error

      return NextResponse.json(
        {
          error: "Blob storage no configurado",
          details: "Contacta al administrador para configurar BLOB_READ_WRITE_TOKEN"
        },
        { status: 500 }
      )
    }

    // Use Authorization header instead of URL credentials
    const blobUrl = `https://blob.vercel-storage.com/${filename}`



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



    if (!blobResponse.ok) {
      const errorText = await blobResponse.text()

      return NextResponse.json(
        {
          error: "Error al subir a Vercel Blob",
          details: `Status: ${blobResponse.status}, Error: ${errorText}`
        },
        { status: 500 }
      )
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

    return NextResponse.json(
      { error: "Error al subir el archivo" },
      { status: 500 }
    )
  }
}

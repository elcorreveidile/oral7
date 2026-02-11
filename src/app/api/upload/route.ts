import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { writeFile, mkdir } from "fs/promises"
import { join } from "path"
import { existsSync } from "fs"
import { rateLimit, rateLimitResponse, addRateLimitHeaders, RateLimitConfig } from "@/lib/rate-limit-redis"
import {
  validateFileSignature,
  getMaxFileSize,
  getAllowedMimeTypes,
  generateSecureFilename,
  sanitizeError,
  formatFileSize,
  getFileCategory
} from "@/lib/file-validation"
import {
  FileInfectedError,
  FileScannerMisconfiguredError,
  FileScannerUnavailableError,
  scanFileForMalware,
} from "@/lib/file-scanning"

export async function POST(request: NextRequest) {
  let userId: string | undefined

  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json(
        { error: "No autorizado" },
        { status: 401 }
      )
    }

    // Apply rate limiting based on user ID
    userId = session.user.id
    const rateLimitResult = await rateLimit(`upload:${userId}`, RateLimitConfig.upload)

    if (!rateLimitResult.success) {
      return rateLimitResponse(rateLimitResult.resetTime)
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

    // Validate file type using allowed MIME types
    const allowedTypes = getAllowedMimeTypes()

    if (!allowedTypes.includes(file.type)) {
      console.warn(`[Security] File upload rejected: Invalid MIME type "${file.type}" by user ${userId}`)
      return NextResponse.json(
        { error: `Tipo de archivo no permitido` },
        { status: 400 }
      )
    }

    // Convert File to Buffer for signature validation
    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    // Validate file signature (magic numbers)
    if (!validateFileSignature(buffer, file.type)) {
      console.warn(`[Security] File upload rejected: Invalid signature for MIME type "${file.type}" by user ${userId}`)
      return NextResponse.json(
        { error: `El archivo no es válido o está corrupto` },
        { status: 400 }
      )
    }

    // Validate file size based on type
    const maxSize = getMaxFileSize(file.type)
    if (file.size > maxSize) {
      const maxSizeFormatted = formatFileSize(maxSize)
      const category = getFileCategory(file.type)
      console.warn(`[Security] File upload rejected: Size ${formatFileSize(file.size)} exceeds ${maxSizeFormatted} for ${category} by user ${userId}`)
      return NextResponse.json(
        { error: `El archivo es demasiado grande. Máximo permitido: ${maxSizeFormatted}` },
        { status: 400 }
      )
    }

    // Malware scanning (fail-closed in production).
    try {
      const scanResult = await scanFileForMalware(buffer)
      if (scanResult.status === "skipped" && process.env.NODE_ENV === "development") {
        console.warn(`[Security] File scan skipped in development: ${scanResult.reason}`)
      }
    } catch (scanError) {
      if (scanError instanceof FileInfectedError) {
        console.warn(
          `[Security] File upload rejected: Malware detected for user ${userId}${scanError.signature ? ` (${scanError.signature})` : ""}`
        )
        return NextResponse.json(
          { error: "El archivo fue rechazado por controles de seguridad." },
          { status: 400 }
        )
      }

      if (
        scanError instanceof FileScannerMisconfiguredError ||
        scanError instanceof FileScannerUnavailableError
      ) {
        console.error(`[Security] File scanning unavailable for user ${userId}: ${scanError.message}`)
        return NextResponse.json(
          {
            error: "El servicio de validacion de seguridad no esta disponible. Intenta nuevamente mas tarde.",
          },
          { status: 503 }
        )
      }

      throw scanError
    }

    // Generate secure filename using UUID
    const filename = generateSecureFilename(file.name, file.type)

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

        // Use the buffer we already created for validation
        const localPath = join(uploadsDir, filename)

        await writeFile(localPath, buffer)


        const response = NextResponse.json({
          success: true,
          file: {
            url: `/uploads/${filename}`,
            name: file.name,
            type: file.type,
            size: file.size,
            filename,
          },
        })

        return addRateLimitHeaders(
          response,
          RateLimitConfig.upload.limit,
          rateLimitResult.remaining,
          rateLimitResult.resetTime
        )
      }

      // In production without token, return error
      console.error(`[Configuration] BLOB_READ_WRITE_TOKEN not set in production`)

      return NextResponse.json(
        {
          error: "El servicio de almacenamiento no está configurado",
          details: "Contacta al administrador"
        },
        { status: 500 }
      )
    }

    // Use Authorization header instead of URL credentials
    const blobUrl = `https://blob.vercel-storage.com/${filename}`

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
      console.error(`[Blob Storage] Upload failed for user ${userId}:`, blobResponse.status, errorText)

      return NextResponse.json(
        {
          error: "Error al subir el archivo",
          details: "El servicio de almacenamiento no está disponible. Intente nuevamente."
        },
        { status: 500 }
      )
    }

    const blobData = await blobResponse.json()

    const response = NextResponse.json({
      success: true,
      file: {
        url: blobData.url,
        name: file.name,
        type: file.type,
        size: file.size,
        filename,
      },
    })

    return addRateLimitHeaders(
      response,
      RateLimitConfig.upload.limit,
      rateLimitResult.remaining,
      rateLimitResult.resetTime
    )
  } catch (error) {
    console.error(`[Upload Error] User ${userId || 'unknown'}:`, error)
    const sanitizedMessage = sanitizeError(error)

    return NextResponse.json(
      {
        error: "Error al procesar el archivo",
        details: sanitizedMessage
      },
      { status: 500 }
    )
  }
}

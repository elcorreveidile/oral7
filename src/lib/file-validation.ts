import { v4 as uuidv4 } from 'uuid'
import { Buffer } from 'node:buffer'

/**
 * File type definitions with magic number signatures and size limits
 */
export const FILE_TYPES = {
  // Images
  PNG: {
    mime: ['image/png'],
    signature: [0x89, 0x50, 0x4E, 0x47] as number[],
    maxSize: 5 * 1024 * 1024, // 5MB
    category: 'image'
  },
  JPEG: {
    mime: ['image/jpeg', 'image/jpg'],
    signature: [0xFF, 0xD8, 0xFF] as number[],
    maxSize: 5 * 1024 * 1024, // 5MB
    category: 'image'
  },

  // Audio
  MP3: {
    mime: ['audio/mp3', 'audio/mpeg'],
    signature: [
      [0x49, 0x44, 0x33], // ID3
      [0xFF, 0xFB],       // MPEG
      [0xFF, 0xFA],       // MPEG
      [0xFF, 0xF3],       // MPEG
      [0xFF, 0xF2],       // MPEG
    ] as number[][],
    maxSize: 25 * 1024 * 1024, // 25MB
    category: 'audio'
  },
  WAV: {
    mime: ['audio/wav', 'audio/wave'],
    signature: [0x52, 0x49, 0x46, 0x46] as number[], // RIFF
    maxSize: 25 * 1024 * 1024, // 25MB
    category: 'audio'
  },
  OGG: {
    mime: ['audio/ogg'],
    signature: [0x4F, 0x67, 0x67, 0x53] as number[], // OggS
    maxSize: 25 * 1024 * 1024, // 25MB
    category: 'audio'
  },
  WEBM_AUDIO: {
    mime: ['audio/webm'],
    signature: [0x1A, 0x45, 0xDF, 0xA3] as number[], // WebM
    maxSize: 25 * 1024 * 1024, // 25MB
    category: 'audio'
  },

  // Video
  MP4: {
    mime: ['video/mp4'],
    signature: [
      [0x00, 0x00, 0x00, 0x18, 0x66, 0x74, 0x79, 0x70], // ftyp
      [0x00, 0x00, 0x00, 0x20, 0x66, 0x74, 0x79, 0x70], // ftyp
      [0x00, 0x00, 0x00, 0x1C, 0x66, 0x74, 0x79, 0x70], // ftyp
    ] as number[][],
    maxSize: 100 * 1024 * 1024, // 100MB
    category: 'video'
  },
  WEBM_VIDEO: {
    mime: ['video/webm'],
    signature: [0x1A, 0x45, 0xDF, 0xA3] as number[], // WebM
    maxSize: 100 * 1024 * 1024, // 100MB
    category: 'video'
  },
  MOV: {
    mime: ['video/quicktime'],
    signature: [0x00, 0x00, 0x00, 0x14, 0x66, 0x74, 0x79, 0x70] as number[], // ftyp
    maxSize: 100 * 1024 * 1024, // 100MB
    category: 'video'
  },

  // Documents
  PDF: {
    mime: ['application/pdf'],
    signature: [0x25, 0x50, 0x44, 0x46] as number[], // %PDF
    maxSize: 10 * 1024 * 1024, // 10MB
    category: 'document'
  },
  DOC: {
    mime: ['application/msword'],
    signature: [0xD0, 0xCF, 0x11, 0xE0] as number[], // OLE
    maxSize: 10 * 1024 * 1024, // 10MB
    category: 'document'
  },
  DOCX: {
    mime: ['application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
    signature: [0x50, 0x4B, 0x03, 0x04] as number[], // ZIP (DOCX is a ZIP file)
    maxSize: 10 * 1024 * 1024, // 10MB
    category: 'document'
  },
} as const

/**
 * Get all allowed MIME types
 */
export function getAllowedMimeTypes(): string[] {
  const mimeTypes: string[] = []
  Object.values(FILE_TYPES).forEach(fileType => {
    fileType.mime.forEach(mime => mimeTypes.push(mime))
  })
  return mimeTypes
}

/**
 * Validate file signature (magic numbers)
 * @param buffer - File buffer
 * @param mimeType - Declared MIME type
 * @returns true if signature matches the declared type
 */
export function validateFileSignature(buffer: Buffer, mimeType: string): boolean {
  // Find the file type definition
  const fileType = Object.values(FILE_TYPES).find(type =>
    (type.mime as readonly string[]).includes(mimeType)
  )

  if (!fileType) {
    return false
  }

  // Get the signature(s) for this file type
  const signatures = fileType.signature

  // Check if any signature matches
  if (Array.isArray(signatures[0])) {
    // Multiple possible signatures
    return (signatures as number[][]).some(sig =>
      buffer.subarray(0, sig.length).equals(Buffer.from(sig))
    )
  } else {
    // Single signature
    return buffer.subarray(0, signatures.length).equals(Buffer.from(signatures as number[]))
  }
}

/**
 * Get file size limit for a given MIME type
 * @param mimeType - MIME type to check
 * @returns Maximum file size in bytes
 */
export function getMaxFileSize(mimeType: string): number {
  const fileType = Object.values(FILE_TYPES).find(type =>
    (type.mime as readonly string[]).includes(mimeType)
  )
  return fileType?.maxSize || 5 * 1024 * 1024 // Default 5MB
}

/**
 * Get file category for a given MIME type
 * @param mimeType - MIME type to check
 * @returns File category (image, audio, video, document)
 */
export function getFileCategory(mimeType: string): string {
  const fileType = Object.values(FILE_TYPES).find(type =>
    (type.mime as readonly string[]).includes(mimeType)
  )
  return fileType?.category || 'unknown'
}

/**
 * Generate a secure filename using UUID
 * @param originalName - Original filename
 * @param mimeType - File MIME type
 * @returns Secure filename with UUID
 */
export function generateSecureFilename(originalName: string, mimeType: string): string {
  // Get file extension from MIME type
  const extension = getExtensionFromMimeType(mimeType)

  // Generate UUID for uniqueness
  const uuid = uuidv4()

  // Return secure filename
  return `${uuid}${extension}`
}

/**
 * Get file extension from MIME type
 * @param mimeType - MIME type
 * @returns File extension with dot (e.g., '.pdf')
 */
function getExtensionFromMimeType(mimeType: string): string {
  const mimeToExt: Record<string, string> = {
    'image/png': '.png',
    'image/jpeg': '.jpg',
    'image/jpg': '.jpg',
    'audio/mp3': '.mp3',
    'audio/mpeg': '.mp3',
    'audio/wav': '.wav',
    'audio/wave': '.wav',
    'audio/ogg': '.ogg',
    'audio/webm': '.webm',
    'video/mp4': '.mp4',
    'video/webm': '.webm',
    'video/quicktime': '.mov',
    'application/pdf': '.pdf',
    'application/msword': '.doc',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document': '.docx',
  }

  return mimeToExt[mimeType] || ''
}

/**
 * Sanitize error messages to avoid exposing internal paths
 * @param error - Error object or message
 * @returns Sanitized error message
 */
export function sanitizeError(error: unknown): string {
  if (error instanceof Error) {
    // Remove file paths from error messages
    const sanitized = error.message
      .replace(/\/[a-zA-Z0-9_\-\.\/]+/g, '[path]')
      .replace(/[a-zA-Z]:\\[a-zA-Z0-9_\-\.\\]+/g, '[path]')

    return sanitized || 'Error al procesar el archivo'
  }

  if (typeof error === 'string') {
    return error.replace(/\/[a-zA-Z0-9_\-\.\/]+/g, '[path]')
  }

  return 'Error al procesar el archivo'
}

/**
 * Format file size for display
 * @param bytes - File size in bytes
 * @returns Formatted file size string
 */
export function formatFileSize(bytes: number): string {
  const units = ['B', 'KB', 'MB', 'GB']
  let size = bytes
  let unitIndex = 0

  while (size >= 1024 && unitIndex < units.length - 1) {
    size /= 1024
    unitIndex++
  }

  return `${Math.round(size * 10) / 10}${units[unitIndex]}`
}

import { existsSync } from "fs"
import { unlink } from "fs/promises"
import { resolve } from "path"

export interface StoredSubmissionFile {
  url?: string
  filename?: string
  name?: string
}

export interface FileDeletionFailure {
  fileLabel: string
  reason: string
}

export interface FileDeletionResult {
  deleted: number
  failed: number
  failures: FileDeletionFailure[]
}

const LOCAL_UPLOAD_ROOT = resolve(process.cwd(), "public", "uploads")

function safeFileLabel(file: StoredSubmissionFile): string {
  const raw = file.name || file.filename || file.url || "archivo"
  return String(raw).slice(0, 120)
}

function sanitizeFilename(filename: string | undefined): string | null {
  if (!filename) return null

  const candidate = filename
    .trim()
    .split("/")
    .pop()
    ?.split("?")[0]
    ?.split("#")[0]

  if (!candidate) return null
  if (candidate.includes("..")) return null
  if (!/^[a-zA-Z0-9._-]+$/.test(candidate)) return null

  return candidate
}

function extractFilenameFromUrl(url: string | undefined): string | null {
  if (!url) return null

  if (url.startsWith("/uploads/")) {
    return sanitizeFilename(url.replace("/uploads/", ""))
  }

  try {
    const parsed = new URL(url)
    return sanitizeFilename(decodeURIComponent(parsed.pathname.split("/").pop() || ""))
  } catch {
    return null
  }
}

function isLocalUploadUrl(url: string | undefined): boolean {
  return typeof url === "string" && url.startsWith("/uploads/")
}

function isBlobUrl(url: string | undefined): boolean {
  return typeof url === "string" && url.includes("vercel-storage.com")
}

async function deleteLocalFile(file: StoredSubmissionFile): Promise<{ ok: boolean; reason?: string }> {
  const filename = sanitizeFilename(file.filename) || extractFilenameFromUrl(file.url)
  if (!filename) {
    return { ok: false, reason: "nombre_invalido" }
  }

  const targetPath = resolve(LOCAL_UPLOAD_ROOT, filename)
  if (!targetPath.startsWith(`${LOCAL_UPLOAD_ROOT}/`) && targetPath !== LOCAL_UPLOAD_ROOT) {
    return { ok: false, reason: "ruta_invalida" }
  }

  if (!existsSync(targetPath)) {
    return { ok: true }
  }

  await unlink(targetPath)
  return { ok: true }
}

async function deleteBlobFile(file: StoredSubmissionFile): Promise<{ ok: boolean; reason?: string }> {
  const token = process.env.BLOB_READ_WRITE_TOKEN
  if (!token) {
    return { ok: false, reason: "blob_token_no_configurado" }
  }

  const filename = sanitizeFilename(file.filename) || extractFilenameFromUrl(file.url)
  if (!filename) {
    return { ok: false, reason: "nombre_blob_invalido" }
  }

  const filenameEndpoint = `https://blob.vercel-storage.com/${encodeURIComponent(filename)}`
  const headers = {
    authorization: `Bearer ${token}`,
    "x-api-version": "1",
  }

  try {
    const byFilename = await fetch(filenameEndpoint, {
      method: "DELETE",
      headers,
    })

    if (byFilename.ok || byFilename.status === 404) {
      return { ok: true }
    }
  } catch {
    // Intentamos fallback por URL directa cuando sea posible.
  }

  if (file.url && /^https?:\/\//.test(file.url)) {
    try {
      const byUrl = await fetch(file.url, {
        method: "DELETE",
        headers,
      })

      if (byUrl.ok || byUrl.status === 404) {
        return { ok: true }
      }
      return { ok: false, reason: `blob_delete_http_${byUrl.status}` }
    } catch {
      return { ok: false, reason: "blob_delete_error" }
    }
  }

  return { ok: false, reason: "blob_delete_error" }
}

export async function deleteSubmissionFiles(files: StoredSubmissionFile[]): Promise<FileDeletionResult> {
  const failures: FileDeletionFailure[] = []
  let deleted = 0

  for (const file of files) {
    const label = safeFileLabel(file)

    try {
      const deletionResult = isLocalUploadUrl(file.url)
        ? await deleteLocalFile(file)
        : isBlobUrl(file.url) || Boolean(file.filename)
        ? await deleteBlobFile(file)
        : { ok: false, reason: "url_no_soportada" }

      if (deletionResult.ok) {
        deleted += 1
      } else {
        failures.push({
          fileLabel: label,
          reason: deletionResult.reason || "error_desconocido",
        })
      }
    } catch {
      failures.push({
        fileLabel: label,
        reason: "error_desconocido",
      })
    }
  }

  return {
    deleted,
    failed: failures.length,
    failures,
  }
}

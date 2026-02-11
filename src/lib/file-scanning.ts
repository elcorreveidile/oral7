import { Socket } from "node:net"
import { Buffer } from "node:buffer"

const CLAMAV_DEFAULT_PORT = 3310
const CLAMAV_DEFAULT_TIMEOUT_MS = 10000
const CLAMAV_DEFAULT_MAX_SCAN_BYTES = 100 * 1024 * 1024 // 100MB
const CLAMAV_CHUNK_SIZE = 64 * 1024 // 64KB

type ScanResult =
  | { status: "clean"; engine: "clamav" }
  | { status: "skipped"; reason: string }

interface ScanConfig {
  enabled: boolean
  required: boolean
  host?: string
  port: number
  timeoutMs: number
  maxScanBytes: number
}

interface ClamavResponse {
  clean: boolean
  signature?: string
}

function parseBoolean(value: string | undefined, defaultValue: boolean): boolean {
  if (value === undefined) return defaultValue
  const normalized = value.trim().toLowerCase()
  return ["1", "true", "yes", "on"].includes(normalized)
}

function parsePositiveInteger(value: string | undefined, defaultValue: number): number {
  if (!value) return defaultValue
  const parsed = Number.parseInt(value, 10)
  if (!Number.isFinite(parsed) || parsed <= 0) {
    return defaultValue
  }
  return parsed
}

function getScanConfig(): ScanConfig {
  const isProduction = process.env.NODE_ENV === "production"
  const enabled = isProduction
    ? true
    : parseBoolean(process.env.FILE_SCANNING_ENABLED, false)

  const required = isProduction || parseBoolean(process.env.FILE_SCANNING_REQUIRED, false)

  return {
    enabled,
    required,
    host: process.env.CLAMAV_HOST,
    port: parsePositiveInteger(process.env.CLAMAV_PORT, CLAMAV_DEFAULT_PORT),
    timeoutMs: parsePositiveInteger(process.env.CLAMAV_TIMEOUT_MS, CLAMAV_DEFAULT_TIMEOUT_MS),
    maxScanBytes: parsePositiveInteger(
      process.env.CLAMAV_MAX_SCAN_BYTES,
      CLAMAV_DEFAULT_MAX_SCAN_BYTES
    ),
  }
}

function parseClamavResponse(rawResponse: string): ClamavResponse {
  const response = rawResponse.replace(/\0/g, "").trim()

  if (!response) {
    throw new FileScannerUnavailableError("Respuesta vacia de ClamAV")
  }

  if (response.includes("FOUND")) {
    const signature = response.match(/: (.+) FOUND/)?.[1]
    return {
      clean: false,
      signature,
    }
  }

  if (response.includes("OK")) {
    return { clean: true }
  }

  throw new FileScannerUnavailableError(`Respuesta inesperada de ClamAV: ${response}`)
}

async function scanWithClamAV(buffer: Buffer, config: ScanConfig): Promise<ClamavResponse> {
  return new Promise((resolve, reject) => {
    const socket = new Socket()
    let response = ""
    let settled = false

    const fail = (error: Error) => {
      if (settled) return
      settled = true
      socket.destroy()
      reject(error)
    }

    const succeed = (result: ClamavResponse) => {
      if (settled) return
      settled = true
      socket.destroy()
      resolve(result)
    }

    socket.setTimeout(config.timeoutMs)

    socket.on("timeout", () => {
      fail(new FileScannerUnavailableError("Timeout al conectar con ClamAV"))
    })

    socket.on("error", (error) => {
      fail(new FileScannerUnavailableError(`Error de conexion con ClamAV: ${error.message}`))
    })

    socket.on("data", (chunk) => {
      response += chunk.toString("utf8")
    })

    socket.on("close", () => {
      if (settled) return
      try {
        const parsed = parseClamavResponse(response)
        succeed(parsed)
      } catch (error) {
        fail(
          error instanceof Error
            ? error
            : new FileScannerUnavailableError("Error al procesar respuesta de ClamAV")
        )
      }
    })

    socket.connect(config.port, config.host as string, () => {
      try {
        // zINSTREAM uses null-terminated command + chunked binary stream.
        socket.write("zINSTREAM\0")

        let offset = 0
        while (offset < buffer.length) {
          const chunk = buffer.subarray(offset, offset + CLAMAV_CHUNK_SIZE)
          const sizeHeader = Buffer.alloc(4)
          sizeHeader.writeUInt32BE(chunk.length, 0)
          socket.write(sizeHeader)
          socket.write(chunk)
          offset += chunk.length
        }

        // Zero-length chunk marks end of stream.
        const endHeader = Buffer.alloc(4)
        endHeader.writeUInt32BE(0, 0)
        socket.write(endHeader)
        socket.end()
      } catch (error) {
        fail(
          error instanceof Error
            ? new FileScannerUnavailableError(error.message)
            : new FileScannerUnavailableError("Error enviando archivo a ClamAV")
        )
      }
    })
  })
}

export class FileScanningError extends Error {}

export class FileScannerMisconfiguredError extends FileScanningError {}

export class FileScannerUnavailableError extends FileScanningError {}

export class FileInfectedError extends FileScanningError {
  signature?: string

  constructor(signature?: string) {
    super("Archivo infectado detectado")
    this.signature = signature
  }
}

export async function scanFileForMalware(buffer: Buffer): Promise<ScanResult> {
  const config = getScanConfig()

  if (!config.enabled) {
    if (config.required) {
      throw new FileScannerMisconfiguredError(
        "Escaneo de malware requerido pero deshabilitado"
      )
    }
    return {
      status: "skipped",
      reason: "disabled",
    }
  }

  if (!config.host) {
    if (config.required) {
      throw new FileScannerMisconfiguredError("CLAMAV_HOST no configurado")
    }
    return {
      status: "skipped",
      reason: "missing_clamav_host",
    }
  }

  if (buffer.length > config.maxScanBytes) {
    throw new FileScannerUnavailableError(
      `Archivo excede el maximo escaneable (${config.maxScanBytes} bytes)`
    )
  }

  try {
    const result = await scanWithClamAV(buffer, config)
    if (!result.clean) {
      throw new FileInfectedError(result.signature)
    }
    return {
      status: "clean",
      engine: "clamav",
    }
  } catch (error) {
    if (error instanceof FileInfectedError) {
      throw error
    }
    if (config.required) {
      throw error instanceof FileScanningError
        ? error
        : new FileScannerUnavailableError("Escaneo de malware no disponible")
    }
    return {
      status: "skipped",
      reason: "scanner_unavailable",
    }
  }
}

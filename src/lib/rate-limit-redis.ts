/**
 * Rate Limiting con Redis para Producción
 * Compatible con Railway Redis, Upstash Redis, o cualquier Redis estándar
 */

import { NextResponse } from 'next/server'

// Cliente Redis (lazy load)
let redisClient: any = null

const DEFAULT_CONNECT_TIMEOUT_MS = 2000
const DEFAULT_COMMAND_TIMEOUT_MS = 1000
const DEFAULT_MAX_RETRIES = 1
const DEFAULT_OPERATION_TIMEOUT_MS = 1500

function parsePositiveInt(value: string | undefined, fallback: number): number {
  if (!value) return fallback
  const parsed = Number.parseInt(value, 10)
  if (!Number.isFinite(parsed) || parsed <= 0) return fallback
  return parsed
}

function getConnectTimeoutMs(): number {
  return parsePositiveInt(process.env.RATE_LIMIT_REDIS_CONNECT_TIMEOUT_MS, DEFAULT_CONNECT_TIMEOUT_MS)
}

function getCommandTimeoutMs(): number {
  return parsePositiveInt(process.env.RATE_LIMIT_REDIS_COMMAND_TIMEOUT_MS, DEFAULT_COMMAND_TIMEOUT_MS)
}

function getMaxRetriesPerRequest(): number {
  return parsePositiveInt(process.env.RATE_LIMIT_REDIS_MAX_RETRIES, DEFAULT_MAX_RETRIES)
}

function getDefaultOperationTimeoutMs(): number {
  return parsePositiveInt(process.env.RATE_LIMIT_OPERATION_TIMEOUT_MS, DEFAULT_OPERATION_TIMEOUT_MS)
}

class RateLimitTimeoutError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'RateLimitTimeoutError'
  }
}

async function withTimeout<T>(operation: Promise<T>, timeoutMs: number): Promise<T> {
  if (timeoutMs <= 0) {
    return operation
  }

  let timeoutHandle: ReturnType<typeof setTimeout> | null = null

  try {
    return await Promise.race([
      operation,
      new Promise<T>((_, reject) => {
        timeoutHandle = setTimeout(() => {
          reject(new RateLimitTimeoutError(`[RateLimit] Timeout after ${timeoutMs}ms`))
        }, timeoutMs)
      }),
    ])
  } finally {
    if (timeoutHandle) {
      clearTimeout(timeoutHandle)
    }
  }
}

/**
 * Inicializar cliente Redis
 * Usa ioredis que es compatible con Railway, Upstash, y Redis estándar
 */
async function getRedisClient() {
  if (redisClient) return redisClient

  // Verificar si tenemos REDIS_URL configurado
  const redisUrl = process.env.REDIS_URL

  if (!redisUrl) {
    console.warn('[RateLimit] REDIS_URL no configurado. Rate limiting deshabilitado.')
    return null
  }

  try {
    // Import dinámico para evitar problemas en entornos sin Redis
    const Redis = (await import('ioredis')).default

    // Detectar automáticamente si usar TLS basándose en el protocolo de la URL
    // rediss:// = TLS habilitado, redis:// = sin TLS
    const tlsEnabled = redisUrl.startsWith('rediss://')
    const connectTimeout = getConnectTimeoutMs()
    const commandTimeout = getCommandTimeoutMs()
    const maxRetries = getMaxRetriesPerRequest()

    console.log('[RateLimit] Iniciando conexión Redis...', {
      protocol: tlsEnabled ? 'rediss (TLS)' : 'redis',
      host: redisUrl.split('@')[1]?.split(':')[0] || 'N/A',
      connectTimeout,
      commandTimeout,
      maxRetries,
    })

    redisClient = new Redis(redisUrl, {
      // Fail-fast para evitar que auth quede "pensando" por infraestructura Redis.
      maxRetriesPerRequest: maxRetries,
      retryStrategy: (times: number) => {
        if (times > maxRetries) {
          console.error('[RateLimit] Máximo de reintentos alcanzado')
          return null
        }
        console.log(`[RateLimit] Reintentando conexión (intento ${times}/${maxRetries})`)
        return Math.min(times * 100, 500)
      },
      tls: tlsEnabled ? {
        rejectUnauthorized: false, // Permitir certificados de Railway
        checkServerIdentity: () => undefined, // Saltar verificación estricta para Railway proxy
      } : undefined,
      connectTimeout,
      commandTimeout,
      lazyConnect: true, // Conectar solo cuando sea necesario
      keepAlive: 5000, // Mantener conexión viva
      enableReadyCheck: false, // Deshabilitar ready check para serverless
      enableOfflineQueue: false, // Fail-fast: no encolar cuando Redis no está listo
    })

    redisClient.on('error', (err: Error) => {
      console.error('[RateLimit] Error de Redis:', err.message)
    })

    redisClient.on('connect', () => {
      console.log('[RateLimit] Redis conectado exitosamente', tlsEnabled ? '(TLS habilitado)' : '(sin TLS)')
    })

    redisClient.on('ready', () => {
      console.log('[RateLimit] Redis listo para operaciones')
    })

    return redisClient
  } catch (error) {
    console.error('[RateLimit] Error al conectar con Redis:', error)
    return null
  }
}

export interface RateLimitConfig {
  /** Maximum number of requests allowed */
  limit: number
  /** Time window in seconds */
  window: number
}

export interface RateLimitOptions {
  /** Policy when Redis is unavailable/errors/timeouts */
  onRedisError?: 'fail-open' | 'fail-closed'
  /** Timeout for each Redis operation in milliseconds */
  timeoutMs?: number
}

export interface RateLimitResult {
  success: boolean
  remaining: number
  resetTime: number
  degraded?: boolean
  reason?: 'redis_unavailable' | 'redis_error' | 'redis_timeout'
}

function fallbackResult(
  config: RateLimitConfig,
  onRedisError: 'fail-open' | 'fail-closed',
  reason: RateLimitResult['reason']
): RateLimitResult {
  if (onRedisError === 'fail-open') {
    return {
      success: true,
      remaining: config.limit,
      resetTime: Date.now() + config.window * 1000,
      degraded: true,
      reason,
    }
  }

  return {
    success: false,
    remaining: 0,
    resetTime: Date.now() + 60 * 1000,
    degraded: true,
    reason,
  }
}

/**
 * Rate limiter con Redis
 * @param identifier Unique identifier (user ID, IP address, etc.)
 * @param config Rate limit configuration
 * @param options Additional control for resilience/behavior on Redis failures
 * @returns Object with success status and rate limit info
 */
export async function rateLimit(
  identifier: string,
  config: RateLimitConfig,
  options: RateLimitOptions = {}
): Promise<RateLimitResult> {
  const onRedisError = options.onRedisError ?? 'fail-closed'
  const operationTimeoutMs = options.timeoutMs ?? getDefaultOperationTimeoutMs()
  const redis = await getRedisClient()

  // Por defecto fail-closed para rutas sensibles; login puede pedir fail-open controlado.
  if (!redis) {
    return fallbackResult(config, onRedisError, 'redis_unavailable')
  }

  try {
    const key = `ratelimit:${identifier}:${config.window}`

    // INCR + EXPIRE (fixed-window) evita off-by-one y es atómico en Redis.
    const currentCountRaw = await withTimeout<number>(Promise.resolve(redis.incr(key)), operationTimeoutMs)
    const currentCount = Number(currentCountRaw)
    if (currentCount === 1) {
      await withTimeout<number>(Promise.resolve(redis.expire(key, config.window)), operationTimeoutMs)
    }

    const ttlRaw = await withTimeout<number>(Promise.resolve(redis.ttl(key)), operationTimeoutMs)
    const ttl = Number(ttlRaw)
    const ttlSeconds = ttl > 0 ? ttl : config.window
    const resetTime = Date.now() + ttlSeconds * 1000

    if (currentCount > config.limit) {
      return {
        success: false,
        remaining: 0,
        resetTime,
      }
    }

    return {
      success: true,
      remaining: Math.max(0, config.limit - currentCount),
      resetTime,
    }
  } catch (error) {
    if (error instanceof RateLimitTimeoutError) {
      console.error('[RateLimit] Timeout:', error.message)
      return fallbackResult(config, onRedisError, 'redis_timeout')
    }
    console.error('[RateLimit] Error:', error)
    return fallbackResult(config, onRedisError, 'redis_error')
  }
}

/**
 * Get client IP address from request
 */
export function getClientIp(request: Request): string {
  // Priorizar cabeceras gestionadas por plataformas/proxies conocidos.
  const vercelForwardedFor = request.headers.get('x-vercel-forwarded-for')
  const cfConnectingIp = request.headers.get('cf-connecting-ip')
  const realIp = request.headers.get('x-real-ip')
  const forwarded = request.headers.get('x-forwarded-for')

  const candidate =
    vercelForwardedFor ||
    cfConnectingIp ||
    realIp ||
    (forwarded ? forwarded.split(',')[0].trim() : null)

  if (candidate) {
    return candidate
  }

  // Fallback to a generic identifier
  return 'unknown'
}

/**
 * Create a rate-limited response
 */
export function rateLimitResponse(resetTime: number): NextResponse {
  const retryAfter = Math.ceil((resetTime - Date.now()) / 1000)
  return NextResponse.json(
    {
      error: 'Too many requests',
      message: 'Has excedido el límite de solicitudes. Por favor, espera un momento antes de intentar de nuevo.',
      retryAfter,
    },
    {
      status: 429,
      headers: {
        'Retry-After': String(retryAfter),
        'X-RateLimit-Limit': '1',
        'X-RateLimit-Remaining': '0',
        'X-RateLimit-Reset': new Date(resetTime).toISOString(),
      },
    }
  )
}

/**
 * Add rate limit headers to a successful response
 */
export function addRateLimitHeaders(
  response: NextResponse,
  limit: number,
  remaining: number,
  resetTime: number
): NextResponse {
  response.headers.set('X-RateLimit-Limit', String(limit))
  response.headers.set('X-RateLimit-Remaining', String(remaining))
  response.headers.set('X-RateLimit-Reset', new Date(resetTime).toISOString())
  return response
}

// Predefined rate limit configurations for common use cases
export const RateLimitConfig = {
  // Strict limits for auth/registration
  auth: { limit: 3, window: 3600 }, // 3 requests per hour

  // Moderate limits for file uploads
  upload: { limit: 10, window: 60 }, // 10 uploads per minute

  // Lenient limits for regular operations
  standard: { limit: 60, window: 60 }, // 60 requests per minute

  // Contact form to prevent spam
  contact: { limit: 3, window: 3600 }, // 3 messages per hour

  // QR code generation
  qr: { limit: 20, window: 60 }, // 20 per minute

  // Task submissions
  submission: { limit: 10, window: 60 }, // 10 per minute

  // Attendance marking
  attendance: { limit: 1, window: 60 }, // 1 per minute per session
} as const

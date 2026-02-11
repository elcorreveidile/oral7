/**
 * Rate Limiting con Redis para Producción
 * Compatible con Railway Redis, Upstash Redis, o cualquier Redis estándar
 */

import { NextResponse } from 'next/server'

// Cliente Redis (lazy load)
let redisClient: any = null

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

    redisClient = new Redis(redisUrl, {
      maxRetriesPerRequest: 3,
      retryStrategy: (times: number) => {
        if (times > 3) return null
        return Math.min(times * 100, 1000)
      },
    })

    redisClient.on('error', (err: Error) => {
      console.error('[RateLimit] Error de Redis:', err.message)
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

/**
 * Rate limiter con Redis
 * @param identifier Unique identifier (user ID, IP address, etc.)
 * @param config Rate limit configuration
 * @returns Object with success status and rate limit info
 */
export async function rateLimit(
  identifier: string,
  config: RateLimitConfig
): Promise<{ success: boolean; remaining: number; resetTime: number }> {
  const redis = await getRedisClient()

  // Fail-closed: si no hay Redis, bloquear para no desactivar la protección
  if (!redis) {
    return {
      success: false,
      remaining: 0,
      resetTime: Date.now() + 60 * 1000,
    }
  }

  try {
    const key = `ratelimit:${identifier}:${config.window}`

    // INCR + EXPIRE (fixed-window) evita off-by-one y es atómico en Redis.
    const currentCount = await redis.incr(key)
    if (currentCount === 1) {
      await redis.expire(key, config.window)
    }

    const ttl = await redis.ttl(key)
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
    console.error('[RateLimit] Error:', error)
    // Fail-closed: ante error de Redis, bloquear.
    return {
      success: false,
      remaining: 0,
      resetTime: Date.now() + 60 * 1000,
    }
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

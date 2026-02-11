import { NextResponse } from 'next/server'

// Simple in-memory rate limiter
// For production, consider using Upstash Redis or similar distributed cache
interface RateLimitEntry {
  count: number
  resetTime: number
}

const rateLimitStore = new Map<string, RateLimitEntry>()

// Clean up expired entries every 5 minutes
setInterval(() => {
  const now = Date.now()
  const keysToDelete: string[] = []
  rateLimitStore.forEach((entry, key) => {
    if (now > entry.resetTime) {
      keysToDelete.push(key)
    }
  })
  keysToDelete.forEach((key) => rateLimitStore.delete(key))
}, 5 * 60 * 1000)

export interface RateLimitConfig {
  /** Maximum number of requests allowed */
  limit: number
  /** Time window in seconds */
  window: number
}

/**
 * Rate limiter middleware
 * @param identifier Unique identifier (user ID, IP address, etc.)
 * @param config Rate limit configuration
 * @returns Object with success status and rate limit info
 */
export function rateLimit(
  identifier: string,
  config: RateLimitConfig
): { success: boolean; remaining: number; resetTime: number } {
  const now = Date.now()
  const windowMs = config.window * 1000
  const key = `${identifier}:${config.window}`

  const entry = rateLimitStore.get(key)

  // Reset window if expired
  if (!entry || now > entry.resetTime) {
    rateLimitStore.set(key, {
      count: 1,
      resetTime: now + windowMs,
    })
    return {
      success: true,
      remaining: config.limit - 1,
      resetTime: now + windowMs,
    }
  }

  // Increment counter
  if (entry.count >= config.limit) {
    return {
      success: false,
      remaining: 0,
      resetTime: entry.resetTime,
    }
  }

  entry.count++
  return {
    success: true,
    remaining: config.limit - entry.count,
    resetTime: entry.resetTime,
  }
}

/**
 * Get client IP address from request
 */
export function getClientIp(request: Request): string {
  // Check various headers for IP
  const forwarded = request.headers.get('x-forwarded-for')
  const realIp = request.headers.get('x-real-ip')
  const cfConnectingIp = request.headers.get('cf-connecting-ip')

  if (forwarded) {
    return forwarded.split(',')[0].trim()
  }
  if (realIp) {
    return realIp
  }
  if (cfConnectingIp) {
    return cfConnectingIp
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

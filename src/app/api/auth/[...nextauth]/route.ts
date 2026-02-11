import NextAuth from "next-auth"
import { authOptions } from "@/lib/auth"
import { NextRequest } from "next/server"
import {
  RateLimitConfig,
  addRateLimitHeaders,
  getClientIp,
  rateLimit,
  rateLimitResponse,
} from "@/lib/rate-limit-redis"

function parseEnvBoolean(value: string | undefined, defaultValue = false): boolean {
  if (value === undefined) return defaultValue
  const normalized = value.trim().toLowerCase()
  return normalized === "1" || normalized === "true" || normalized === "yes" || normalized === "on"
}

function isAuthLoginRateLimitEnabled(): boolean {
  return parseEnvBoolean(process.env.AUTH_LOGIN_RATE_LIMIT_ENABLED, false)
}

// Dynamic handler that detects the current host from request headers
async function handler(req: NextRequest, context: any) {
  // Get the host from request headers
  const host = req.headers.get('host') || req.headers.get('x-forwarded-host') || 'localhost:3000'
  const protocol = req.headers.get('x-forwarded-proto') || 'https'
  const currentUrl = `${protocol}://${host}`

  // Only log in development to avoid exposing infrastructure details in production
  if (process.env.NODE_ENV === 'development') {
    console.log('[NextAuth Handler] Setting NEXTAUTH_URL dynamically')
  }

  // Set NEXTAUTH_URL dynamically for this request
  process.env.NEXTAUTH_URL = currentUrl

  // Create NextAuth handler with updated options
  const nextAuthHandler = NextAuth(authOptions)

  // @ts-ignore - NextAuth types are complex
  return nextAuthHandler(req, context)
}

export { handler as GET }

export async function POST(req: NextRequest, context: any) {
  // Gradual rollout via feature flag.
  // Only the credentials callback is rate limited.
  if (
    isAuthLoginRateLimitEnabled() &&
    req.nextUrl.pathname.endsWith("/callback/credentials")
  ) {
    const ip = getClientIp(req)
    const limiter = await rateLimit(`login:${ip}`, RateLimitConfig.auth)

    if (!limiter.success) {
      return rateLimitResponse(limiter.resetTime)
    }

    const response = await handler(req, context)
    return addRateLimitHeaders(
      response,
      RateLimitConfig.auth.limit,
      limiter.remaining,
      limiter.resetTime
    )
  }

  return handler(req, context)
}

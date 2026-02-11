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

type LoginRateLimitMode = "off" | "monitor" | "enforce"

function parsePositiveInt(value: string | undefined, defaultValue: number): number {
  if (!value) return defaultValue
  const parsed = Number.parseInt(value, 10)
  if (!Number.isFinite(parsed) || parsed <= 0) return defaultValue
  return parsed
}

function getLoginRateLimitMode(): LoginRateLimitMode {
  const rawMode = process.env.AUTH_LOGIN_RATE_LIMIT_MODE?.trim().toLowerCase()

  if (rawMode) {
    if (rawMode === "off" || rawMode === "disabled" || rawMode === "false" || rawMode === "0") {
      return "off"
    }
    if (rawMode === "monitor" || rawMode === "shadow" || rawMode === "dry-run") {
      return "monitor"
    }
    if (rawMode === "enforce" || rawMode === "on" || rawMode === "true" || rawMode === "1") {
      return "enforce"
    }
  }

  // Backward compatibility with existing flag.
  return parseEnvBoolean(process.env.AUTH_LOGIN_RATE_LIMIT_ENABLED, false)
    ? "enforce"
    : "off"
}

function getLoginRateLimitTimeoutMs(): number {
  return parsePositiveInt(process.env.AUTH_LOGIN_RATE_LIMIT_TIMEOUT_MS, 500)
}

function logRateLimitMetric(event: string, metadata: Record<string, unknown>) {
  console.log(
    `[SecurityMetric] ${JSON.stringify({
      event,
      scope: "auth-login-rate-limit",
      timestamp: new Date().toISOString(),
      ...metadata,
    })}`
  )
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
  const mode = getLoginRateLimitMode()

  // Only the credentials callback is rate limited.
  if (
    mode !== "off" &&
    req.nextUrl.pathname.endsWith("/callback/credentials")
  ) {
    const ip = getClientIp(req)
    const limiter = await rateLimit(
      `login:${ip}`,
      RateLimitConfig.auth,
      {
        onRedisError: "fail-open",
        timeoutMs: getLoginRateLimitTimeoutMs(),
      }
    )

    if (!limiter.success) {
      if (mode === "enforce") {
        logRateLimitMetric("blocked", {
          mode,
          degraded: limiter.degraded ?? false,
          reason: limiter.reason ?? "rate_limit_exceeded",
        })
        const response = rateLimitResponse(limiter.resetTime)
        response.headers.set("X-Auth-RateLimit-Mode", mode)
        response.headers.set("X-Auth-RateLimit-State", "blocked")
        return response
      }

      logRateLimitMetric("would_block_monitor", {
        mode,
        degraded: limiter.degraded ?? false,
        reason: limiter.reason ?? "rate_limit_exceeded",
      })
    }

    const response = await handler(req, context)
    const responseWithHeaders = addRateLimitHeaders(
      response,
      RateLimitConfig.auth.limit,
      limiter.remaining,
      limiter.resetTime
    )

    if (limiter.degraded) {
      logRateLimitMetric("degraded_fail_open", {
        mode,
        reason: limiter.reason ?? "redis_unavailable",
      })
    }

    responseWithHeaders.headers.set("X-Auth-RateLimit-Mode", mode)
    responseWithHeaders.headers.set(
      "X-Auth-RateLimit-State",
      limiter.degraded ? "degraded-fail-open" : limiter.success ? "allowed" : "monitor-allow"
    )
    return responseWithHeaders
  }

  return handler(req, context)
}

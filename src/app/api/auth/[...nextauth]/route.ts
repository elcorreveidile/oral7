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
  // Protege específicamente el callback de credenciales (login).
  if (req.nextUrl.pathname.endsWith("/callback/credentials")) {
    const ip = getClientIp(req)
    const rateLimitResult = await rateLimit(`login:${ip}`, RateLimitConfig.auth)

    if (!rateLimitResult.success) {
      return rateLimitResponse(rateLimitResult.resetTime)
    }

    const response = await handler(req, context)
    return addRateLimitHeaders(
      response,
      RateLimitConfig.auth.limit,
      rateLimitResult.remaining,
      rateLimitResult.resetTime
    )
  }

  return handler(req, context)
}

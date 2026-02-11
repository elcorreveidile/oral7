import NextAuth from "next-auth"
import { authOptions } from "@/lib/auth"
import { NextRequest } from "next/server"

// Dynamic handler that detects the current host from request headers
async function handler(req: NextRequest, context: any) {
  // Get the host from request headers
  const host = req.headers.get('host') || req.headers.get('x-forwarded-host') || 'localhost:3000'
  const protocol = req.headers.get('x-forwarded-proto') || 'https'
  const currentUrl = `${protocol}://${host}`

  // Log for debugging
  console.log('[NextAuth Handler] Detected host:', host)
  console.log('[NextAuth Handler] Protocol:', protocol)
  console.log('[NextAuth Handler] Setting NEXTAUTH_URL to:', currentUrl)

  // Set NEXTAUTH_URL dynamically for this request
  process.env.NEXTAUTH_URL = currentUrl

  // Create NextAuth handler with updated options
  const nextAuthHandler = NextAuth(authOptions)

  // @ts-ignore - NextAuth types are complex
  return nextAuthHandler(req, context)
}

export { handler as GET, handler as POST }

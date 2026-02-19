import { withAuth } from "next-auth/middleware"
import { NextResponse } from "next/server"

/**
 * Admin Authentication Middleware
 *
 * This middleware protects admin routes by:
 * - Verifying user is authenticated
 * - Checking user has ADMIN role
 * - Redirecting unauthorized users appropriately
 *
 * This works alongside the main security middleware (middleware.ts)
 * but focuses specifically on authorization for admin routes.
 *
 * To enable this middleware:
 * 1. Rename this file from middleware-auth.ts to middleware-admin.ts
 * 2. OR integrate this logic into your existing middleware.ts
 * 3. Make sure NextAuth is properly configured
 */
export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token
    const pathname = req.nextUrl.pathname

    // Check if user is accessing admin routes
    if (pathname.startsWith("/admin")) {
      // Verify user has admin role
      if (token?.role !== "ADMIN") {
        // Redirect non-admin authenticated users to dashboard
        // Unauthenticated users will be handled by NextAuth's authorized callback
        return NextResponse.redirect(new URL("/dashboard", req.url))
      }
    }

    return NextResponse.next()
  },
  {
    callbacks: {
      // Only run middleware for authenticated users
      // Unauthenticated users will be redirected to login by NextAuth
      authorized: ({ token }) => {
        return !!token
      },
    },
    pages: {
      signIn: "/login",
    },
  }
)

// Configure which routes the middleware should run on
export const config = {
  matcher: [
    /*
     * Match all admin routes:
     * - /admin
     * - /admin/estudiantes
     * - /admin/sesiones
     * - etc.
     */
    "/admin/:path*",
  ],
}

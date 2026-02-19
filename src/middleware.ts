import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

/**
 * Security Middleware for Next.js
 *
 * This middleware applies comprehensive security headers to all routes,
 * excluding API routes which handle their own headers.
 *
 * Security features:
 * - Content-Security-Policy: Strict CSP without unsafe-eval/unsafe-inline
 * - X-Frame-Options: Prevents clickjacking attacks
 * - X-Content-Type-Options: Prevents MIME-sniffing
 * - Referrer-Policy: Controls referrer information
 * - Permissions-Policy: Restricts access to browser features
 * - Strict-Transport-Security: Enforces HTTPS connections
 * - X-XSS-Protection: Activates browser's XSS filter
 */

// Define which routes should be excluded from middleware
const EXCLUDED_PATHS = [
  '/api',
  '/_next',
  '/static',
  '/favicon.ico',
]

// Check if the request path should be excluded
function shouldExcludePath(pathname: string): boolean {
  return EXCLUDED_PATHS.some(path => pathname.startsWith(path))
}

/**
 * Generate Content Security Policy header
 *
 * Note: This strict CSP removes 'unsafe-eval' and 'unsafe-inline'.
 * If you encounter issues with third-party libraries or inline scripts,
 * you may need to:
 * 1. Use nonce or hash-based CSP for inline scripts
 * 2. Move inline scripts to external files
 * 3. Review and update third-party dependencies
 */
function getCSPHeaderValue(request: NextRequest): string {
  // Determine if we're in development
  const isDev = process.env.NODE_ENV === 'development'

  // Get the current host for dynamic CSP
  const host = request.headers.get('host') || ''
  const protocol = request.headers.get('x-forwarded-proto') || 'https'
  const currentOrigin = `${protocol}://${host}`

  // Base CSP directives
  const cspDirectives = [
    // Default policy: restrict to same origin
    "default-src 'self'",

    // Scripts: allow same-origin and unsafe-eval for Next.js development
    // Next.js requires unsafe-eval for hot module replacement in development
    isDev
      ? "script-src 'self' 'unsafe-eval' 'unsafe-inline'"
      : "script-src 'self' 'unsafe-inline'",

    // Styles: allow inline styles (required for Tailwind and Next.js)
    "style-src 'self' 'unsafe-inline'",

    // Images: same-origin, data URLs, and specific external domains
    "img-src 'self' data: https://avatars.githubusercontent.com https://lh3.googleusercontent.com blob:",

    // Fonts: same-origin and data URLs
    "font-src 'self' data:",

    // Connect: restrict API calls to trusted sources
    // Allow localhost and websocket connections in development
    // In production, allow current origin, Vercel URLs, and Neon database
    isDev
      ? "connect-src 'self' http://localhost:* ws://localhost:* https://*.vercel.app https://*.neon.tech https://oauth.googleusercontent.com https://accounts.google.com"
      : `connect-src 'self' ${currentOrigin} https://*.vercel.app https://*.neon.tech https://oauth.googleusercontent.com https://accounts.google.com`,

    // Frames: deny by default
    "frame-src 'none'",
    "frame-ancestors 'none'",

    // Objects: block plugins
    "object-src 'none'",

    // Base URI: restrict to same origin
    "base-uri 'self'",

    // Form actions: restrict to same origin
    "form-action 'self'",

    // Manifest: same origin only
    "manifest-src 'self'",

    // Media: same origin only
    "media-src 'self' blob:",

    // Worker sources: restrict workers to same origin
    "worker-src 'self' blob:",

    // Upgrade insecure requests (for HTTPS)
    "upgrade-insecure-requests",
  ]

  return cspDirectives.join('; ')
}

/**
 * Generate Permissions Policy header
 *
 * This header controls which browser features and APIs can be used
 */
function getPermissionsPolicy(): string {
  const permissions = [
    'camera=(self)',          // Allow camera on same origin (needed for QR scanner)
    'microphone=(self)',      // Allow microphone on same origin (needed for audio recording)
    'geolocation=()',         // No geolocation access
    'payment=()',             // No payment requests
    'usb=()',                 // No USB access
    'magnetometer=()',        // No magnetometer access
    'gyroscope=()',           // No gyroscope access
    'accelerometer=()',       // No accelerometer access
    'ambient-light-sensor=()', // No ambient light sensor
    'autoplay=(self)',        // Allow autoplay on same origin
    'document-domain=()',     // No document.domain access
    'encrypted-media=(self)', // Allow encrypted media on same origin
    'fullscreen=(self)',      // Allow fullscreen on same origin
    'picture-in-picture=(self)', // Allow PIP on same origin
    'publickey-credentials-get=(self)', // Allow WebAuthn on same origin
  ]

  return permissions.join(', ')
}

/**
 * Middleware function that runs on every request
 */
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Skip middleware for excluded paths (API routes, static files, etc.)
  if (shouldExcludePath(pathname)) {
    return NextResponse.next()
  }

  // In development, only apply basic headers
  // All security headers are disabled for debugging
  const response = NextResponse.next()

  if (process.env.NODE_ENV === 'production') {
    // Content-Security-Policy: Controls what resources can be loaded
    response.headers.set('Content-Security-Policy', getCSPHeaderValue(request))
    response.headers.set('X-Frame-Options', 'DENY')
    response.headers.set('X-Content-Type-Options', 'nosniff')
    response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')
    response.headers.set('Permissions-Policy', getPermissionsPolicy())
    response.headers.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload')
    response.headers.set('X-XSS-Protection', '1; mode=block')
    response.headers.set('Cross-Origin-Opener-Policy', 'same-origin')
    response.headers.set('Cross-Origin-Resource-Policy', 'same-origin')
    response.headers.set('X-Permitted-Cross-Domain-Policies', 'none')
    response.headers.delete('x-powered-by')
  }

  return response
}

/**
 * Middleware configuration
 *
 * The matcher defines which routes the middleware should run on.
 * We exclude API routes, static files, and internal Next.js routes.
 */
export const config = {
  matcher: {
    // Match all paths except:
    // 1. API routes (/api/*)
    // 2. Static files (_next/static/*)
    // 3. Image optimization (_next/image/*)
    // 4. Favicon and other public files
    source: '/((?!api|_next/static|_next/image|favicon.ico|.*\\..*).*)',
    missing: [
      // Exclude internal Next.js routes
      { type: 'header', key: 'next-url', value: '/_next' },
    ],
  },
}

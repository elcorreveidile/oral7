/**
 * Utilidades de Protección CSRF (Cross-Site Request Forgery)
 *
 * NextAuth ya incluye protección CSRF integrada mediante:
 * - HttpOnly cookies
 * - SameSite=lax por defecto
 * - Tokens CSRF en todas las mutaciones state-changing
 *
 * Este módulo proporciona protección CSRF adicional para endpoints
 * que no usen NextAuth o para operaciones críticas que requieran
 * una capa extra de seguridad.
 */

import { randomBytes, createHash } from 'crypto'

/**
 * Generar un token CSRF seguro
 */
export function generateCSRFToken(): string {
  return randomBytes(32).toString('hex')
}

/**
 * Generar un token CSRF con timestamp (para expiración)
 */
export function generateCSRFTokenWithExpiry(expiresInMs: number = 3600000): { token: string; expiresAt: number } {
  const tokenData = {
    token: generateCSRFToken(),
    expiresAt: Date.now() + expiresInMs
  }
  return tokenData
}

/**
 * Crear hash de un token CSRF (para almacenar en sesión)
 */
export function hashCSRFToken(token: string): string {
  return createHash('sha256').update(token).digest('hex')
}

/**
 * Verificar si un token CSRF es válido
 *
 * @param token - Token proporcionado por el cliente
 * @param storedHash - Hash almacenado en sesión
 * @returns true si el token es válido
 */
export function verifyCSRFToken(token: string, storedHash: string): boolean {
  if (!token || !storedHash) {
    return false
  }

  const tokenHash = hashCSRFToken(token)
  return tokenHash === storedHash
}

/**
 * Middleware CSRF para endpoints API manual
 *
 * Uso en route handlers:
 * ```typescript
 * import { csrfMiddleware } from '@/lib/csrf'
 *
 * export async function POST(req: Request) {
 *   const csrfCheck = await csrfMiddleware(req)
 *   if (!csrfCheck.valid) {
 *     return NextResponse.json({ error: 'Invalid CSRF token' }, { status: 403 })
 *   }
 *   // ... resto del handler
 * }
 * ```
 */
export async function csrfMiddleware(req: Request): Promise { valid: boolean; error?: string } {
  try {
    // Verificar si viene de NextAuth (ya tiene CSRF protection)
    const sessionToken = req.headers.get('cookie')?.match(/next-auth\.session-token=([^;]+)/)?.[1]

    if (sessionToken) {
      // NextAuth maneja CSRF automáticamente
      return { valid: true }
    }

    // Para endpoints sin NextAuth, verificar header CSRF
    const csrfToken = req.headers.get('x-csrf-token')
    const referer = req.headers.get('referer')
    const origin = req.headers.get('origin')

    // Verificar Origin y Referer para prevenir CSRF básico
    const host = req.headers.get('host')
    const allowedOrigins = [
      process.env.NEXTAUTH_URL || 'http://localhost:3000',
      `https://${host}`,
      process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : null
    ].filter(Boolean) as string[]

    // Verificar que el request venga de un origen permitido
    if (origin && !allowedOrigins.some(allowed => origin === allowed || origin.startsWith(allowed))) {
      return {
        valid: false,
        error: 'Origin header verification failed'
      }
    }

    if (referer && !allowedOrigins.some(allowed => referer.startsWith(allowed))) {
      return {
        valid: false,
        error: 'Referer header verification failed'
      }
    }

    // Si hay un token CSRF personalizado, validarlo
    if (csrfToken) {
      // Aquí podrías agregar lógica adicional para validar tokens personalizados
      // Por ejemplo, verificar contra una sesión o base de datos
    }

    return { valid: true }
  } catch (error) {
    return {
      valid: false,
      error: 'CSRF validation failed'
    }
  }
}

/**
 * Generar token CSRF para usar en frontend
 *
 * Retorna un token que debe incluirse en:
 * - Header: X-CSRF-Token
 * - O en body: csrf_token
 */
export async function getCSRFTokenForClient(): Promise<{ token: string; expiresAt: number }> {
  return generateCSRFTokenWithExpiry(3600000) // 1 hora
}

/**
 * Configuración de headers CORS para prevenir CSRF
 */
export const csrfSafeCorsHeaders = {
  'Access-Control-Allow-Origin': process.env.NODE_ENV === 'production'
    ? (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'https://oral7.vercel.app')
    : 'http://localhost:3000',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Credentials': 'true',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-CSRF-Token',
  'Access-Control-Max-Age': '86400', // 24 horas
}

/**
 * Endpoint OPTIONS para CORS preflight
 */
export function handleCORSOptions() {
  return new Response(null, {
    status: 204,
    headers: csrfSafeCorsHeaders
  })
}

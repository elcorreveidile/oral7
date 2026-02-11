import { NextAuthOptions } from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import { compare } from "bcryptjs"
import prisma from "./prisma"
import { decryptSecret, verifyToken } from "./twoFactor"

// Note: NEXTAUTH_URL is set dynamically in the route handler
// based on request headers, allowing support for multiple domains

function parseEnvBoolean(value: string | undefined, defaultValue = false): boolean {
  if (value === undefined) return defaultValue
  const normalized = value.trim().toLowerCase()
  return normalized === "1" || normalized === "true" || normalized === "yes" || normalized === "on"
}

function isAdmin2FAEnabled(): boolean {
  return parseEnvBoolean(process.env.AUTH_ADMIN_2FA_ENABLED, false)
}

function isAdmin2FAStrictMode(): boolean {
  return parseEnvBoolean(process.env.AUTH_ADMIN_2FA_STRICT, false)
}

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credenciales",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Contraseña", type: "password" },
        totp: { label: "Código 2FA", type: "text" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          // Log generic message only in development
          if (process.env.NODE_ENV === 'development') {
            console.log('[Auth] Authentication attempt with missing credentials')
          }
          return null
        }

        const normalizedEmail = credentials.email.trim().toLowerCase()

        let user: {
          id: string
          email: string
          name: string
          image: string | null
          role: string
          password: string | null
        } | null = null

        try {
          // Select only fields required for login to avoid hard failures
          // if optional newer columns are not present in an older database.
          user = await prisma.user.findUnique({
            where: { email: normalizedEmail },
            select: {
              id: true,
              email: true,
              name: true,
              image: true,
              role: true,
              password: true,
            },
          })
        } catch {
          if (process.env.NODE_ENV === "development") {
            console.error("[Auth] Failed to fetch user for credentials login")
          }
          return null
        }

        if (!user || !user.password) {
          // Do NOT log whether user exists or email - prevents user enumeration
          if (process.env.NODE_ENV === 'development') {
            console.log('[Auth] Authentication failed')
          }
          return null
        }

        const isPasswordValid = await compare(credentials.password, user.password)

        if (!isPasswordValid) {
          // Do NOT log email or specific failure reason - prevents user enumeration
          if (process.env.NODE_ENV === 'development') {
            console.log('[Auth] Authentication failed')
          }
          return null
        }

        // 2FA gradual rollout:
        // - Disabled by default through AUTH_ADMIN_2FA_ENABLED
        // - Optional strict mode can be enabled with AUTH_ADMIN_2FA_STRICT
        if (isAdmin2FAEnabled() && user.role === "ADMIN") {
          try {
            const adminSecurity = await prisma.user.findUnique({
              where: { id: user.id },
              select: {
                twoFactorEnabled: true,
                twoFactorSecret: true,
              },
            })

            if (adminSecurity?.twoFactorEnabled) {
              const totpToken = credentials?.totp?.trim() || ""

              if (!adminSecurity.twoFactorSecret || !totpToken) {
                if (process.env.NODE_ENV === "development") {
                  console.log("[Auth] 2FA token required for admin login")
                }
                return null
              }

              try {
                const decryptedSecret = decryptSecret(adminSecurity.twoFactorSecret)
                const isTotpValid = verifyToken(decryptedSecret, totpToken)
                if (!isTotpValid) {
                  if (process.env.NODE_ENV === "development") {
                    console.log("[Auth] Invalid 2FA token")
                  }
                  return null
                }
              } catch {
                if (process.env.NODE_ENV === "development") {
                  console.log("[Auth] Failed to verify 2FA token")
                }
                return null
              }
            }
          } catch {
            // If DB schema is partially deployed, keep auth available unless strict mode is enabled.
            if (process.env.NODE_ENV === "development") {
              console.error("[Auth] Could not load admin 2FA fields")
            }
            if (isAdmin2FAStrictMode()) {
              return null
            }
          }
        }

        // Log successful auth without exposing email in production
        if (process.env.NODE_ENV === 'development') {
          console.log('[Auth] Authentication successful')
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          image: user.image,
          role: user.role,
        }
      }
    })
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
        token.role = user.role

        // Role-based session timeouts for enhanced security
        // STUDENT: 24 hours (more frequent re-authentication for student accounts)
        // ADMIN: 7 days (balance between security and usability for administrators)
        if (user.role === "ADMIN") {
          token.exp = Math.floor(Date.now() / 1000) + (7 * 24 * 60 * 60) // 7 days
        } else {
          token.exp = Math.floor(Date.now() / 1000) + (24 * 60 * 60) // 24 hours
        }
      }
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string
        session.user.role = token.role as string
      }
      return session
    }
  },
  pages: {
    signIn: "/login",
    error: "/login",
  },
  session: {
    strategy: "jwt",
    maxAge: 24 * 60 * 60, // 24 hours - Reduced from 30 days for better security
    // Shorter session timeout reduces the window of opportunity for stolen JWTs
    // and ensures users must re-authenticate more frequently, improving overall security.
    // Role-specific expiration times are set in the JWT callback above.
  },
  secret: process.env.NEXTAUTH_SECRET,
  // Use secure cookies in production
  useSecureCookies: process.env.NODE_ENV === 'production',
  debug: process.env.NODE_ENV === 'development',
}

// Tipos extendidos para NextAuth
declare module "next-auth" {
  interface User {
    id: string
    role: string
  }
  interface Session {
    user: {
      id: string
      name?: string | null
      email?: string | null
      image?: string | null
      role: string
    }
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string
    role: string
  }
}

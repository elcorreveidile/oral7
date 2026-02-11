import { NextAuthOptions } from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import { compare } from "bcryptjs"
import prisma from "./prisma"

// Dynamically determine NEXTAUTH_URL based on the environment
// This allows the app to work with multiple domains (preview URLs, custom domains, etc.)
function getNextAuthUrl(): string {
  // In production on Vercel, use the VERCEL_URL if NEXTAUTH_URL is not explicitly set
  // or if NEXTAUTH_URL is set to the default Vercel URL but we're on a custom domain
  if (process.env.VERCEL === '1') {
    // Check if we're on a custom domain by checking VERCEL_URL
    // VERCEL_URL is automatically set by Vercel and changes based on the deployment
    const vercelUrl = process.env.VERCEL_URL
    if (vercelUrl && !vercelUrl.includes('.vercel.app')) {
      // We're on a custom domain (like pio8.cognoscencia.com)
      return `https://${vercelUrl}`
    }
  }

  // Fall back to NEXTAUTH_URL environment variable
  return process.env.NEXTAUTH_URL || 'http://localhost:3000'
}

// Set NEXTAUTH_URL dynamically for NextAuth internal use
if (typeof process.env.NEXTAUTH_URL === 'undefined' || process.env.VERCEL === '1') {
  process.env.NEXTAUTH_URL = getNextAuthUrl()
}

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credenciales",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Contraseña", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          console.log('[Auth] Missing credentials')
          return null
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email }
        })

        if (!user || !user.password) {
          console.log('[Auth] User not found or no password:', credentials.email)
          return null
        }

        console.log('[Auth] User found:', user.email, 'Role:', user.role)
        console.log('[Auth] Password hash exists:', !!user.password)
        console.log('[Auth] Input password length:', credentials.password.length)

        const isPasswordValid = await compare(credentials.password, user.password)

        console.log('[Auth] Password valid:', isPasswordValid)

        if (!isPasswordValid) {
          console.log('[Auth] Password comparison failed for:', user.email)
          return null
        }

        console.log('[Auth] Authentication successful for:', user.email)

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

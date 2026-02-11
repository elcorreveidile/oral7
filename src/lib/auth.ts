import { NextAuthOptions } from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import { compare } from "bcryptjs"
import prisma from "./prisma"

// Note: NEXTAUTH_URL is set dynamically in the route handler
// based on request headers, allowing support for multiple domains

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

import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"

/**
 * Validates session and admin role on server-side
 * Use this in Server Components and API Routes to protect admin resources
 *
 * @returns The session object if user is authenticated as admin, null otherwise
 *
 * @example
 * ```ts
 * // In Server Components
 * const session = await getAdminSession()
 * if (!session) {
 *   redirect("/login")
 * }
 * ```
 *
 * @example
 * ```ts
 * // In API Routes
 * const session = await getAdminSession()
 * if (!session) {
 *   return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
 * }
 * ```
 */
export async function getAdminSession() {
  const session = await getServerSession(authOptions)

  // Check if user is authenticated and has admin role
  if (!session || !session.user || session.user.role !== "ADMIN") {
    return null
  }

  return session
}

/**
 * Helper that redirects to login if not authenticated as admin
 * Use this in Server Components for cleaner code
 *
 * @returns The session object (guaranteed to be valid admin session)
 * @throws Redirects to /login if not authenticated as admin
 *
 * @example
 * ```ts
 * export default async function AdminPage() {
 *   const session = await requireAdmin()
 *   // Now you can safely use session.user.id, etc.
 * }
 * ```
 */
export async function requireAdmin() {
  const session = await getAdminSession()

  if (!session) {
    redirect("/login")
  }

  return session
}

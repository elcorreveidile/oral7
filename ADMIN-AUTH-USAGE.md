# Admin Auth Usage Guide

Quick reference for using the server-side admin authentication utilities.

## For Server Components

### Basic Usage (Redirects if not admin)
```tsx
import { requireAdmin } from "@/lib/admin-auth"

export default async function AdminPage() {
  const session = await requireAdmin() // Auto-redirects to /login if not admin

  // Safe to use session.user.id, session.user.email, etc.
  return <div>Welcome, {session.user.email}</div>
}
```

### Conditional Usage (Manual redirect)
```tsx
import { getAdminSession } from "@/lib/admin-auth"
import { redirect } from "next/navigation"

export default async function AdminPage() {
  const session = await getAdminSession()

  if (!session) {
    redirect("/login") // Manual redirect
  }

  return <div>Admin content</div>
}
```

## For API Routes

### Basic Pattern
```ts
import { NextResponse } from "next/server"
import { getAdminSession } from "@/lib/admin-auth"

export async function GET(request: NextRequest) {
  const session = await getAdminSession()

  if (!session) {
    return NextResponse.json(
      { error: "No autorizado" },
      { status: 403 } // Use 403 for authorization failures
    )
  }

  // Session is valid admin, proceed with logic
  return NextResponse.json({ data: "..." })
}
```

### Multiple Handlers
```ts
import { NextResponse } from "next/server"
import { getAdminSession } from "@/lib/admin-auth"

export async function GET(request: NextRequest) {
  const session = await getAdminSession()
  if (!session) {
    return NextResponse.json({ error: "No autorizado" }, { status: 403 })
  }
  // GET logic...
}

export async function POST(request: NextRequest) {
  const session = await getAdminSession()
  if (!session) {
    return NextResponse.json({ error: "No autorizado" }, { status: 403 })
  }
  // POST logic...
}
```

## Migration from Old Pattern

### Before (Deprecated)
```ts
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

const session = await getServerSession(authOptions)
if (!session || !session.user || session.user.role !== "ADMIN") {
  return NextResponse.json({ error: "No autorizado" }, { status: 401 })
}
```

### After (Recommended)
```ts
import { getAdminSession } from "@/lib/admin-auth"

const session = await getAdminSession()
if (!session) {
  return NextResponse.json({ error: "No autorizado" }, { status: 403 })
}
```

## Status Code Reference

- **401 Unauthorized**: Authentication failed (user not logged in)
- **403 Forbidden**: Authorization failed (user logged in but not admin)
- Use 403 for admin route protection since we're checking authorization, not authentication

## Accessing User Data

When you have a valid admin session, you can access:

```ts
const session = await getAdminSession()
if (session) {
  console.log(session.user.id)      // User ID
  console.log(session.user.email)   // User email
  console.log(session.user.name)    // User name
  console.log(session.user.role)    // Will be "ADMIN"
}
```

## Common Patterns

### With Database Operations
```ts
import { getAdminSession } from "@/lib/admin-auth"
import prisma from "@/lib/prisma"

export async function DELETE(request: NextRequest) {
  const session = await getAdminSession()
  if (!session) {
    return NextResponse.json({ error: "No autorizado" }, { status: 403 })
  }

  // Safe to perform admin operations
  await prisma.user.delete({ where: { id: params.id } })

  return NextResponse.json({ success: true })
}
```

### With File Uploads
```ts
import { getAdminSession } from "@/lib/admin-auth"

export async function POST(request: NextRequest) {
  const session = await getAdminSession()
  if (!session) {
    return NextResponse.json({ error: "No autorizado" }, { status: 403 })
  }

  // Process file upload...
}
```

## Important Notes

1. **Always check return value:** `getAdminSession()` returns `null` if not authenticated
2. **Use 403, not 401:** For admin authorization checks (user is logged in but lacks permission)
3. **Server Components only:** These utilities only work in server-side code
4. **Consistent behavior:** Using these utilities ensures consistent auth checking across the app

## Testing Auth

You can test authentication by:

1. **As admin:** Should work normally
2. **As regular user:** Should get 403 or redirect
3. **Not logged in:** Should redirect to login

```bash
# Test API route as admin (should work)
curl -H "Authorization: Bearer <admin-token>" /api/admin/stats

# Test API route as regular user (should return 403)
curl -H "Authorization: Bearer <user-token>" /api/admin/stats
```

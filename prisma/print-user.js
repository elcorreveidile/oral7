/* eslint-disable no-console */

const fs = require("fs")
const path = require("path")

function maskDatabaseUrl(url) {
  try {
    const u = new URL(url)
    if (u.password) u.password = "***"
    return u.toString()
  } catch {
    return "(invalid DATABASE_URL)"
  }
}

function parseDotenvFile(filePath) {
  if (!fs.existsSync(filePath)) return {}
  const out = {}
  const text = fs.readFileSync(filePath, "utf8")
  for (const rawLine of text.split(/\r?\n/)) {
    const line = rawLine.trim()
    if (!line || line.startsWith("#")) continue
    const m = line.match(/^(?:export\s+)?([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)$/)
    if (!m) continue
    const key = m[1]
    let val = m[2] ?? ""
    // strip inline comment for unquoted values
    if (!val.startsWith('"') && !val.startsWith("'")) {
      const hash = val.indexOf(" #")
      if (hash !== -1) val = val.slice(0, hash).trim()
    }
    if (
      (val.startsWith('"') && val.endsWith('"')) ||
      (val.startsWith("'") && val.endsWith("'"))
    ) {
      val = val.slice(1, -1)
    }
    out[key] = val
  }
  return out
}

function ensureEnvLoaded() {
  // Some shells/CI may set DATABASE_URL="" which counts as "set" but is unusable.
  if (typeof process.env.DATABASE_URL === "string" && process.env.DATABASE_URL.length > 0) return

  const cwd = process.cwd()
  const candidates = [
    path.join(cwd, ".env.local"),
    path.join(cwd, ".env.production.local"),
    path.join(cwd, ".env.development.local"),
    path.join(cwd, ".env"),
  ]
  for (const p of candidates) {
    const envFromFile = parseDotenvFile(p)
    if (typeof envFromFile.DATABASE_URL === "string" && envFromFile.DATABASE_URL.length > 0) {
      process.env.DATABASE_URL = envFromFile.DATABASE_URL
      return
    }
  }
}

function takeFlagValue(flag) {
  const idx = process.argv.indexOf(flag)
  if (idx === -1) return null
  const val = process.argv[idx + 1]
  if (!val) {
    console.error(`Falta valor para ${flag}`)
    process.exit(1)
  }
  process.argv.splice(idx, 2)
  return val
}

async function main() {
  const envFile = takeFlagValue("--env-file")
  if (envFile) {
    const abs = path.isAbsolute(envFile) ? envFile : path.join(process.cwd(), envFile)
    const envFromFile = parseDotenvFile(abs)
    if (typeof envFromFile.DATABASE_URL === "string" && envFromFile.DATABASE_URL.length > 0) {
      process.env.DATABASE_URL = envFromFile.DATABASE_URL
    }
  }

  ensureEnvLoaded()
  console.log(
    `Using DATABASE_URL: ${
      process.env.DATABASE_URL ? maskDatabaseUrl(process.env.DATABASE_URL) : "(missing)"
    }`,
  )

  const email = process.argv[2]
  if (!email) {
    console.error("Uso: npm run db:user -- [--env-file <archivo>] <email>")
    process.exit(1)
  }

  // Import Prisma after env is loaded, otherwise `@prisma/client` will eagerly load `.env`
  // (and would ignore `.env.local` from Vercel).
  const { PrismaClient } = require("@prisma/client")
  const prisma = new PrismaClient()
  try {
    const user = await prisma.user.findUnique({
      where: { email },
      select: { id: true, email: true, name: true, role: true, password: true, createdAt: true, updatedAt: true },
    })
    if (!user) {
      console.log(null)
      return
    }
    console.log({
      ...user,
      password: user.password ? `set (len=${user.password.length})` : null,
    })
  } finally {
    await prisma.$disconnect()
  }
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})

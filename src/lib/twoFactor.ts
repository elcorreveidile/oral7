import { createCipheriv, createDecipheriv, createHash, randomBytes } from "node:crypto"
import { authenticator } from "otplib"
import QRCode from "qrcode"

const TWO_FACTOR_ISSUER = process.env.TWO_FACTOR_ISSUER || "PIO-7"
const ALGORITHM = "aes-256-gcm"
const IV_BYTES = 12
const AUTH_TAG_BYTES = 16

authenticator.options = {
  window: 1,
}

function getEncryptionKey(): Buffer {
  const secret = process.env.NEXTAUTH_SECRET
  if (!secret) {
    throw new Error("NEXTAUTH_SECRET no configurado")
  }

  return createHash("sha256").update(secret).digest()
}

export function generateSecret(): string {
  return authenticator.generateSecret()
}

export function verifyToken(secret: string, token: string): boolean {
  const normalized = token.replace(/\s+/g, "")
  if (!/^\d{6}$/.test(normalized)) {
    return false
  }
  return authenticator.verify({ token: normalized, secret })
}

export async function generateQRCode(secret: string, email: string): Promise<string> {
  const otpauth = authenticator.keyuri(email, TWO_FACTOR_ISSUER, secret)
  return QRCode.toDataURL(otpauth)
}

export function encryptSecret(secret: string): string {
  const key = getEncryptionKey()
  const iv = randomBytes(IV_BYTES)
  const cipher = createCipheriv(ALGORITHM, key, iv)
  const encrypted = Buffer.concat([cipher.update(secret, "utf8"), cipher.final()])
  const authTag = cipher.getAuthTag()

  return `${iv.toString("base64url")}:${authTag.toString("base64url")}:${encrypted.toString("base64url")}`
}

export function decryptSecret(value: string): string {
  const [ivEncoded, tagEncoded, payloadEncoded] = value.split(":")
  if (!ivEncoded || !tagEncoded || !payloadEncoded) {
    throw new Error("Formato de secreto 2FA inválido")
  }

  const iv = Buffer.from(ivEncoded, "base64url")
  const authTag = Buffer.from(tagEncoded, "base64url")
  const payload = Buffer.from(payloadEncoded, "base64url")

  if (iv.length !== IV_BYTES || authTag.length !== AUTH_TAG_BYTES) {
    throw new Error("Formato de secreto 2FA inválido")
  }

  const key = getEncryptionKey()
  const decipher = createDecipheriv(ALGORITHM, key, iv)
  decipher.setAuthTag(authTag)
  const decrypted = Buffer.concat([decipher.update(payload), decipher.final()])
  return decrypted.toString("utf8")
}

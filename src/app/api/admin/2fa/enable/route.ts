import { NextRequest, NextResponse } from "next/server"
import { getAdminSession } from "@/lib/admin-auth"
import prisma from "@/lib/prisma"
import { encryptSecret, generateQRCode, generateSecret } from "@/lib/twoFactor"
import { logAdminAction } from "@/lib/audit-logger"

export async function GET() {
  const session = await getAdminSession()
  if (!session) {
    return NextResponse.json({ error: "No autorizado" }, { status: 403 })
  }

  const admin = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { twoFactorEnabled: true, twoFactorSecret: true },
  })

  if (!admin) {
    return NextResponse.json({ error: "Usuario no encontrado" }, { status: 404 })
  }

  return NextResponse.json({
    enabled: admin.twoFactorEnabled,
    configured: Boolean(admin.twoFactorSecret),
  })
}

export async function POST(request: NextRequest) {
  const session = await getAdminSession()
  if (!session) {
    return NextResponse.json({ error: "No autorizado" }, { status: 403 })
  }

  try {
    const secret = generateSecret()
    const encryptedSecret = encryptSecret(secret)
    const email = session.user.email || `admin-${session.user.id}@local`
    const qrCodeDataUrl = await generateQRCode(secret, email)

    await prisma.user.update({
      where: { id: session.user.id },
      data: {
        twoFactorSecret: encryptedSecret,
        twoFactorEnabled: false,
      },
    })

    await logAdminAction(
      session.user.id,
      "ADMIN_2FA_SETUP_STARTED",
      "User",
      session.user.id,
      { email },
      request
    )

    return NextResponse.json({
      success: true,
      qrCodeDataUrl,
      manualEntryKey: secret,
      message: "Escanea el QR y verifica un código para activar 2FA.",
    })
  } catch (error) {
    return NextResponse.json(
      { error: "No se pudo iniciar la configuración de 2FA" },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  const session = await getAdminSession()
  if (!session) {
    return NextResponse.json({ error: "No autorizado" }, { status: 403 })
  }

  try {
    await prisma.user.update({
      where: { id: session.user.id },
      data: {
        twoFactorEnabled: false,
        twoFactorSecret: null,
      },
    })

    await logAdminAction(
      session.user.id,
      "ADMIN_2FA_DISABLED",
      "User",
      session.user.id,
      undefined,
      request
    )

    return NextResponse.json({
      success: true,
      message: "2FA desactivado correctamente.",
    })
  } catch (error) {
    return NextResponse.json({ error: "No se pudo desactivar 2FA" }, { status: 500 })
  }
}

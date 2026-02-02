import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import prisma from "@/lib/prisma"

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "No autorizado" },
        { status: 401 }
      )
    }

    const { code, sessionId, expiresAt } = await request.json()

    if (!code || !sessionId || !expiresAt) {
      return NextResponse.json(
        { error: "Faltan datos requeridos" },
        { status: 400 }
      )
    }

    // Verify that the session exists
    const sessionData = await prisma.session.findUnique({
      where: { id: sessionId },
    })

    if (!sessionData) {
      return NextResponse.json(
        { error: "La sesión especificada no existe" },
        { status: 400 }
      )
    }

    // Deactivate any previous active codes for this session
    await prisma.qRCode.updateMany({
      where: {
        sessionId,
        isActive: true,
      },
      data: {
        isActive: false,
      },
    })

    // Create new QR code
    const qrCode = await prisma.qRCode.create({
      data: {
        code,
        sessionId,
        expiresAt: new Date(expiresAt),
        isActive: true,
      },
    })

    return NextResponse.json({
      success: true,
      qrCode: {
        id: qrCode.id,
        code: qrCode.code,
        expiresAt: qrCode.expiresAt,
      },
    })
  } catch (error) {
    console.error("Error generating QR code:", error)
    return NextResponse.json(
      { error: "Error al generar el código" },
      { status: 500 }
    )
  }
}

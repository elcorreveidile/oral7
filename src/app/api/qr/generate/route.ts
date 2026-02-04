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

    const { code, sessionNumber, expiresAt } = await request.json()

    if (!code || !sessionNumber || !expiresAt) {
      return NextResponse.json(
        { error: "Faltan datos requeridos" },
        { status: 400 }
      )
    }

    // Find the session by sessionNumber to get the real DB ID
    const dbSession = await prisma.session.findUnique({
      where: { sessionNumber },
    })

    if (!dbSession) {
      return NextResponse.json(
        { error: "Sesión no encontrada" },
        { status: 404 }
      )
    }

    // Deactivate any previous active codes for this session
    await prisma.qRCode.updateMany({
      where: {
        sessionId: dbSession.id,
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
        sessionId: dbSession.id,
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

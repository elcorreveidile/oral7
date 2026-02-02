import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

// PATCH - Actualizar código (activar/desactivar)
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ codeId: string }> }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || session.user?.role !== "ADMIN") {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    const { codeId } = await params
    const body = await req.json()
    const { isActive } = body

    const updatedCode = await prisma.registrationCode.update({
      where: { id: codeId },
      data: { isActive },
    })

    return NextResponse.json(updatedCode)
  } catch (error) {
    console.error("Error al actualizar código:", error)
    return NextResponse.json(
      { error: "Error al actualizar código" },
      { status: 500 }
    )
  }
}

// DELETE - Eliminar código
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ codeId: string }> }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || session.user?.role !== "ADMIN") {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    const { codeId } = await params

    await prisma.registrationCode.delete({
      where: { id: codeId },
    })

    return NextResponse.json({ message: "Código eliminado" })
  } catch (error) {
    console.error("Error al eliminar código:", error)
    return NextResponse.json(
      { error: "Error al eliminar código" },
      { status: 500 }
    )
  }
}

import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "No autorizado" },
        { status: 401 }
      )
    }

    const token = process.env.BLOB_READ_WRITE_TOKEN

    if (!token) {
      return NextResponse.json({
        success: false,
        error: "BLOB_READ_WRITE_TOKEN no configurado"
      })
    }

    // Create a simple test file
    const testContent = "Test file content"
    const filename = `test-${Date.now()}.txt`
    const blobUrl = `https://blob.vercel-storage.com/${filename}`

    console.log("Test upload to:", blobUrl)

    const response = await fetch(blobUrl, {
      method: 'PUT',
      body: testContent,
      headers: {
        'authorization': `Bearer ${token}`,
        'Content-Type': 'text/plain',
      },
    })

    console.log("Response status:", response.status)
    console.log("Response headers:", Object.fromEntries(response.headers.entries()))

    if (!response.ok) {
      const errorText = await response.text()
      console.error("Error response:", errorText)
      return NextResponse.json({
        success: false,
        error: `Error ${response.status}: ${errorText}`,
        status: response.status,
      })
    }

    const data = await response.json()

    return NextResponse.json({
      success: true,
      message: "Test file uploaded successfully",
      url: data.url,
    })

  } catch (error) {
    console.error("Test upload error:", error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    )
  }
}

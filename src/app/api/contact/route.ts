import { NextResponse } from "next/server"
import { Resend } from "resend"

const resend = new Resend(process.env.RESEND_API_KEY)

export async function POST(req: Request) {
  try {
    const { name, email, subject, message } = await req.json()

    // Validate input
    if (!name || !email || !subject || !message) {
      return NextResponse.json(
        { error: "Todos los campos son obligatorios" },
        { status: 400 }
      )
    }

    // Send email using Resend
    // Using Resend's test domain - change to verified domain in production
    const { data, error } = await resend.emails.send({
      from: "PIO-7 Contacto <onboarding@resend.dev>",
      to: ["benitezl@go.ugr.es"],
      reply_to: email,
      subject: `[PIO-7 Contacto] ${subject}`,
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #ea580c;">Nuevo mensaje de contacto</h2>
          <div style="background: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <p><strong>Nombre:</strong> ${name}</p>
            <p><strong>Email:</strong> ${email}</p>
            <p><strong>Asunto:</strong> ${subject}</p>
          </div>
          <div style="background: #fff; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px;">
            <h3 style="margin-top: 0;">Mensaje:</h3>
            <p style="white-space: pre-wrap;">${message}</p>
          </div>
          <p style="color: #64748b; font-size: 12px; margin-top: 20px;">
            Este mensaje fue enviado desde el formulario de contacto de PIO-7.
          </p>
        </div>
      `,
    })

    if (error) {
      console.error("Resend error:", error)
      return NextResponse.json(
        { error: "Error al enviar el mensaje" },
        { status: 500 }
      )
    }

    return NextResponse.json(
      { message: "Mensaje enviado correctamente", id: data?.id },
      { status: 200 }
    )
  } catch (error) {
    console.error("Contact form error:", error)
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    )
  }
}

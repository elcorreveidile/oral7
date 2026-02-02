import { NextRequest, NextResponse } from "next/server"
import { Resend } from "resend"

const resend = new Resend(process.env.RESEND_API_KEY)

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { name, email, subject, message } = body

    // Validar datos
    if (!name || !email || !subject || !message) {
      return NextResponse.json(
        { error: "Todos los campos son obligatorios" },
        { status: 400 }
      )
    }

    // Enviar email usando Resend
    const { data, error } = await resend.emails.send({
      from: "PIO-7 <contacto@diariodeuninstante.com>",
      to: process.env.CONTACT_EMAIL || "benitezl@go.ugr.es",
      subject: `📧 Nuevo mensaje de contacto: ${subject}`,
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <style>
              body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
              .container { max-width: 600px; margin: 0 auto; padding: 20px; }
              .header { background: linear-gradient(to right, #dc2626, #ea580c); color: white; padding: 20px; border-radius: 8px 8px 0 0; }
              .content { background: #f9fafb; padding: 20px; border-radius: 0 0 8px 8px; }
              .field { margin-bottom: 15px; }
              .label { font-weight: bold; color: #dc2626; }
              .value { background: white; padding: 10px; border-radius: 4px; border-left: 4px solid #dc2626; margin-top: 5px; }
              .footer { margin-top: 20px; padding-top: 20px; border-top: 1px solid #ddd; text-align: center; color: #666; font-size: 12px; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1 style="margin: 0;">📧 Nuevo mensaje de contacto</h1>
                <p style="margin: 5px 0 0 0;">Plataforma PIO-7</p>
              </div>
              <div class="content">
                <div class="field">
                  <div class="label">Nombre:</div>
                  <div class="value">${name}</div>
                </div>
                <div class="field">
                  <div class="label">Email:</div>
                  <div class="value">${email}</div>
                </div>
                <div class="field">
                  <div class="label">Asunto:</div>
                  <div class="value">${subject}</div>
                </div>
                <div class="field">
                  <div class="label">Mensaje:</div>
                  <div class="value">${message.replace(/\n/g, "<br>")}</div>
                </div>
              </div>
              <div class="footer">
                <p>Centro de Lenguas Modernas · Universidad de Granada</p>
                <p>Enviado desde la plataforma PIO-7</p>
                <p>${new Date().toLocaleString("es-ES", { timeZone: "Europe/Madrid" })}</p>
              </div>
            </div>
          </body>
        </html>
      `,
      reply_to: email,
    })

    if (error) {
      console.error("Error sending email:", error)
      return NextResponse.json(
        { error: "Error al enviar el mensaje" },
        { status: 500 }
      )
    }

    return NextResponse.json({
      message: "Mensaje enviado correctamente",
      data,
    })
  } catch (error) {
    console.error("Error in contact API:", error)
    return NextResponse.json(
      { error: "Error al procesar la solicitud" },
      { status: 500 }
    )
  }
}

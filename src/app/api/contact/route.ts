import { NextResponse } from "next/server"
import { Resend } from "resend"
import { getClientIp, rateLimit, rateLimitResponse, addRateLimitHeaders, RateLimitConfig } from "@/lib/rate-limit-redis"
import { validateRequest, contactFormSchema } from "@/lib/validations"

// Only initialize Resend if API key is available
const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null

export async function POST(req: Request) {
  // Apply rate limiting based on IP address
  const ip = getClientIp(req)
  const rateLimitResult = await rateLimit(ip, RateLimitConfig.contact)

  if (!rateLimitResult.success) {
    return rateLimitResponse(rateLimitResult.resetTime)
  }

  try {
    const body = await req.json()

    // Validate request body with Zod schema
    const validation = validateRequest(contactFormSchema, body)
    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error },
        { status: 400 }
      )
    }

    const { name, email, subject, message } = validation.data

    // Send email using Resend (if configured)
    let data, error
    if (resend) {
      const result = await resend.emails.send({
        from: "PIO-7 Contacto <no-reply@pio7.com>",
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
      data = result.data
      error = result.error
    } else {
      // Resend not configured - log the message and return success

      data = { id: "dev-mode" }
      error = null
    }

    if (error) {

      return NextResponse.json(
        { error: "Error al enviar el mensaje" },
        { status: 500 }
      )
    }

    const response = NextResponse.json(
      { message: "Mensaje enviado correctamente", id: data?.id },
      { status: 200 }
    )

    return addRateLimitHeaders(
      response,
      RateLimitConfig.contact.limit,
      rateLimitResult.remaining,
      rateLimitResult.resetTime
    )
  } catch (error) {

    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    )
  }
}

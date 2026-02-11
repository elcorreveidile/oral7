import { NextRequest, NextResponse } from 'next/server'
import { Resend } from 'resend'
import prisma from '@/lib/prisma'
import { randomBytes } from 'crypto'

const resend = new Resend(process.env.RESEND_API_KEY)

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json()

    if (!email) {
      return NextResponse.json(
        { error: 'Email es requerido' },
        { status: 400 }
      )
    }

    // Verificar si el usuario existe
    const user = await prisma.user.findUnique({
      where: { email }
    })

    // Por seguridad, no revelamos si el email existe o no
    // Siempre respondemos con éxito aunque el usuario no exista
    if (!user) {
      console.log('[Forgot Password] Email no encontrado:', email)
      return NextResponse.json({
        message: 'Si el email existe en nuestra base de datos, recibirás un enlace para restablecer tu contraseña.'
      })
    }

    // Generar token único
    const token = randomBytes(32).toString('hex')

    // Token expira en 1 hora
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000)

    // Guardar token en la base de datos
    await prisma.passwordResetToken.create({
      data: {
        email,
        token,
        expiresAt
      }
    })

    // Construir URL de reset
    const host = request.headers.get('host') || 'localhost:3000'
    const protocol = request.headers.get('x-forwarded-proto') || 'https'
    const resetUrl = `${protocol}://${host}/reset-password?token=${token}`

    console.log('[Forgot Password] Reset URL generada:', resetUrl)

    // Enviar email
    try {
      await resend.emails.send({
        from: 'PIO-7 <onboarding@resend.dev>',
        to: email,
        subject: 'Restablece tu contraseña - PIO-7',
        html: `
          <!DOCTYPE html>
          <html>
            <head>
              <meta charset="utf-8">
              <style>
                body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                .header { background: linear-gradient(135deg, #c8102e 0%, #0077b6 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
                .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
                .button { display: inline-block; background: #0077b6; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
                .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
              </style>
            </head>
            <body>
              <div class="container">
                <div class="header">
                  <h1>PIO-7</h1>
                  <p>Producción e interacción oral en español</p>
                </div>
                <div class="content">
                  <h2>Hola ${user.name},</h2>
                  <p>Hemos recibido una solicitud para restablecer tu contraseña.</p>
                  <p>Haz clic en el siguiente botón para crear una nueva contraseña:</p>
                  <center>
                    <a href="${resetUrl}" class="button">Restablecer contraseña</a>
                  </center>
                  <p>O copia y pega este enlace en tu navegador:</p>
                  <p style="word-break: break-all; color: #0077b6;">${resetUrl}</p>
                  <p><strong>Este enlace expirará en 1 hora.</strong></p>
                  <p>Si no solicitaste este cambio, puedes ignorar este email.</p>
                </div>
                <div class="footer">
                  <p>Centro de Lenguas Modernas · Universidad de Granada</p>
                </div>
              </div>
            </body>
          </html>
        `
      })

      console.log('[Forgot Password] Email enviado exitosamente a:', email)
    } catch (emailError: any) {
      console.error('[Forgot Password] Error enviando email:', emailError)
      console.error('[Forgot Password] Detalles del error:', emailError?.message)

      // Por seguridad, no revelamos el error del email al usuario
      // Pero sí lo registramos para poder debuggear
    }

    return NextResponse.json({
      message: 'Si el email existe en nuestra base de datos, recibirás un enlace para restablecer tu contraseña.'
    })
  } catch (error) {
    console.error('[Forgot Password] Error:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}

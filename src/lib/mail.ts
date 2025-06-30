import { createTransport } from "nodemailer"

interface SendMailOptions {
  to: string
  subject: string
  html: string
}

export async function sendMail({ to, subject, html }: SendMailOptions) {
  const { EMAIL_FROM } = process.env

  if (!EMAIL_FROM) {
    throw new Error("Missing email configuration")
  }

  const transport = createTransport({
    host: "smtp-relay.brevo.com",
    port: 587,
    auth: {
      user: "8ca2bc001@smtp-brevo.com",
      pass: "BAyzUWq3avFcwLI5"
    },
  })

  try {
    const result = await transport.sendMail({
      from: EMAIL_FROM,
      to,
      subject,
      html,
    })

    return { success: true, messageId: result.messageId }
  } catch (error) {
    console.error("Error sending email:", error)
    throw new Error("Failed to send email")
  }
}

export function sendPasswordResetEmail(email: string, resetLink: string) {
  return {
    to: email,
    subject: "Reset Your Password",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #333; text-align: center;">Reset Your Password</h2>
        <p>Hello,</p>
        <p>We received a request to reset your password. Click the button below to create a new password:</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${resetLink}" style="background-color: #0070f3; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block;">Reset Password</a>
        </div>
        <p>If you didn't request this, you can safely ignore this email.</p>
        <p>This link will expire in 1 hour for security reasons.</p>
        <p>Best regards,<br>Your Investment App Team</p>
      </div>
    `,
  }
}

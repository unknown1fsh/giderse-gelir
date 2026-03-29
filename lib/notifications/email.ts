import { sendEmail } from '@/lib/email'

function getAppUrl() {
  return process.env.NEXTAUTH_URL || process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
}

export async function sendNotificationEmail(
  email: string,
  name: string,
  payload: {
    subject: string
    title: string
    body: string
    ctaLabel?: string
    ctaUrl?: string
  }
) {
  const ctaUrl = payload.ctaUrl || `${getAppUrl()}/dashboard`
  const ctaLabel = payload.ctaLabel || 'Paneli Aç'

  return sendEmail({
    to: [{ email, name }],
    subject: payload.subject,
    htmlContent: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #111827; padding: 24px;">
        <div style="background: linear-gradient(135deg, #4338ca 0%, #7c3aed 100%); border-radius: 16px; padding: 28px; color: #ffffff;">
          <h1 style="margin: 0; font-size: 28px;">${payload.title}</h1>
          <p style="margin: 16px 0 0 0; font-size: 16px; line-height: 1.6; color: rgba(255,255,255,0.92);">${payload.body}</p>
        </div>
        <div style="padding: 28px 8px 8px;">
          <a href="${ctaUrl}" style="display:inline-block;background:#4f46e5;color:#fff;text-decoration:none;padding:14px 22px;border-radius:10px;font-weight:700;">
            ${ctaLabel}
          </a>
          <p style="margin-top: 24px; color: #6b7280; font-size: 12px;">
            Bu bildirim GiderSe Gelir tercihlerinize göre gönderildi. Tercihlerinizi ayarlar sayfasından güncelleyebilirsiniz.
          </p>
        </div>
      </div>
    `,
    textContent: `${payload.title}\n\nMerhaba ${name},\n\n${payload.body}\n\n${ctaLabel}: ${ctaUrl}`,
  })
}

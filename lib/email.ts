/**
 * Brevo (Sendinblue) Email Service Implementation
 * Using REST API v3 to avoid extra dependencies and edge compatibility issues.
 */

/**
 * Production ortamında APP_URL'in doğru ayarlandığını garanti eder.
 */
function getAppUrl(): string {
  const url = process.env.NEXTAUTH_URL || process.env.NEXT_PUBLIC_APP_URL

  if (!url) {
    if (process.env.NODE_ENV === 'production') {
      console.error(
        '❌ KRITIK: NEXT_PUBLIC_APP_URL veya NEXTAUTH_URL environment variable ayarlanmamış!'
      )
      return 'https://giderse-gelir.com' // Fallback production URL
    }
    return 'http://localhost:3000'
  }

  return url
}

const FROM_EMAIL = process.env.FROM_EMAIL || 'noreply@giderse-gelir.com'
const FROM_NAME = process.env.FROM_NAME || 'GiderSe Gelir'
const BREVO_API_KEY = process.env.BREVO_API_KEY

/**
 * Brevo API üzerinden email gönderir
 */
export async function sendEmail(payload: {
  to: { email: string; name?: string }[]
  subject: string
  htmlContent: string
  textContent?: string
}): Promise<{ success: boolean; error?: string }> {
  if (!BREVO_API_KEY) {
    console.error('❌ BREVO_API_KEY bulunamadı')
    return { success: false, error: 'Email servisi yapılandırılmamış' }
  }

  try {
    const response = await fetch('https://api.brevo.com/v3/smtp/email', {
      method: 'POST',
      headers: {
        'accept': 'application/json',
        'api-key': BREVO_API_KEY,
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        sender: { name: FROM_NAME, email: FROM_EMAIL },
        to: payload.to,
        subject: payload.subject,
        htmlContent: payload.htmlContent,
        textContent: payload.textContent,
      }),
    })

    const data = await response.json()

    if (!response.ok) {
      console.error('Brevo API Error:', data)
      return { success: false, error: data.message || 'Email gönderilemedi' }
    }

    return { success: true }
  } catch (error) {
    console.error('Email gönderme hatası:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Bilinmeyen hata',
    }
  }
}

/**
 * Email doğrulama email'i gönderir
 */
export async function sendVerificationEmail(
  email: string,
  name: string,
  token: string
): Promise<{ success: boolean; error?: string }> {
  // Not: Şu an için kayıt aşamasında bu fonksiyon çağrılmıyor (auto-activate aktif)
  const verificationUrl = `${getAppUrl()}/auth/verify-email?token=${token}`

  return sendEmail({
    to: [{ email, name }],
    subject: 'E-posta Adresinizi Doğrulayın',
    htmlContent: `
      <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
          <h1 style="color: white; margin: 0; font-size: 28px;">GiderSe Gelir</h1>
        </div>
        <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px;">
          <h2 style="color: #333; margin-top: 0;">Merhaba ${name},</h2>
          <p>GiderSe Gelir'e hoş geldiniz! Hesabınızı aktifleştirmek için e-posta adresinizi doğrulamanız gerekiyor.</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${verificationUrl}" style="display: inline-block; background: #667eea; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; font-weight: bold;">E-postamı Doğrula</a>
          </div>
          <p style="font-size: 12px; color: #999;">Bu link 24 saat içinde geçerliliğini yitirecektir.</p>
        </div>
      </div>
    `,
    textContent: `Merhaba ${name},\n\nHesabınızı doğrulamak için şu linke tıklayın: ${verificationUrl}`,
  })
}

/**
 * Hoş geldin email'i gönderir
 */
export async function sendWelcomeEmail(
  email: string,
  name: string
): Promise<{ success: boolean; error?: string }> {
  return sendEmail({
    to: [{ email, name }],
    subject: "GiderSe Gelir'e Hoş Geldiniz! 🎉",
    htmlContent: `
      <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: #667eea; padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
          <h1 style="color: white; margin: 0;">Hoş Geldiniz!</h1>
        </div>
        <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px;">
          <h2>Merhaba ${name},</h2>
          <p>Finansal takibinizi kolaylaştırmak için buradayız. Hemen işlemlerinizi girmeye başlayabilirsiniz.</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${getAppUrl()}/dashboard" style="display: inline-block; background: #667eea; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px;">Dashboard'a Git</a>
          </div>
        </div>
      </div>
    `,
  })
}

/**
 * Şifre sıfırlama email'i gönderir
 */
export async function sendPasswordResetEmail(
  email: string,
  name: string,
  resetToken: string
): Promise<{ success: boolean; error?: string }> {
  const resetUrl = `${getAppUrl()}/auth/reset-password?token=${resetToken}`

  return sendEmail({
    to: [{ email, name }],
    subject: 'Şifre Sıfırlama İsteği',
    htmlContent: `
      <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h2>Merhaba ${name},</h2>
        <p>Şifre sıfırlama isteğiniz alındı. Yeni şifre belirlemek için aşağıdaki butona tıklayın:</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${resetUrl}" style="display: inline-block; background: #e53e3e; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px;">Şifremi Sıfırla</a>
        </div>
        <p style="font-size: 12px; color: #999;">Eğer bu isteği siz yapmadıysanız lütfen bu e-postayı dikkate almayın.</p>
      </div>
    `,
  })
}

/**
 * Destek talebi oluşturulduğunda kullanıcıya onay emaili gönderir
 */
export async function sendSupportTicketCreatedEmail(
  email: string,
  name: string,
  ticketNumber: string,
  subject: string
): Promise<{ success: boolean; error?: string }> {
  return sendEmail({
    to: [{ email, name }],
    subject: `Destek Talebiniz Alındı - ${ticketNumber}`,
    htmlContent: `<p>Merhaba ${name}, talebiniz alındı: <b>${subject}</b>. Takip No: ${ticketNumber}</p>`,
  })
}

/**
 * Destek talebine yanıt verildiğinde kullanıcıya email gönderir
 */
export async function sendSupportTicketReplyEmail(
  email: string,
  name: string,
  ticketNumber: string,
  _subject: string,
  replyMessage: string
): Promise<{ success: boolean; error?: string }> {
  return sendEmail({
    to: [{ email, name }],
    subject: `Destek Talebinize Yanıt - ${ticketNumber}`,
    htmlContent: `<p>Merhaba ${name}, talebinize yanıt geldi: ${replyMessage}</p>`,
  })
}

/**
 * Yeni destek talebi geldiğinde admin'e bildirim gönderir
 */
export async function sendAdminNewTicketNotification(
  adminEmail: string,
  ticketNumber: string,
  userName: string,
  userEmail: string,
  subject: string,
  category: string
): Promise<{ success: boolean; error?: string }> {
  return sendEmail({
    to: [{ email: adminEmail }],
    subject: `Yeni Destek Talebi - ${ticketNumber}`,
    htmlContent: `<p>Yeni talep: ${subject} (${userName} - ${userEmail}) - Kategori: ${category}</p>`,
  })
}

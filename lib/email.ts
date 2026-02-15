import { Resend } from 'resend'

// Resend client instance
const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null

/**
 * Production ortamında APP_URL'in doğru ayarlandığını garanti eder.
 * Asla localhost URL'i ile email gönderilmesine izin vermez.
 */
function getAppUrl(): string {
  const url = process.env.NEXTAUTH_URL || process.env.NEXT_PUBLIC_APP_URL

  if (!url) {
    if (process.env.NODE_ENV === 'production') {
      console.error(
        '❌ KRITIK: NEXT_PUBLIC_APP_URL veya NEXTAUTH_URL environment variable ayarlanmamış! ' +
        'Email linkleri localhost olarak gönderilecek. Lütfen Railway dashboard\'dan bu değişkeni ayarlayın.'
      )
      // Production'da fallback olarak hata fırlat - localhost URL'i ile email gönderilmesini engelle
      throw new Error(
        'NEXT_PUBLIC_APP_URL veya NEXTAUTH_URL environment variable ayarlanmalıdır. ' +
        'Email gönderimi için geçerli bir production URL gereklidir.'
      )
    }
    // Sadece development ortamında localhost'a fallback yap
    return 'http://localhost:3000'
  }

  // URL'de localhost varsa ve production ortamındaysak uyar
  if (url.includes('localhost') && process.env.NODE_ENV === 'production') {
    console.error(
      `❌ KRITIK: APP_URL localhost olarak ayarlanmış (${url}). ` +
      'Production ortamında bu değer gerçek domain olmalıdır!'
    )
    throw new Error(
      `APP_URL localhost olarak ayarlanmış (${url}). ` +
      'Production ortamında geçerli bir domain kullanılmalıdır.'
    )
  }

  return url
}

const FROM_EMAIL = process.env.FROM_EMAIL || 'onboarding@resend.dev'
const FROM_NAME = process.env.FROM_NAME || 'GiderSe Gelir'

/**
 * Email doğrulama email'i gönderir
 */
export async function sendVerificationEmail(
  email: string,
  name: string,
  token: string
): Promise<{ success: boolean; error?: string }> {
  if (!resend) {
    console.warn('Resend API key bulunamadı, email gönderilmedi')
    return { success: false, error: 'Email servisi yapılandırılmamış' }
  }

  const verificationUrl = `${getAppUrl()}/auth/verify-email?token=${token}`

  try {
    const { error } = await resend.emails.send({
      from: `${FROM_NAME} <${FROM_EMAIL}>`,
      to: email,
      subject: 'E-posta Adresinizi Doğrulayın',
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
          </head>
          <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
              <h1 style="color: white; margin: 0; font-size: 28px;">GiderSe Gelir</h1>
            </div>
            
            <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px;">
              <h2 style="color: #333; margin-top: 0;">Merhaba ${name},</h2>
              
              <p style="color: #666; font-size: 16px;">
                GiderSe Gelir'e hoş geldiniz! Hesabınızı aktifleştirmek için e-posta adresinizi doğrulamanız gerekiyor.
              </p>
              
              <div style="text-align: center; margin: 30px 0;">
                <a href="${verificationUrl}" 
                   style="display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; font-size: 16px;">
                  E-postamı Doğrula
                </a>
              </div>
              
              <p style="color: #666; font-size: 14px; margin-top: 30px;">
                Veya aşağıdaki linki tarayıcınıza yapıştırabilirsiniz:
              </p>
              <p style="color: #667eea; font-size: 12px; word-break: break-all; background: #f0f0f0; padding: 10px; border-radius: 5px;">
                ${verificationUrl}
              </p>
              
              <p style="color: #999; font-size: 12px; margin-top: 30px; border-top: 1px solid #ddd; padding-top: 20px;">
                Bu e-postayı siz talep etmediyseniz, lütfen görmezden gelin. Bu link 24 saat içinde geçerliliğini yitirecektir.
              </p>
            </div>
            
            <div style="text-align: center; margin-top: 20px; color: #999; font-size: 12px;">
              <p>© ${new Date().getFullYear()} GiderSe Gelir. Tüm hakları saklıdır.</p>
            </div>
          </body>
        </html>
      `,
      text: `
Merhaba ${name},

GiderSe Gelir'e hoş geldiniz! Hesabınızı aktifleştirmek için e-posta adresinizi doğrulamanız gerekiyor.

Doğrulama linki: ${verificationUrl}

Bu link 24 saat içinde geçerliliğini yitirecektir.

Bu e-postayı siz talep etmediyseniz, lütfen görmezden gelin.

© ${new Date().getFullYear()} GiderSe Gelir. Tüm hakları saklıdır.
      `.trim(),
    })

    if (error) {
      console.error('Resend email error:', error)
      return { success: false, error: error.message }
    }

    return { success: true }
  } catch (error) {
    console.error('Email gönderme hatası:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Email gönderilemedi',
    }
  }
}

/**
 * Hoş geldin email'i gönderir
 */
export async function sendWelcomeEmail(
  email: string,
  name: string
): Promise<{ success: boolean; error?: string }> {
  if (!resend) {
    console.warn('Resend API key bulunamadı, email gönderilmedi')
    return { success: false, error: 'Email servisi yapılandırılmamış' }
  }

  try {
    const { error } = await resend.emails.send({
      from: `${FROM_NAME} <${FROM_EMAIL}>`,
      to: email,
      subject: "GiderSe Gelir'e Hoş Geldiniz! 🎉",
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
          </head>
          <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
              <h1 style="color: white; margin: 0; font-size: 28px;">GiderSe Gelir</h1>
            </div>
            
            <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px;">
              <h2 style="color: #333; margin-top: 0;">Merhaba ${name},</h2>
              
              <p style="color: #666; font-size: 16px;">
                GiderSe Gelir ailesine hoş geldiniz! 🎉
              </p>
              
              <p style="color: #666; font-size: 16px;">
                Finansal takibinizi kolaylaştırmak için buradayız. İşte başlamak için bazı ipuçları:
              </p>
              
              <ul style="color: #666; font-size: 16px; padding-left: 20px;">
                <li>İlk hesabınızı oluşturun</li>
                <li>Gelir ve gider kayıtlarınızı ekleyin</li>
                <li>Raporlarınızı inceleyin</li>
                <li>Premium özelliklerimizi keşfedin</li>
              </ul>
              
              <div style="text-align: center; margin: 30px 0;">
                <a href="${getAppUrl()}/dashboard" 
                   style="display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; font-size: 16px;">
                  Dashboard'a Git
                </a>
              </div>
              
              <p style="color: #999; font-size: 12px; margin-top: 30px; border-top: 1px solid #ddd; padding-top: 20px;">
                Sorularınız için her zaman yanınızdayız. İyi kullanımlar!
              </p>
            </div>
            
            <div style="text-align: center; margin-top: 20px; color: #999; font-size: 12px;">
              <p>© ${new Date().getFullYear()} GiderSe Gelir. Tüm hakları saklıdır.</p>
            </div>
          </body>
        </html>
      `,
      text: `
Merhaba ${name},

GiderSe Gelir ailesine hoş geldiniz! 🎉

Finansal takibinizi kolaylaştırmak için buradayız. Dashboard'a gitmek için: ${getAppUrl()}/dashboard

Sorularınız için her zaman yanınızdayız. İyi kullanımlar!

© ${new Date().getFullYear()} GiderSe Gelir. Tüm hakları saklıdır.
      `.trim(),
    })

    if (error) {
      console.error('Resend email error:', error)
      return { success: false, error: error.message }
    }

    return { success: true }
  } catch (error) {
    console.error('Email gönderme hatası:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Email gönderilemedi',
    }
  }
}

/**
 * Şifre sıfırlama email'i gönderir
 */
export async function sendPasswordResetEmail(
  email: string,
  name: string,
  resetToken: string
): Promise<{ success: boolean; error?: string }> {
  if (!resend) {
    console.warn('Resend API key bulunamadı, email gönderilmedi')
    return { success: false, error: 'Email servisi yapılandırılmamış' }
  }

  const resetUrl = `${getAppUrl()}/auth/reset-password?token=${resetToken}`

  try {
    const { error } = await resend.emails.send({
      from: `${FROM_NAME} <${FROM_EMAIL}>`,
      to: email,
      subject: 'Şifre Sıfırlama İsteği',
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
          </head>
          <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
              <h1 style="color: white; margin: 0; font-size: 28px;">GiderSe Gelir</h1>
            </div>
            
            <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px;">
              <h2 style="color: #333; margin-top: 0;">Merhaba ${name},</h2>
              
              <p style="color: #666; font-size: 16px;">
                Şifre sıfırlama isteğiniz alındı. Yeni şifrenizi belirlemek için aşağıdaki butona tıklayın.
              </p>
              
              <div style="text-align: center; margin: 30px 0;">
                <a href="${resetUrl}" 
                   style="display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; font-size: 16px;">
                  Şifremi Sıfırla
                </a>
              </div>
              
              <p style="color: #666; font-size: 14px; margin-top: 30px;">
                Veya aşağıdaki linki tarayıcınıza yapıştırabilirsiniz:
              </p>
              <p style="color: #667eea; font-size: 12px; word-break: break-all; background: #f0f0f0; padding: 10px; border-radius: 5px;">
                ${resetUrl}
              </p>
              
              <p style="color: #999; font-size: 12px; margin-top: 30px; border-top: 1px solid #ddd; padding-top: 20px;">
                Bu e-postayı siz talep etmediyseniz, lütfen görmezden gelin. Bu link 1 saat içinde geçerliliğini yitirecektir.
              </p>
            </div>
            
            <div style="text-align: center; margin-top: 20px; color: #999; font-size: 12px;">
              <p>© ${new Date().getFullYear()} GiderSe Gelir. Tüm hakları saklıdır.</p>
            </div>
          </body>
        </html>
      `,
      text: `
Merhaba ${name},

Şifre sıfırlama isteğiniz alındı. Yeni şifrenizi belirlemek için aşağıdaki linke tıklayın:

${resetUrl}

Bu link 1 saat içinde geçerliliğini yitirecektir.

Bu e-postayı siz talep etmediyseniz, lütfen görmezden gelin.

© ${new Date().getFullYear()} GiderSe Gelir. Tüm hakları saklıdır.
      `.trim(),
    })

    if (error) {
      console.error('Resend email error:', error)
      return { success: false, error: error.message }
    }

    return { success: true }
  } catch (error) {
    console.error('Email gönderme hatası:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Email gönderilemedi',
    }
  }
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
  if (!resend) {
    console.warn('Resend API key bulunamadı, email gönderilmedi')
    return { success: false, error: 'Email servisi yapılandırılmamış' }
  }

  const ticketUrl = `${getAppUrl()}/help/tickets/${ticketNumber}`

  try {
    const { error } = await resend.emails.send({
      from: `${FROM_NAME} <${FROM_EMAIL}>`,
      to: email,
      subject: `Destek Talebiniz Alındı - ${ticketNumber}`,
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
          </head>
          <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
              <h1 style="color: white; margin: 0; font-size: 28px;">GiderSe Gelir</h1>
            </div>
            
            <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px;">
              <h2 style="color: #333; margin-top: 0;">Merhaba ${name},</h2>
              
              <p style="color: #666; font-size: 16px;">
                Destek talebiniz başarıyla alındı. En kısa sürede size dönüş yapacağız.
              </p>
              
              <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #667eea;">
                <p style="margin: 0; color: #333; font-weight: bold;">Talep Numarası:</p>
                <p style="margin: 5px 0 0 0; color: #667eea; font-size: 18px; font-weight: bold;">${ticketNumber}</p>
                <p style="margin: 15px 0 0 0; color: #333; font-weight: bold;">Konu:</p>
                <p style="margin: 5px 0 0 0; color: #666;">${subject}</p>
              </div>
              
              <div style="text-align: center; margin: 30px 0;">
                <a href="${ticketUrl}" 
                   style="display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; font-size: 16px;">
                  Talebimi Görüntüle
                </a>
              </div>
              
              <p style="color: #999; font-size: 12px; margin-top: 30px; border-top: 1px solid #ddd; padding-top: 20px;">
                Talebinizin durumunu yukarıdaki linkten takip edebilirsiniz.
              </p>
            </div>
            
            <div style="text-align: center; margin-top: 20px; color: #999; font-size: 12px;">
              <p>© ${new Date().getFullYear()} GiderSe Gelir. Tüm hakları saklıdır.</p>
            </div>
          </body>
        </html>
      `,
      text: `
Merhaba ${name},

Destek talebiniz başarıyla alındı. En kısa sürede size dönüş yapacağız.

Talep Numarası: ${ticketNumber}
Konu: ${subject}

Talebinizi görüntülemek için: ${ticketUrl}

© ${new Date().getFullYear()} GiderSe Gelir. Tüm hakları saklıdır.
      `.trim(),
    })

    if (error) {
      console.error('Resend email error:', error)
      return { success: false, error: error.message }
    }

    return { success: true }
  } catch (error) {
    console.error('Email gönderme hatası:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Email gönderilemedi',
    }
  }
}

/**
 * Destek talebi durumu değiştiğinde kullanıcıya bildirim gönderir
 */
export async function sendSupportTicketStatusChangedEmail(
  email: string,
  name: string,
  ticketNumber: string,
  subject: string,
  _oldStatus: string,
  newStatus: string
): Promise<{ success: boolean; error?: string }> {
  if (!resend) {
    console.warn('Resend API key bulunamadı, email gönderilmedi')
    return { success: false, error: 'Email servisi yapılandırılmamış' }
  }

  const statusLabels: Record<string, string> = {
    pending: 'Beklemede',
    in_progress: 'İşlemde',
    resolved: 'Çözüldü',
    closed: 'Kapatıldı',
  }

  const ticketUrl = `${getAppUrl()}/help/tickets/${ticketNumber}`

  try {
    const { error } = await resend.emails.send({
      from: `${FROM_NAME} <${FROM_EMAIL}>`,
      to: email,
      subject: `Destek Talebi Durum Güncellemesi - ${ticketNumber}`,
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
          </head>
          <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
              <h1 style="color: white; margin: 0; font-size: 28px;">GiderSe Gelir</h1>
            </div>
            
            <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px;">
              <h2 style="color: #333; margin-top: 0;">Merhaba ${name},</h2>
              
              <p style="color: #666; font-size: 16px;">
                Destek talebinizin durumu güncellendi.
              </p>
              
              <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #667eea;">
                <p style="margin: 0; color: #333; font-weight: bold;">Talep Numarası:</p>
                <p style="margin: 5px 0 0 0; color: #667eea; font-size: 18px; font-weight: bold;">${ticketNumber}</p>
                <p style="margin: 15px 0 0 0; color: #333; font-weight: bold;">Konu:</p>
                <p style="margin: 5px 0 0 0; color: #666;">${subject}</p>
                <p style="margin: 15px 0 0 0; color: #333; font-weight: bold;">Yeni Durum:</p>
                <p style="margin: 5px 0 0 0; color: #667eea; font-size: 16px; font-weight: bold;">${statusLabels[newStatus] || newStatus}</p>
              </div>
              
              <div style="text-align: center; margin: 30px 0;">
                <a href="${ticketUrl}" 
                   style="display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; font-size: 16px;">
                  Talebi Görüntüle
                </a>
              </div>
            </div>
            
            <div style="text-align: center; margin-top: 20px; color: #999; font-size: 12px;">
              <p>© ${new Date().getFullYear()} GiderSe Gelir. Tüm hakları saklıdır.</p>
            </div>
          </body>
        </html>
      `,
      text: `
Merhaba ${name},

Destek talebinizin durumu güncellendi.

Talep Numarası: ${ticketNumber}
Konu: ${subject}
Yeni Durum: ${statusLabels[newStatus] || newStatus}

Talebinizi görüntülemek için: ${ticketUrl}

© ${new Date().getFullYear()} GiderSe Gelir. Tüm hakları saklıdır.
      `.trim(),
    })

    if (error) {
      console.error('Resend email error:', error)
      return { success: false, error: error.message }
    }

    return { success: true }
  } catch (error) {
    console.error('Email gönderme hatası:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Email gönderilemedi',
    }
  }
}

/**
 * Admin yanıtı geldiğinde kullanıcıya bildirim gönderir
 */
export async function sendSupportTicketReplyEmail(
  email: string,
  name: string,
  ticketNumber: string,
  subject: string,
  replyMessage: string
): Promise<{ success: boolean; error?: string }> {
  if (!resend) {
    console.warn('Resend API key bulunamadı, email gönderilmedi')
    return { success: false, error: 'Email servisi yapılandırılmamış' }
  }

  const ticketUrl = `${getAppUrl()}/help/tickets/${ticketNumber}`

  try {
    const { error } = await resend.emails.send({
      from: `${FROM_NAME} <${FROM_EMAIL}>`,
      to: email,
      subject: `Destek Talebinize Yanıt - ${ticketNumber}`,
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
          </head>
          <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
              <h1 style="color: white; margin: 0; font-size: 28px;">GiderSe Gelir</h1>
            </div>
            
            <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px;">
              <h2 style="color: #333; margin-top: 0;">Merhaba ${name},</h2>
              
              <p style="color: #666; font-size: 16px;">
                Destek talebinize yeni bir yanıt geldi.
              </p>
              
              <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #667eea;">
                <p style="margin: 0; color: #333; font-weight: bold;">Talep Numarası:</p>
                <p style="margin: 5px 0 0 0; color: #667eea; font-size: 18px; font-weight: bold;">${ticketNumber}</p>
                <p style="margin: 15px 0 0 0; color: #333; font-weight: bold;">Konu:</p>
                <p style="margin: 5px 0 0 0; color: #666;">${subject}</p>
              </div>
              
              <div style="background: #f0f0f0; padding: 15px; border-radius: 8px; margin: 20px 0;">
                <p style="margin: 0; color: #333; font-weight: bold; margin-bottom: 10px;">Yanıt:</p>
                <p style="margin: 0; color: #666; white-space: pre-wrap;">${replyMessage}</p>
              </div>
              
              <div style="text-align: center; margin: 30px 0;">
                <a href="${ticketUrl}" 
                   style="display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; font-size: 16px;">
                  Talebi Görüntüle
                </a>
              </div>
            </div>
            
            <div style="text-align: center; margin-top: 20px; color: #999; font-size: 12px;">
              <p>© ${new Date().getFullYear()} GiderSe Gelir. Tüm hakları saklıdır.</p>
            </div>
          </body>
        </html>
      `,
      text: `
Merhaba ${name},

Destek talebinize yeni bir yanıt geldi.

Talep Numarası: ${ticketNumber}
Konu: ${subject}

Yanıt:
${replyMessage}

Talebinizi görüntülemek için: ${ticketUrl}

© ${new Date().getFullYear()} GiderSe Gelir. Tüm hakları saklıdır.
      `.trim(),
    })

    if (error) {
      console.error('Resend email error:', error)
      return { success: false, error: error.message }
    }

    return { success: true }
  } catch (error) {
    console.error('Email gönderme hatası:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Email gönderilemedi',
    }
  }
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
  if (!resend) {
    console.warn('Resend API key bulunamadı, email gönderilmedi')
    return { success: false, error: 'Email servisi yapılandırılmamış' }
  }

  const ticketUrl = `${getAppUrl()}/admin/support-tickets/${ticketNumber}`

  try {
    const { error } = await resend.emails.send({
      from: `${FROM_NAME} <${FROM_EMAIL}>`,
      to: adminEmail,
      subject: `Yeni Destek Talebi - ${ticketNumber}`,
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
          </head>
          <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="background: linear-gradient(135deg, #dc2626 0%, #991b1b 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
              <h1 style="color: white; margin: 0; font-size: 28px;">Yeni Destek Talebi</h1>
            </div>
            
            <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px;">
              <p style="color: #666; font-size: 16px;">
                Yeni bir destek talebi alındı ve incelemeniz gerekiyor.
              </p>
              
              <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #dc2626;">
                <p style="margin: 0; color: #333; font-weight: bold;">Talep Numarası:</p>
                <p style="margin: 5px 0 0 0; color: #dc2626; font-size: 18px; font-weight: bold;">${ticketNumber}</p>
                <p style="margin: 15px 0 0 0; color: #333; font-weight: bold;">Kullanıcı:</p>
                <p style="margin: 5px 0 0 0; color: #666;">${userName} (${userEmail})</p>
                <p style="margin: 15px 0 0 0; color: #333; font-weight: bold;">Kategori:</p>
                <p style="margin: 5px 0 0 0; color: #666;">${category}</p>
                <p style="margin: 15px 0 0 0; color: #333; font-weight: bold;">Konu:</p>
                <p style="margin: 5px 0 0 0; color: #666;">${subject}</p>
              </div>
              
              <div style="text-align: center; margin: 30px 0;">
                <a href="${ticketUrl}" 
                   style="display: inline-block; background: linear-gradient(135deg, #dc2626 0%, #991b1b 100%); color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; font-size: 16px;">
                  Talebi İncele
                </a>
              </div>
            </div>
            
            <div style="text-align: center; margin-top: 20px; color: #999; font-size: 12px;">
              <p>© ${new Date().getFullYear()} GiderSe Gelir. Tüm hakları saklıdır.</p>
            </div>
          </body>
        </html>
      `,
      text: `
Yeni Destek Talebi

Yeni bir destek talebi alındı ve incelemeniz gerekiyor.

Talep Numarası: ${ticketNumber}
Kullanıcı: ${userName} (${userEmail})
Kategori: ${category}
Konu: ${subject}

Talebi incelemek için: ${ticketUrl}

© ${new Date().getFullYear()} GiderSe Gelir. Tüm hakları saklıdır.
      `.trim(),
    })

    if (error) {
      console.error('Resend email error:', error)
      return { success: false, error: error.message }
    }

    return { success: true }
  } catch (error) {
    console.error('Email gönderme hatası:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Email gönderilemedi',
    }
  }
}

import webpush from 'web-push'

let configured = false

function configureWebPush() {
  if (configured) {
    return
  }

  const publicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY
  const privateKey = process.env.VAPID_PRIVATE_KEY
  const subject = process.env.VAPID_SUBJECT

  if (!publicKey || !privateKey || !subject) {
    return
  }

  webpush.setVapidDetails(subject, publicKey, privateKey)
  configured = true
}

export function isWebPushConfigured() {
  configureWebPush()

  return configured
}

export function getPublicVapidKey() {
  return process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || null
}

export async function sendWebPushNotification(
  subscription: {
    endpoint: string
    keys: {
      p256dh: string
      auth: string
    }
  },
  payload: {
    title: string
    body: string
    url?: string
    tag?: string
  }
) {
  if (!isWebPushConfigured()) {
    return { success: false, error: 'Web push yapılandırılmamış' }
  }

  try {
    await webpush.sendNotification(subscription, JSON.stringify(payload))
    return { success: true }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Web push gönderilemedi',
    }
  }
}

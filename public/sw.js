self.addEventListener('install', event => {
  event.waitUntil(self.skipWaiting())
})

self.addEventListener('activate', event => {
  event.waitUntil(self.clients.claim())
})

self.addEventListener('push', event => {
  const payload = event.data ? event.data.json() : {}
  const title = payload.title || 'GiderSe Gelir'
  const options = {
    body: payload.body || 'Yeni bir bildiriminiz var.',
    icon: '/favicon.svg',
    badge: '/favicon.svg',
    tag: payload.tag || 'giderse-gelir',
    data: {
      url: payload.url || '/dashboard',
    },
  }

  event.waitUntil(self.registration.showNotification(title, options))
})

self.addEventListener('notificationclick', event => {
  event.notification.close()
  const targetUrl = event.notification.data?.url || '/dashboard'

  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then(clients => {
      const existingClient = clients.find(client => 'focus' in client)
      if (existingClient) {
        existingClient.navigate(targetUrl)
        return existingClient.focus()
      }

      return self.clients.openWindow(targetUrl)
    })
  )
})

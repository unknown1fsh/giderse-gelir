'use client'

import { useEffect, useMemo, useState } from 'react'
import { Bell, BellRing, CheckCheck, ExternalLink, Loader2 } from 'lucide-react'
import {
  Badge,
  Button,
  Drawer,
  DrawerBody,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from '@/components/mosaic'

interface NotificationItem {
  id: number
  title: string
  body: string
  type: string
  priority: string
  payload?: {
    href?: string | null
  }
  createdAt: string
  readAt: string | null
}

function urlBase64ToUint8Array(base64String: string) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4)
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/')
  const rawData = window.atob(base64)
  const outputArray = new Uint8Array(rawData.length)

  for (let index = 0; index < rawData.length; index += 1) {
    outputArray[index] = rawData.charCodeAt(index)
  }

  return outputArray
}

export function NotificationCenter() {
  const [open, setOpen] = useState(false)
  const [items, setItems] = useState<NotificationItem[]>([])
  const [loading, setLoading] = useState(false)
  const [unreadCount, setUnreadCount] = useState(0)
  const [pushConfigured, setPushConfigured] = useState(false)
  const [pushPublicKey, setPushPublicKey] = useState<string | null>(null)
  const [pushPermission, setPushPermission] = useState<NotificationPermission | 'unsupported'>(
    'default'
  )
  const [subscribing, setSubscribing] = useState(false)

  const refreshNotifications = async (sync = true) => {
    setLoading(true)
    try {
      const response = await fetch(`/api/notifications?limit=20&sync=${sync ? 'true' : 'false'}`, {
        credentials: 'include',
      })
      if (!response.ok) {
        throw new Error('Bildirimler yüklenemedi')
      }

      const data = (await response.json()) as {
        items: NotificationItem[]
        unreadCount: number
        push: {
          configured: boolean
          publicKey: string | null
        }
      }

      setItems(data.items)
      setUnreadCount(data.unreadCount)
      setPushConfigured(data.push.configured)
      setPushPublicKey(data.push.publicKey)
    } catch (error) {
      console.error('Notification center error:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void refreshNotifications()
    const interval = window.setInterval(() => {
      void refreshNotifications(false)
    }, 60000)

    if (typeof window !== 'undefined' && 'Notification' in window) {
      setPushPermission(window.Notification.permission)
    } else {
      setPushPermission('unsupported')
    }

    return () => window.clearInterval(interval)
  }, [])

  useEffect(() => {
    if (open) {
      void refreshNotifications()
    }
  }, [open])

  const unreadItems = useMemo(() => items.filter(item => !item.readAt), [items])

  const handleMarkAsRead = async (id: number) => {
    await fetch(`/api/notifications/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ read: true }),
    })
    setItems(prev =>
      prev.map(item => (item.id === id ? { ...item, readAt: new Date().toISOString() } : item))
    )
    setUnreadCount(prev => Math.max(prev - 1, 0))
  }

  const handleMarkAllRead = async () => {
    await fetch('/api/notifications/read-all', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ channel: 'in_app' }),
    })
    setItems(prev => prev.map(item => ({ ...item, readAt: item.readAt || new Date().toISOString() })))
    setUnreadCount(0)
  }

  const handleEnablePush = async () => {
    if (!pushConfigured || !pushPublicKey) {
      return
    }

    if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
      setPushPermission('unsupported')
      return
    }

    setSubscribing(true)
    try {
      const permission = await window.Notification.requestPermission()
      setPushPermission(permission)
      if (permission !== 'granted') {
        return
      }

      const registration = await navigator.serviceWorker.register('/sw.js')
      const existingSubscription = await registration.pushManager.getSubscription()
      const subscription =
        existingSubscription ||
        (await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: urlBase64ToUint8Array(pushPublicKey),
        }))

      await fetch('/api/notifications/push-subscriptions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(subscription),
      })
    } catch (error) {
      console.error('Push subscription error:', error)
    } finally {
      setSubscribing(false)
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="relative rounded-xl p-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
        aria-label="Bildirim merkezi"
      >
        {unreadCount > 0 ? <BellRing className="h-5 w-5" /> : <Bell className="h-5 w-5" />}
        {unreadCount > 0 ? (
          <span className="absolute right-1 top-1 inline-flex min-h-5 min-w-5 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-bold text-primary-foreground">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        ) : null}
      </button>

      <Drawer open={open} onOpenChange={setOpen}>
        <DrawerContent className="sm:max-w-lg">
          <DrawerHeader>
            <DrawerTitle>Bildirim Merkezi</DrawerTitle>
            <DrawerDescription>
              Bütçe, ödeme, kart ve hedef hareketlerini tek panelden yönetin.
            </DrawerDescription>
          </DrawerHeader>

          <DrawerBody className="space-y-4">
            <div className="flex items-center justify-between rounded-2xl border border-border/70 bg-muted/30 p-4">
              <div>
                <p className="text-sm font-semibold text-foreground">Okunmamış bildirimler</p>
                <p className="text-xs text-muted-foreground">
                  {unreadItems.length > 0
                    ? `${unreadItems.length} adet yeni bildirim var.`
                    : 'Tüm bildirimleri okudunuz.'}
                </p>
              </div>
              <Badge variant={unreadItems.length > 0 ? 'info' : 'outline'}>{unreadCount}</Badge>
            </div>

            {pushConfigured ? (
              <div className="rounded-2xl border border-border/70 bg-background p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold text-foreground">Web push</p>
                    <p className="text-xs text-muted-foreground">
                      Anlık hatırlatmalar için tarayıcı bildirimlerini etkinleştirin.
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => void handleEnablePush()}
                    disabled={subscribing || pushPermission === 'granted'}
                  >
                    {subscribing ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                    {pushPermission === 'granted' ? 'Etkin' : 'Etkinleştir'}
                  </Button>
                </div>
              </div>
            ) : null}

            {loading ? (
              <div className="flex min-h-[240px] items-center justify-center text-muted-foreground">
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Bildirimler yükleniyor...
              </div>
            ) : items.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-border px-4 py-10 text-center text-sm text-muted-foreground">
                Şu an gösterilecek bildirim yok.
              </div>
            ) : (
              <div className="space-y-3">
                {items.map(item => (
                  <div
                    key={item.id}
                    className={`rounded-2xl border p-4 transition ${
                      item.readAt
                        ? 'border-border/70 bg-background'
                        : 'border-primary/25 bg-primary/5'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-semibold text-foreground">{item.title}</p>
                          {!item.readAt ? <Badge variant="info">Yeni</Badge> : null}
                        </div>
                        <p className="text-sm text-muted-foreground">{item.body}</p>
                        <p className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
                          {new Date(item.createdAt).toLocaleString('tr-TR')}
                        </p>
                      </div>
                      <div className="flex flex-col items-end gap-2">
                        {!item.readAt ? (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => void handleMarkAsRead(item.id)}
                          >
                            Okundu
                          </Button>
                        ) : null}
                        {item.payload?.href ? (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              window.location.href = item.payload?.href || '/dashboard'
                            }}
                          >
                            <ExternalLink className="mr-2 h-4 w-4" />
                            Git
                          </Button>
                        ) : null}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </DrawerBody>

          <DrawerFooter className="gap-2">
            <Button variant="outline" onClick={() => void handleMarkAllRead()} disabled={unreadCount === 0}>
              <CheckCheck className="mr-2 h-4 w-4" />
              Tümünü okundu yap
            </Button>
            <Button variant="ghost" onClick={() => setOpen(false)}>
              Kapat
            </Button>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    </>
  )
}

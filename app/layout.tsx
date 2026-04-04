import type { Metadata, Viewport } from 'next'
import { Inter, Plus_Jakarta_Sans, Caveat } from 'next/font/google'
import Script from 'next/script'
import './globals.css'
import { UserProvider } from '@/lib/user-context'
import { PeriodProvider } from '@/lib/period-context'
import { GlobalErrorHandler } from '@/lib/error-handler'
import { ToastProvider } from '@/lib/use-toast'
import { PremiumModalProvider } from '@/lib/premium-context'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
})

const jakarta = Plus_Jakarta_Sans({
  subsets: ['latin'],
  variable: '--font-jakarta',
  display: 'swap',
})

const caveat = Caveat({
  subsets: ['latin'],
  variable: '--font-caveat',
  display: 'swap',
  weight: ['400', '500', '600', '700'],
})

export const metadata: Metadata = {
  title: 'GiderSE-Gelir - Kişisel Finans Yönetimi',
  description:
    'Gelir-gider takibi, analizler ve kullanıcı verilerinize dayalı AI tavsiyeleriyle bütçenizi daha akıllı yönetin.',
  icons: {
    icon: '/favicon.svg',
  },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const isProduction = process.env.NODE_ENV === 'production'
  const googleTagId = process.env.NEXT_PUBLIC_GOOGLE_TAG_ID

  return (
    <html lang="tr" className={`${inter.variable} ${jakarta.variable} ${caveat.variable} scroll-smooth`} data-scroll-behavior="smooth">
      <body className={`${inter.className} antialiased`}>
        {/* Analytics — yalnızca production'da yüklenir */}
        {isProduction && (
          <>
            <Script
              src={`https://www.googletagmanager.com/gtag/js?id=${googleTagId}`}
              strategy="afterInteractive"
              crossOrigin="anonymous"
            />
            <Script
              id="google-gtag"
              strategy="afterInteractive"
              dangerouslySetInnerHTML={{
                __html: `
                  window.dataLayer = window.dataLayer || [];
                  function gtag(){dataLayer.push(arguments);}
                  gtag('js', new Date());
                  gtag('config', '${googleTagId}');
                `,
              }}
            />
          </>
        )}
        <GlobalErrorHandler />
        <ToastProvider>
          <UserProvider>
            <PeriodProvider>
              <PremiumModalProvider>{children}</PremiumModalProvider>
            </PeriodProvider>
          </UserProvider>
        </ToastProvider>
      </body>
    </html>
  )
}

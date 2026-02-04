import type { Metadata, Viewport } from 'next'
import { Inter, Plus_Jakarta_Sans } from 'next/font/google'
import Script from 'next/script'
import './globals.css'
import { UserProvider } from '@/lib/user-context'
import { PeriodProvider } from '@/lib/period-context'
import { GlobalErrorHandler } from '@/lib/error-handler'
import { ToastProvider } from '@/lib/use-toast'

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

export const metadata: Metadata = {
  title: 'GiderSE-Gelir - Kişisel Finans Yönetimi',
  description:
    'Gelir-gider takibi, analizler ve kullanıcı verilerinize dayalı AI tavsiyeleriyle bütçenizi daha akıllı yönetin.',
  other: {
    'google-adsense-account': 'ca-pub-9291172027532317',
  },
  icons: {
    icon: '/logo.png',
  },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const googleTagId = process.env.NEXT_PUBLIC_GOOGLE_TAG_ID || 'AW-17814901017'

  return (
    <html lang="tr" className={`${inter.variable} ${jakarta.variable} scroll-smooth`} data-scroll-behavior="smooth">
      <body className={`${inter.className} antialiased`}>
        {/* AdSense Verification */}
        <Script
          async
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-9291172027532317"
          crossOrigin="anonymous"
          strategy="afterInteractive"
        />
        {/* Google tag (gtag.js) */}
        {googleTagId && (
          <>
            <Script
              src={`https://www.googletagmanager.com/gtag/js?id=${googleTagId}`}
              strategy="afterInteractive"
            />
            <Script
              id="google-gtag"
              strategy="afterInteractive"
              dangerouslySetInnerHTML={{
                __html: `
                  window.dataLayer = window.dataLayer || [];
                  function gtag(){dataLayer.push(arguments);}
                  gtag('js', new Date());
                  gtag('config', '${googleTagId}', {
                    'send_page_view': true,
                    'allow_enhanced_conversions': true,
                    'transport_type': 'beacon'
                  });
                `,
              }}
            />
          </>
        )}
        <GlobalErrorHandler />
        <ToastProvider>
          <UserProvider>
            <PeriodProvider>{children}</PeriodProvider>
          </UserProvider>
        </ToastProvider>
      </body>
    </html>
  )
}

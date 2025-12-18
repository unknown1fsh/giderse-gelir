import type { Metadata } from 'next'
import { Inter, Plus_Jakarta_Sans } from 'next/font/google'
import Script from 'next/script'
import './globals.css'
import { UserProvider } from '@/lib/user-context'
import { PeriodProvider } from '@/lib/period-context'
import { GlobalErrorHandler } from '@/lib/error-handler'

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
  icons: {
    icon: '/logo.png',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const googleTagId = process.env.NEXT_PUBLIC_GOOGLE_TAG_ID || 'AW-17814901017'

  return (
    <html lang="tr" className={`${inter.variable} ${jakarta.variable} scroll-smooth`}>
      <body className={`${inter.className} antialiased`}>
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
                  gtag('config', '${googleTagId}');
                `,
              }}
            />
          </>
        )}
        <GlobalErrorHandler />
        <UserProvider>
          <PeriodProvider>{children}</PeriodProvider>
        </UserProvider>
      </body>
    </html>
  )
}

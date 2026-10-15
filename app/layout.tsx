import type { Metadata, Viewport } from 'next'
import { Poppins, Inter } from 'next/font/google'
import './globals.css'

const fontSans = Inter({
  subsets: ['latin'],
  variable: '--font-sans',
  display: 'swap',
  weight: ['400', '500', '600', '700'],
})

const fontDisplay = Poppins({
  subsets: ['latin'],
  variable: '--font-display',
  display: 'swap',
  weight: ['500', '600', '700', '800'],
})

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#0ea5e9',
}

export const metadata: Metadata = {
  title: 'SILAQ — System for Integrated Local Tourism Administration and Quality',
  description:
    'SILAQ (System for Integrated Local Tourism Administration and Quality) adalah platform pariwisata terpadu untuk wisatawan, pengelola destinasi wisata, dan Otoritas Pariwisata Provinsi NTB.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="id" className={`${fontSans.variable} ${fontDisplay.variable} scroll-smooth`} suppressHydrationWarning>
      <body className="min-h-[100dvh] bg-slate-50 text-slate-900 antialiased font-sans">
        {children}
      </body>
    </html>
  )
}

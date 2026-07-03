import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Prinz Logistics',
  description: 'Heavy Machinery & Construction Equipment Rental',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    // 🛡️ CRITICAL FIX: suppressHydrationWarning prevents Next.js from crashing 
    // when browser extensions (like Dashlane/Bitwarden) inject code into the DOM.
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className} suppressHydrationWarning>
        {children}
      </body>
    </html>
  )
}
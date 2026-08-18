import type { Metadata } from 'next'
import { Montserrat } from 'next/font/google'
import Providers from '@/components/Providers'
import './globals.css'

const montserrat = Montserrat({
  variable: '--font-montserrat',
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800'],
})

export const metadata: Metadata = {
  title: 'HomeX Supermercado',
  description: 'Todo lo que necesitás, en un solo lugar.',
}

export default function RootLayout({ children }: LayoutProps<'/'>) {
  return (
    <html lang="es" className={`${montserrat.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-homex-bg text-homex-text font-sans">
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}

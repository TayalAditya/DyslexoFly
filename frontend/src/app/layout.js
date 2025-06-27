import './globals.css'
import { Inter } from 'next/font/google'
import AccessibilityProvider from '@/components/AccessibilityProvider'
import Navbar from '@/components/Navbar'

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: 'DyslexoFly | Words take flight, reading feels right!',
  description: 'Making educational content accessible for dyslexic students',
  icons: {
    icon: '/favicon.ico',
  },
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <AccessibilityProvider>
          <div className="min-h-screen flex flex-col">
            <Navbar />
            <main className="flex-grow">{children}</main>
            <footer className="bg-gray-100 py-4 text-center text-sm text-gray-600">
              DyslexoFly © {new Date().getFullYear()} | Making reading accessible for everyone
            </footer>
          </div>
        </AccessibilityProvider>
      </body>
    </html>
  )
}
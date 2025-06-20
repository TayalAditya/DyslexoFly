import './globals.css'
import { Inter } from 'next/font/google'
import AccessibilityProvider from '@/components/AccessibilityProvider'
import Navbar from '@/components/Navbar'

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: 'DyslexoFly | Words take flight, reading feels right!',
  description: 'Making educational content accessible for dyslexic students',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <AccessibilityProvider>
          <div className="min-h-screen flex flex-col">
            <Navbar />
            <main className="flex-grow">{children}</main>
            <footer className="bg-gray-100">
              <div className="max-w-7xl mx-auto py-6 px-4 overflow-hidden sm:px-6 lg:px-8">
                <p className="text-center text-gray-500 text-sm">
                  &copy; {new Date().getFullYear()} DyslexoFly. All rights reserved.
                </p>
              </div>
            </footer>
          </div>
        </AccessibilityProvider>
      </body>
    </html>
  )
}
import './globals.css'
import { Inter } from 'next/font/google'
import AccessibilityProvider from '@/components/AccessibilityProvider'
import Navbar from '@/components/Navbar'
import PageTransition from '@/components/PageTransition'
import FloatingActionsWrapper from '@/components/FloatingActionsWrapper'
import AccessibilityButton from '@/components/AccessibilityButton'

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: 'DyslexoFly - Accessible Learning Platform for Dyslexic Students',
  description: 'Transforming educational content for dyslexic students with AI-powered tools, text-to-speech, and accessibility features. Making learning accessible for 70M+ dyslexic learners.',
  // ... rest of your metadata
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <AccessibilityProvider>
          <div className="min-h-screen flex flex-col">
            <Navbar />
            <main className="flex-grow">
              <PageTransition>
                {children}
              </PageTransition>
            </main>
            <AccessibilityButton />
            <FloatingActionsWrapper />
            <footer className="bg-gray-100 py-4 text-center text-sm text-gray-600">
              DyslexoFly © {new Date().getFullYear()} | Making reading accessible for everyone
            </footer>
          </div>
        </AccessibilityProvider>
      </body>
    </html>
  )
}

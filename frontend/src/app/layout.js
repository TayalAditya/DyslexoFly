import './globals.css'
import { Inter } from 'next/font/google'
import AccessibilityProvider from '@/components/AccessibilityProvider'
import Navbar from '@/components/Navbar'
import PageTransition from '@/components/PageTransition'
import ConditionalFloatingActions from '@/components/ConditionalFloatingActions'
import AccessibilityButton from '@/components/AccessibilityButton'

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  metadataBase: new URL('https://dyslexofly.vercel.app'),
  title: 'DyslexoFly - Accessible Learning Platform for Dyslexic Students',
  description: 'Transforming educational content for dyslexic students with AI-powered tools, text-to-speech, and accessibility features. Making learning accessible for 70M+ dyslexic learners.',
  keywords: 'dyslexia, education, accessibility, text-to-speech, AI summarization, learning disability, educational technology',
  authors: [{ name: 'Aditya Tayal', url: 'https://github.com/TayalAditya' }, { name: 'Siddhi Pogakwar', url: 'https://github.com/SiddhiPogakwar123' }],
  creator: 'Aditya Tayal & Siddhi Pogakwar',
  publisher: 'DyslexoFly Team',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  icons: {
    icon: [
      { url: '/images/logo.jpg', sizes: '32x32', type: 'image/jpeg' },
      { url: '/images/logo.jpg', sizes: '16x16', type: 'image/jpeg' }
    ],
    apple: [
      { url: '/images/logo.jpg', sizes: '180x180', type: 'image/jpeg' }
    ],
    shortcut: '/images/logo.jpg',
  },
  manifest: '/manifest.json',
  openGraph: {
    title: 'DyslexoFly - Accessible Learning Platform',
    description: 'Transforming educational content for dyslexic students with AI-powered tools',
    url: 'https://dyslexofly.vercel.app',
    siteName: 'DyslexoFly',
    images: [
      {
        url: '/images/logo.jpg',
        width: 800,
        height: 600,
        alt: 'DyslexoFly Logo',
      }
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'DyslexoFly - Accessible Learning Platform',
    description: 'Transforming educational content for dyslexic students with AI-powered tools',
    images: ['/images/logo.jpg'],
    creator: '@TayalAditya',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    google: 'your-google-site-verification',
  },
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
            <ConditionalFloatingActions />
            <footer className="bg-gray-100 py-4 text-center text-sm text-gray-600">
              DyslexoFly © {new Date().getFullYear()} | Making reading accessible for everyone
            </footer>
          </div>
        </AccessibilityProvider>
      </body>
    </html>
  )
}

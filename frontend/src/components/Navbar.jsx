'use client'

import Link from 'next/link'
import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Image from 'next/image'
import AccessibilityMenu from './AccessibilityMenu'

export default function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])
  
  return (
    <motion.nav 
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      className={`fixed w-full z-50 transition-all duration-300 ${
        scrolled 
          ? 'bg-white/95 backdrop-blur-md shadow-lg border-b border-indigo-100' 
          : 'bg-white/80 backdrop-blur-sm shadow-md'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-20">
          <div className="flex items-center">
            <Link href="/" className="flex items-center gap-3 group">
              <div className="relative">
                {/* Beautiful gradient logo that always works */}
                <div className="w-[50px] h-[50px] bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 rounded-xl shadow-lg group-hover:shadow-xl transition-all duration-300 flex items-center justify-center text-white font-bold text-xl border-2 border-white/20">
                  <div className="text-2xl transform group-hover:scale-110 transition-transform duration-300">
                    🦋
                  </div>
                </div>
                <div className="absolute -top-1 -right-1 w-5 h-5 bg-gradient-to-r from-emerald-400 to-cyan-500 rounded-full animate-pulse shadow-md"></div>
                <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </div>
              <div className="flex flex-col">
                <span className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                  DyslexoFly
                </span>
                <span className="text-xs text-indigo-500 font-medium hidden lg:block">
                  Making Learning Accessible 🦋
                </span>
              </div>
            </Link>
            
            <div className="hidden lg:ml-12 lg:flex lg:space-x-2">
              {[
                { href: '/', label: 'Home', icon: '🏠', desc: 'Main Dashboard' },
                { href: '/upload', label: 'Upload', icon: '📤', desc: 'Process Files' },
                { href: '/about', label: 'About', icon: 'ℹ️', desc: 'Learn More' },
                { href: '/project-overview', label: 'Team', icon: '�', desc: 'Our Story' }
              ].map((item) => (
                <Link key={item.href} href={item.href}>
                  <motion.div
                    whileHover={{ y: -3, scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="group relative px-5 py-3 rounded-xl text-gray-600 hover:text-indigo-700 hover:bg-gradient-to-r hover:from-indigo-50 hover:to-purple-50 transition-all duration-300 flex items-center space-x-3 border border-transparent hover:border-indigo-200"
                  >
                    <span className="text-xl group-hover:scale-110 transition-transform">{item.icon}</span>
                    <div className="flex flex-col">
                      <span className="font-semibold text-sm">{item.label}</span>
                      <span className="text-xs text-gray-400 group-hover:text-indigo-400">
                        {item.desc}
                      </span>
                    </div>
                    <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-0 h-1 bg-gradient-to-r from-indigo-500 to-purple-600 group-hover:w-3/4 transition-all duration-300 rounded-full"></div>
                  </motion.div>
                </Link>
              ))}
            </div>
          </div>
          
          <div className="hidden lg:flex items-center space-x-6">
            {/* Quick Feature Badges */}
            <div className="flex items-center space-x-4 text-sm bg-gradient-to-r from-gray-50 to-indigo-50 px-4 py-2 rounded-xl border border-gray-200">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-gray-600 font-medium">7 Languages</span>
              </div>
              <div className="w-px h-4 bg-gray-300"></div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                <span className="text-gray-600 font-medium">AI Powered</span>
              </div>
              <div className="w-px h-4 bg-gray-300"></div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-purple-500 rounded-full animate-pulse"></div>
                <span className="text-gray-600 font-medium">Accessible</span>
              </div>
            </div>
            
            <AccessibilityMenu />
            
            <motion.div
              whileHover={{ scale: 1.05, boxShadow: "0 10px 25px rgba(79, 70, 229, 0.3)" }}
              whileTap={{ scale: 0.95 }}
              className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
            >
              <Link href="/upload" className="flex items-center space-x-2">
                <span className="text-lg">🚀</span>
                <span>Get Started</span>
              </Link>
            </motion.div>
          </div>
          
          <div className="flex items-center md:hidden">
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="inline-flex items-center justify-center p-2 rounded-lg text-gray-400 hover:text-gray-500 hover:bg-gray-100 transition-colors"
            >
              <span className="sr-only">Open main menu</span>
              <motion.svg 
                className="h-6 w-6" 
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor"
                animate={{ rotate: mobileMenuOpen ? 90 : 0 }}
                transition={{ duration: 0.2 }}
              >
                {mobileMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </motion.svg>
            </motion.button>
          </div>
        </div>
      </div>
      
      {/* Mobile menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-white/95 backdrop-blur-md border-t border-indigo-100"
          >
            <div className="px-4 pt-2 pb-3 space-y-1">
              {[
                { href: '/', label: 'Home', icon: '🏠' },
                { href: '/upload', label: 'Upload', icon: '📤' },
                { href: '/about', label: 'About', icon: 'ℹ️' },
                { href: '/project-overview', label: 'Overview', icon: '📊' }
              ].map((item, index) => (
                <motion.div
                  key={item.href}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Link 
                    href={item.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center space-x-3 px-3 py-2 rounded-lg text-base font-medium text-gray-600 hover:text-indigo-700 hover:bg-indigo-50 transition-colors"
                  >
                    <span>{item.icon}</span>
                    <span>{item.label}</span>
                  </Link>
                </motion.div>
              ))}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 }}
                className="px-3 py-2"
              >
                <AccessibilityMenu />
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  )
}
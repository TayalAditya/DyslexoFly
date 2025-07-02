'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { useEffect, useState } from 'react'

export default function WelcomeModal({ isOpen = false, onClose }) {
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)
    return () => setIsMounted(false)
  }, [])

  const handleClose = () => {
    if (onClose) {
      try {
        onClose()
      } catch (error) {
        console.error("Error in onClose handler:", error)
      }
    }
  }

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'auto'
    }
    return () => {
      document.body.style.overflow = 'auto'
    }
  }, [isOpen])

  if (!isOpen || !isMounted) return null

  return (
    <div className="fixed inset-0 z-[1000] overflow-y-auto">
      <AnimatePresence>
        <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75"
            onClick={handleClose}
            aria-hidden="true"
          />

          <span className="hidden sm:inline-block sm:align-middle sm:h-screen">&#8203;</span>

          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="inline-block align-bottom bg-white rounded-2xl px-6 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-2xl sm:w-full sm:p-8"
            style={{
              maxHeight: '90vh',
              overflowY: 'auto',
              position: 'relative',
              zIndex: 2147483647
            }}
            role="dialog"
            aria-modal="true"
          >
            <div className="text-center mb-6">
              <div className="flex items-center justify-center mb-4">
                <img
                  src="/images/logo.jpg"
                  alt="DyslexoFly Logo"
                  className="w-16 h-16 rounded-xl shadow-lg border-2 border-white/20"
                />
              </div>
              <h2 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                Welcome to DyslexoFly! 🦋
              </h2>
              <p className="text-gray-600 mt-2">Making Learning Accessible for 70M+ Dyslexic Learners</p>
            </div>

            {/* Features Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-4 rounded-xl border border-blue-200">
                <div className="text-2xl mb-2">🧠</div>
                <h3 className="font-semibold text-indigo-900 mb-1">AI-Powered Summaries</h3>
                <p className="text-sm text-indigo-700">Get TL;DR, Standard, and Detailed summaries of any document</p>
              </div>
              <div className="bg-gradient-to-br from-purple-50 to-pink-50 p-4 rounded-xl border border-purple-200">
                <div className="text-2xl mb-2">🎵</div>
                <h3 className="font-semibold text-purple-900 mb-1">Multi-Language TTS</h3>
                <p className="text-sm text-purple-700">Listen to content in English, Hindi with multiple voice options</p>
              </div>
              <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-4 rounded-xl border border-green-200">
                <div className="text-2xl mb-2">🎨</div>
                <h3 className="font-semibold text-green-900 mb-1">Dyslexia-Friendly Design</h3>
                <p className="text-sm text-green-700">Optimized fonts, colors, and layouts for better readability</p>
              </div>
              <div className="bg-gradient-to-br from-orange-50 to-red-50 p-4 rounded-xl border border-orange-200">
                <div className="text-2xl mb-2">📱</div>
                <h3 className="font-semibold text-orange-900 mb-1">Complete Accessibility</h3>
                <p className="text-sm text-orange-700">Keyboard navigation, screen reader support, and more</p>
              </div>
            </div>

            <div className="bg-gradient-to-r from-indigo-50 via-purple-50 to-pink-50 p-6 rounded-xl mb-6">
              <h3 className="text-lg font-semibold text-indigo-900 mb-3">🚀 Quick Start Guide</h3>
              <div className="space-y-2 text-sm">
                <div className="flex items-center space-x-2">
                  <span className="w-6 h-6 bg-indigo-500 text-white rounded-full flex items-center justify-center text-xs font-bold">1</span>
                  <span className="text-gray-700">Upload your document (PDF, DOCX, TXT)</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="w-6 h-6 bg-purple-500 text-white rounded-full flex items-center justify-center text-xs font-bold">2</span>
                  <span className="text-gray-700">Choose your preferred summary type</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="w-6 h-6 bg-pink-500 text-white rounded-full flex items-center justify-center text-xs font-bold">3</span>
                  <span className="text-gray-700">Listen to audio narration or read enhanced text</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="w-6 h-6 bg-green-500 text-white rounded-full flex items-center justify-center text-xs font-bold">4</span>
                  <span className="text-gray-700">Download complete package for offline use</span>
                </div>
              </div>
            </div>

            <div className="text-center">
              <div className="flex items-center justify-center space-x-4 mb-4">
                <span className="text-sm text-gray-500">Developed by</span>
                <div className="flex items-center space-x-2">
                  <div className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center text-xs font-medium">
                    AT
                  </div>
                  <span className="text-sm font-medium text-gray-700">Aditya Tayal</span>
                </div>
                <span className="text-gray-400">&</span>
                <div className="flex items-center space-x-2">
                  <div className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center text-xs font-medium">
                    SP
                  </div>
                  <span className="text-sm font-medium text-gray-700">Siddhi Pogakwar</span>
                </div>
              </div>

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleClose}
                className="w-full py-3 px-6 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all"
              >
                Let's Get Started! 🚀
              </motion.button>
            </div>
          </motion.div>
        </div>
      </AnimatePresence>
    </div>
  )
}

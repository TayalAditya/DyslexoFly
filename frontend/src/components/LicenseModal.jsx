'use client'

// React import for JSX
import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'

export default function LicenseModal({ isOpen, onClose }) {
  // Controlled by parent: isOpen and onClose
  if (!isOpen) return null

  const handleAccept = () => {
    // Accept license, close modal
    onClose()
  }

  return (
    <AnimatePresence>
      {/* Controlled visibility */}
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        >
          <motion.div
            initial={{ scale: 0.8, opacity: 0, y: 50 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.8, opacity: 0, y: 50 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full max-h-[80vh] overflow-y-auto"
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 p-6 text-white">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                    <span className="text-2xl">⚖️</span>
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold">Open Source License</h2>
                    <p className="text-indigo-100">MIT License - Free & Open Source</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Content */}
            <div className="p-6 space-y-6">
              {/* Project Info */}
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-6 border border-blue-200">
                <h3 className="text-xl font-bold text-gray-900 mb-3 flex items-center">
                  <span className="text-2xl mr-3">🚀</span>
                  DyslexoFly - Accessible Learning Platform
                </h3>
                <div className="space-y-2 text-gray-700">
                  <p><strong>Repository:</strong> https://github.com/TayalAditya/DyslexoFly</p>
                  <p><strong>License:</strong> MIT License</p>
                  <p><strong>Copyright:</strong> © 2025 Aditya Tayal</p>
                  <p><strong>Team:</strong> The Kamand Krew</p>
                </div>
              </div>

              {/* MIT License Text */}
              <div className="bg-gray-50 rounded-2xl p-6 border border-gray-200">
                <h4 className="font-bold text-gray-900 mb-4">MIT License</h4>
                <div className="text-sm text-gray-700 space-y-3 leading-relaxed">
                  <p>
                    <strong>Copyright (c) 2025 Aditya Tayal</strong>
                  </p>
                  <p>
                    Permission is hereby granted, free of charge, to any person obtaining a copy
                    of this software and associated documentation files (the "Software"), to deal
                    in the Software without restriction, including without limitation the rights
                    to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
                    copies of the Software, and to permit persons to whom the Software is
                    furnished to do so, subject to the following conditions:
                  </p>
                  <p>
                    The above copyright notice and this permission notice shall be included in all
                    copies or substantial portions of the Software.
                  </p>
                  <p className="font-medium">
                    THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
                    IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
                    FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
                    AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
                    LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
                    OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
                    SOFTWARE.
                  </p>
                </div>
              </div>

              {/* What this means */}
              <div className="bg-green-50 rounded-2xl p-6 border border-green-200">
                <h4 className="font-bold text-green-900 mb-4 flex items-center">
                  <span className="text-xl mr-2">✅</span>
                  What this means for you:
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-green-800">
                  <div className="space-y-2">
                    <p>✓ Free to use for any purpose</p>
                    <p>✓ Free to modify and customize</p>
                    <p>✓ Free to distribute and share</p>
                  </div>
                  <div className="space-y-2">
                    <p>✓ Free for commercial use</p>
                    <p>✓ No licensing fees required</p>
                    <p>✓ Open source transparency</p>
                  </div>
                </div>
              </div>

              {/* Team Credits */}
              <div className="bg-purple-50 rounded-2xl p-6 border border-purple-200">
                <h4 className="font-bold text-purple-900 mb-4 flex items-center">
                  <span className="text-xl mr-2">👥</span>
                  Development Team
                </h4>
                <div className="space-y-3">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-purple-200 rounded-full flex items-center justify-center">
                      <span className="font-bold text-purple-800">AT</span>
                    </div>
                    <div>
                      <p className="font-medium text-purple-900">Aditya Tayal</p>
                      <p className="text-sm text-purple-700">Full-Stack Developer & AI Integration</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-purple-200 rounded-full flex items-center justify-center">
                      <span className="font-bold text-purple-800">SP</span>
                    </div>
                    <div>
                      <p className="font-medium text-purple-900">Siddhi Pogakwar</p>
                      <p className="text-sm text-purple-700">TTS Training & Text Analysis</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-3 pt-4">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleAccept}
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-medium shadow-lg hover:shadow-xl transition-all"
                >
                  ✅ I Understand & Accept
                </motion.button>
                <motion.a
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  href="https://github.com/TayalAditya/DyslexoFly"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 px-6 py-3 bg-gray-800 text-white rounded-xl font-medium text-center shadow-lg hover:shadow-xl transition-all flex items-center justify-center"
                >
                  <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
                    <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
                  </svg>
                  View on GitHub
                </motion.a>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
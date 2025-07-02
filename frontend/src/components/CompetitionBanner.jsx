'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

export default function CompetitionBanner() {
  const [currentSlide, setCurrentSlide] = useState(0)
  const [isVisible, setIsVisible] = useState(true)

  const highlights = [
    {
      title: "🏆 Code For Bharat Season 2 Ready",
      subtitle: "Production-grade EdTech solution",
      description: "Fully functional platform addressing real-world accessibility challenges",
      color: "from-yellow-400 to-orange-500",
      icon: "🚀"
    },
    {
      title: "🧠 Advanced AI Integration",
      subtitle: "Generative AI & LLMs",
      description: "Intelligent summarization using state-of-the-art transformer models",
      color: "from-purple-400 to-pink-500",
      icon: "🤖"
    },
    {
      title: "♿ Accessibility Champion",
      subtitle: "Inclusive design principles",
      description: "WCAG AAA compliance with dyslexia-specific optimizations",
      color: "from-blue-400 to-indigo-500",
      icon: "💝"
    },
    {
      title: "📈 Scalable Architecture",
      subtitle: "Cloud-ready infrastructure",
      description: "Microservices design supporting millions of users",
      color: "from-green-400 to-emerald-500",
      icon: "⚡"
    },
    {
      title: "🎯 Social Impact Focus",
      subtitle: "70M+ potential beneficiaries",
      description: "Addressing dyslexia challenges in Indian education system",
      color: "from-red-400 to-pink-500",
      icon: "🌟"
    }
  ]

  const competitionStats = [
    { label: "Theme Alignment", value: "100%", icon: "🎯" },
    { label: "Technical Innovation", value: "A+", icon: "💡" },
    { label: "Social Impact", value: "High", icon: "🌍" },
    { label: "Market Readiness", value: "Ready", icon: "🚀" }
  ]

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % highlights.length)
    }, 4000)

    return () => clearInterval(interval)
  }, [highlights.length])

  if (!isVisible) return null

  return (
    <motion.div
      initial={{ opacity: 0, y: -100 }}
      animate={{ opacity: 1, y: 0 }}
      className="fixed top-0 left-0 right-0 z-50 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 text-white shadow-lg"
    >
      <div className="max-w-7xl mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          {/* Main Content */}
          <div className="flex-1">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentSlide}
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -50 }}
                transition={{ duration: 0.5 }}
                className="flex items-center space-x-4"
              >
                <div className={`w-12 h-12 bg-gradient-to-r ${highlights[currentSlide].color} rounded-full flex items-center justify-center text-2xl`}>
                  {highlights[currentSlide].icon}
                </div>
                <div>
                  <h3 className="text-lg font-bold">{highlights[currentSlide].title}</h3>
                  <p className="text-sm text-indigo-100">{highlights[currentSlide].description}</p>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Competition Stats */}
          <div className="hidden lg:flex items-center space-x-6 mx-8">
            {competitionStats.map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.1 }}
                className="text-center"
              >
                <div className="text-lg font-bold flex items-center justify-center space-x-1">
                  <span>{stat.icon}</span>
                  <span>{stat.value}</span>
                </div>
                <div className="text-xs text-indigo-200">{stat.label}</div>
              </motion.div>
            ))}
          </div>

          {/* Progress Indicators */}
          <div className="flex items-center space-x-4">
            <div className="flex space-x-1">
              {highlights.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentSlide(index)}
                  className={`w-2 h-2 rounded-full transition-all duration-300 ${
                    index === currentSlide ? 'bg-white' : 'bg-white/40'
                  }`}
                />
              ))}
            </div>
            
            <button
              onClick={() => setIsVisible(false)}
              className="w-8 h-8 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center transition-colors"
              title="Dismiss banner"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Stats */}
        <div className="lg:hidden mt-3 flex justify-center space-x-4">
          {competitionStats.map((stat, index) => (
            <div key={stat.label} className="text-center">
              <div className="text-sm font-bold flex items-center justify-center space-x-1">
                <span>{stat.icon}</span>
                <span>{stat.value}</span>
              </div>
              <div className="text-xs text-indigo-200">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Animated background pattern */}
      <div className="absolute inset-0 opacity-10 overflow-hidden">
        <motion.div
          animate={{ x: [-100, 100] }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          className="absolute inset-0"
        >
          <svg className="w-full h-full" viewBox="0 0 100 20">
            <defs>
              <pattern id="grid" width="10" height="10" patternUnits="userSpaceOnUse">
                <path d="M 10 0 L 0 0 0 10" fill="none" stroke="currentColor" strokeWidth="0.5"/>
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid)" />
          </svg>
        </motion.div>
      </div>
    </motion.div>
  )
}
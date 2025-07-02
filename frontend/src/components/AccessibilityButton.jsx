'use client'

import { motion } from 'framer-motion'
import { useRouter } from 'next/navigation'

export default function AccessibilityButton() {
  const router = useRouter()

  const handleClick = () => {
    router.push('/')
  }

  return (
    <div className="fixed top-1/2 left-4 -translate-y-1/2 z-50">
      <motion.button
        onClick={handleClick}
        className="relative w-14 h-14 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-full shadow-lg flex items-center justify-center"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        title="Go to Home"
      >
        <span className="absolute inset-0 rounded-full bg-white opacity-20 animate-ping"></span>
        <span className="text-3xl">♿</span>
      </motion.button>
    </div>
  )
}

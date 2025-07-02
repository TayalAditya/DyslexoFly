'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'

export default function UploadButton({ 
  size = 'medium', 
  variant = 'primary', 
  className = '',
  showIcon = true,
  children
}) {
  const sizeClasses = {
    small: 'px-4 py-2 text-sm',
    medium: 'px-6 py-3 text-base',
    large: 'px-8 py-4 text-lg'
  }
  
  const variantClasses = {
    primary: 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white',
    secondary: 'bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 text-white',
    outline: 'border-2 border-purple-600 text-purple-600 hover:bg-purple-600 hover:text-white'
  }

  const defaultText = children || 'Upload Document'

  return (
    <Link href="/upload">
      <motion.div
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className={`
          inline-flex items-center justify-center font-medium rounded-xl 
          shadow-lg hover:shadow-xl transition-all duration-300 
          ${sizeClasses[size]} ${variantClasses[variant]} ${className}
        `}
      >
        {showIcon && (
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
          </svg>
        )}
        {defaultText}
      </motion.div>
    </Link>
  )
}

'use client'

import { createContext, useState, useEffect, useContext } from 'react'

const AccessibilityContext = createContext({
  fontFamily: 'Inter var, sans-serif',
  setFontFamily: () => {},
  fontSize: 'medium',
  setFontSize: () => {},
  lineSpacing: 'normal',
  setLineSpacing: () => {}
})

export function useAccessibility() {
  return useContext(AccessibilityContext)
}

export default function AccessibilityProvider({ children }) {
  // Load initial settings from localStorage if available
  const [fontFamily, setFontFamily] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('fontFamily') || 'Inter var, sans-serif'
    }
    return 'Inter var, sans-serif'
  })
  const [fontSize, setFontSize] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('fontSize') || 'medium'
    }
    return 'medium'
  })
  const [lineSpacing, setLineSpacing] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('lineSpacing') || 'normal'
    }
    return 'normal'
  })

  // Font size mappings
  const fontSizeMap = {
    small: '16px',
    medium: '18px',
    large: '20px',
    'x-large': '22px',
  }

  // Line height mappings
  const lineSpacingMap = {
    condensed: '1.3',
    normal: '1.5',
    spaced: '1.8',
    'extra-spaced': '2.0',
  }

  // Apply settings to the document
  useEffect(() => {
    if (typeof document !== 'undefined') {
      // Update CSS variables
      document.documentElement.style.setProperty('--font-family', fontFamily)
      document.documentElement.style.setProperty('--font-size', fontSizeMap[fontSize])
      document.documentElement.style.setProperty('--line-height', lineSpacingMap[lineSpacing])
    }
  }, [fontFamily, fontSize, lineSpacing])

  // Save settings to localStorage when changed
  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('fontFamily', fontFamily)
        localStorage.setItem('fontSize', fontSize)
        localStorage.setItem('lineSpacing', lineSpacing)
      } catch (e) {
        console.error('Failed to save accessibility settings:', e)
      }
    }
  }, [fontFamily, fontSize, lineSpacing])

  const value = {
    fontFamily, setFontFamily,
    fontSize, setFontSize,
    lineSpacing, setLineSpacing
  }

  return (
    <AccessibilityContext.Provider value={value}>
      {children}
    </AccessibilityContext.Provider>
  )
}

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
  const [fontFamily, setFontFamily] = useState('Inter var, sans-serif')
  const [fontSize, setFontSize] = useState('medium')
  const [lineSpacing, setLineSpacing] = useState('normal')
  
  // Font size in pixels based on selection
  const fontSizeMap = {
    small: '16px',
    medium: '18px',
    large: '20px',
    'x-large': '22px',
  }
  
  // Line height based on selection
  const lineSpacingMap = {
    condensed: '1.3',
    normal: '1.5',
    spaced: '1.8',
    'extra-spaced': '2.0',
  }
  
  // Apply settings to the document
  useEffect(() => {
    document.documentElement.style.setProperty('--font-family', fontFamily)
    document.documentElement.style.setProperty('--font-size', fontSizeMap[fontSize])
    document.documentElement.style.setProperty('--line-height', lineSpacingMap[lineSpacing])
  }, [fontFamily, fontSize, lineSpacing])
  
  // Load settings from localStorage on mount
  useEffect(() => {
    try {
      const savedFont = localStorage.getItem('fontFamily')
      const savedSize = localStorage.getItem('fontSize')
      const savedSpacing = localStorage.getItem('lineSpacing')
      
      if (savedFont) setFontFamily(savedFont)
      if (savedSize) setFontSize(savedSize)
      if (savedSpacing) setLineSpacing(savedSpacing)
    } catch (e) {
      console.error('Failed to load accessibility settings:', e)
    }
  }, [])
  
  // Save settings to localStorage when changed
  useEffect(() => {
    try {
      localStorage.setItem('fontFamily', fontFamily)
      localStorage.setItem('fontSize', fontSize)
      localStorage.setItem('lineSpacing', lineSpacing)
    } catch (e) {
      console.error('Failed to save accessibility settings:', e)
    }
  }, [fontFamily, fontSize, lineSpacing])
  
  const value = {
    fontFamily,
    setFontFamily,
    fontSize,
    setFontSize,
    lineSpacing, 
    setLineSpacing
  }
  
  return (
    <AccessibilityContext.Provider value={value}>
      {children}
    </AccessibilityContext.Provider>
  )
}

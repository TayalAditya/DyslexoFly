'use client'

import { createContext, useState, useEffect, useContext, useMemo } from 'react'

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
  
  const fontSizeMap = useMemo(() => ({
    small: '16px',
    medium: '18px',
    large: '20px',
    'x-large': '22px',
  }), [])
  
  const lineSpacingMap = useMemo(() => ({
    condensed: '1.3',
    normal: '1.5',
    spaced: '1.8',
    'extra-spaced': '2.0',
  }), [])
  
  useEffect(() => {
    document.documentElement.style.setProperty('--font-family', fontFamily)
    document.documentElement.style.setProperty('--font-size', fontSizeMap[fontSize])
    document.documentElement.style.setProperty('--line-height', lineSpacingMap[lineSpacing])
  }, [fontFamily, fontSize, lineSpacing, fontSizeMap, lineSpacingMap])
  
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
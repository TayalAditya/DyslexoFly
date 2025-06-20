'use client'

import { createContext, useState, useEffect, useContext } from 'react'

// Create context with default values instead of null
const AccessibilityContext = createContext({
  fontFamily: 'Inter var, sans-serif',
  setFontFamily: () => {},
  fontSize: 'medium',
  setFontSize: () => {},
  lineSpacing: 'normal',
  setLineSpacing: () => {},
  theme: 'light',
  setTheme: () => {}
})

export function useAccessibility() {
  return useContext(AccessibilityContext)
}

export default function AccessibilityProvider({ children }) {
  const [fontFamily, setFontFamily] = useState('Inter var, sans-serif')
  const [fontSize, setFontSize] = useState('medium')
  const [lineSpacing, setLineSpacing] = useState('normal')
  const [theme, setTheme] = useState('light')
  
  // Font size mapping
  const fontSizeMap = {
    small: '16px',
    medium: '18px',
    large: '20px',
    'x-large': '22px',
  }
  
  // Line spacing mapping
  const lineSpacingMap = {
    condensed: '1.3',
    normal: '1.5',
    spaced: '1.8',
    'extra-spaced': '2.0',
  }
  
  // Apply settings to document
  useEffect(() => {
    document.documentElement.style.setProperty('--font-family', fontFamily)
    document.documentElement.style.setProperty('--font-size', fontSizeMap[fontSize])
    document.documentElement.style.setProperty('--line-height', lineSpacingMap[lineSpacing])
    
    document.documentElement.classList.remove('theme-light', 'theme-cream', 'theme-dark')
    document.documentElement.classList.add(`theme-${theme}`)
  }, [fontFamily, fontSize, lineSpacing, theme])
  
  // Load settings from localStorage on mount
  useEffect(() => {
    try {
      const savedFont = localStorage.getItem('fontFamily')
      const savedSize = localStorage.getItem('fontSize')
      const savedSpacing = localStorage.getItem('lineSpacing')
      const savedTheme = localStorage.getItem('theme')
      
      if (savedFont) setFontFamily(savedFont)
      if (savedSize) setFontSize(savedSize)
      if (savedSpacing) setLineSpacing(savedSpacing)
      if (savedTheme) setTheme(savedTheme)
    } catch (e) {
      console.error('Could not load accessibility settings:', e)
    }
  }, [])
  
  // Save settings to localStorage when changed
  useEffect(() => {
    try {
      localStorage.setItem('fontFamily', fontFamily)
      localStorage.setItem('fontSize', fontSize)
      localStorage.setItem('lineSpacing', lineSpacing)
      localStorage.setItem('theme', theme)
    } catch (e) {
      console.error('Could not save accessibility settings:', e)
    }
  }, [fontFamily, fontSize, lineSpacing, theme])
  
  const contextValue = {
    fontFamily,
    setFontFamily,
    fontSize,
    setFontSize,
    lineSpacing, 
    setLineSpacing,
    theme,
    setTheme
  }
  
  return (
    <AccessibilityContext.Provider value={contextValue}>
      {children}
    </AccessibilityContext.Provider>
  )
}
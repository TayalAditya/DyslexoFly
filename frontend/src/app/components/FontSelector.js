'use client'

import { useState, useEffect } from 'react'

export default function FontSelector() {
  const [fontFamily, setFontFamily] = useState('Arial')
  
  const fonts = [
    { name: 'Default', value: 'Arial, sans-serif' },
    { name: 'OpenDyslexic', value: 'OpenDyslexic, Arial, sans-serif' },
    { name: 'Comic Sans MS', value: '"Comic Sans MS", cursive, sans-serif' },
    { name: 'Lexend', value: 'Lexend, Arial, sans-serif' },
  ]
  
  // Apply font to document when changed
  useEffect(() => {
    document.body.style.fontFamily = fontFamily
    // Save preference
    localStorage.setItem('preferredFont', fontFamily)
  }, [fontFamily])
  
  // Load preference on mount
  useEffect(() => {
    const savedFont = localStorage.getItem('preferredFont')
    if (savedFont) {
      setFontFamily(savedFont)
    }
  }, [])
  
  return (
    <div className="mb-4">
      <label htmlFor="font-select" className="mr-2 font-medium">
        Text Font:
      </label>
      <select 
        id="font-select"
        value={fontFamily}
        onChange={(e) => setFontFamily(e.target.value)}
        className="py-1 px-2 border rounded"
      >
        {fonts.map((font) => (
          <option key={font.name} value={font.value}>
            {font.name}
          </option>
        ))}
      </select>
    </div>
  )
}
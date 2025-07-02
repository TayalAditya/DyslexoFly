'use client'

import { useState } from 'react'
import { useAccessibility } from './AccessibilityProvider'

export default function AccessibilityMenu() {
  const [isOpen, setIsOpen] = useState(false)
  const {
    fontFamily, setFontFamily,
    fontSize, setFontSize,
    lineSpacing, setLineSpacing,
    theme, setTheme
  } = useAccessibility()
  
  return (
    <div className="relative">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 rounded-full bg-blue-100 hover:bg-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
        aria-label="Accessibility settings"
      >
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
          <path strokeLinecap="round" strokeLinejoin="round" d="M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 5.25h.008v.008H12v-.008Z" />
        </svg>
      </button>
      
      {isOpen && (
        <div className="absolute right-0 mt-2 w-64 bg-white shadow-lg rounded-md p-4 z-50 border border-gray-200">
          <h3 className="text-lg font-semibold mb-4">Accessibility Settings</h3>
          
          <div className="mb-3">
            <label className="block text-sm font-medium text-gray-700 mb-1">Font Type</label>
            <select
              value={fontFamily}
              onChange={(e) => setFontFamily(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            >
              <option value="Inter var, sans-serif">Default</option>
              <option value="OpenDyslexic, sans-serif">OpenDyslexic</option>
              <option value="'Comic Sans MS', cursive, sans-serif">Comic Sans MS</option>
              <option value="'Lexend', sans-serif">Lexend</option>
            </select>
          </div>
          
          <div className="mb-3">
            <label className="block text-sm font-medium text-gray-700 mb-1">Font Size</label>
            <select
              value={fontSize}
              onChange={(e) => setFontSize(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            >
              <option value="small">Small</option>
              <option value="medium">Medium</option>
              <option value="large">Large</option>
              <option value="x-large">Extra Large</option>
            </select>
          </div>
          
          <div className="mb-3">
            <label className="block text-sm font-medium text-gray-700 mb-1">Line Spacing</label>
            <select
              value={lineSpacing}
              onChange={(e) => setLineSpacing(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            >
              <option value="condensed">Condensed</option>
              <option value="normal">Normal</option>
              <option value="spaced">Spaced</option>
              <option value="extra-spaced">Extra Spaced</option>
            </select>
          </div>
          
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">Theme</label>
            <div className="grid grid-cols-3 gap-2">
              <button
                onClick={() => setTheme('light')}
                className={`p-2 rounded ${theme === 'light' ? 'ring-2 ring-blue-500' : 'border border-gray-300'}`}
              >
                <div className="h-6 bg-white border border-gray-200"></div>
                <span className="text-xs mt-1 block">Light</span>
              </button>
              <button
                onClick={() => setTheme('cream')}
                className={`p-2 rounded ${theme === 'cream' ? 'ring-2 ring-blue-500' : 'border border-gray-300'}`}
              >
                <div className="h-6 bg-amber-50 border border-gray-200"></div>
                <span className="text-xs mt-1 block">Cream</span>
              </button>
              <button
                onClick={() => setTheme('dark')}
                className={`p-2 rounded ${theme === 'dark' ? 'ring-2 ring-blue-500' : 'border border-gray-300'}`}
              >
                <div className="h-6 bg-gray-800 border border-gray-700"></div>
                <span className="text-xs mt-1 block">Dark</span>
              </button>
            </div>
          </div>
          
          <button
            onClick={() => setIsOpen(false)}
            className="w-full py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Close
          </button>
        </div>
      )}
    </div>
  )
}
'use client'

import { useState, useRef, useEffect } from 'react'
import { useAccessibility } from './AccessibilityProvider'

export default function TextPane({ content, currentPlayingIndex = -1, onSelectText }) {
  const { fontFamily } = useAccessibility()
  const contentRef = useRef(null)
  const [words, setWords] = useState([])
  
  useEffect(() => {
    if (content) {
      // Split content into words for highlighting during playback
      setWords(content.split(/\s+/))
    }
  }, [content])

  // Scroll to currently playing word
  useEffect(() => {
    if (currentPlayingIndex >= 0 && contentRef.current) {
      const wordElements = contentRef.current.querySelectorAll('.word')
      if (wordElements[currentPlayingIndex]) {
        wordElements[currentPlayingIndex].scrollIntoView({
          behavior: 'smooth',
          block: 'center'
        })
      }
    }
  }, [currentPlayingIndex])

  if (!content) {
    return (
      <div className="h-full flex items-center justify-center">
        <p className="text-gray-500">No content available</p>
      </div>
    )
  }

  return (
    <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg p-5 h-full overflow-y-auto border border-indigo-100">
      <div className="flex justify-between mb-4">
        <h2 className="font-bold text-lg text-indigo-900 flex items-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-indigo-600" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clipRule="evenodd" />
          </svg>
          Document Text
        </h2>
        <div className="flex space-x-2">
          <button
            onClick={() => navigator.clipboard.writeText(content)}
            className="text-indigo-600 hover:text-indigo-800 transition-colors p-1"
            title="Copy to clipboard"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path d="M8 2a1 1 0 000 2h2a1 1 0 100-2H8z" />
              <path d="M3 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v6h-4.586l1.293-1.293a1 1 0 00-1.414-1.414l-3 3a1 1 0 000 1.414l3 3a1 1 0 001.414-1.414L10.414 13H15v3a2 2 0 01-2 2H5a2 2 0 01-2-2V5zM15 11h2a1 1 0 110 2h-2v-2z" />
            </svg>
          </button>
          <button
            onClick={() => {
              const blob = new Blob([content], { type: 'text/plain' })
              const url = URL.createObjectURL(blob)
              const a = document.createElement('a')
              a.href = url
              a.download = 'document_text.txt'
              document.body.appendChild(a)
              a.click()
              document.body.removeChild(a)
              URL.revokeObjectURL(url)
            }}
            className="text-indigo-600 hover:text-indigo-800 transition-colors p-1"
            title="Download as text"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </button>
        </div>
      </div>
      
      <div 
        ref={contentRef}
        className="accessible-content dyslexic-friendly-text p-4 bg-gradient-to-r from-amber-50 to-orange-50 rounded-lg border border-amber-100"
        style={{ fontFamily }}
      >
        {words.map((word, index) => (
          <span 
            key={index}
            className={`word ${currentPlayingIndex === index ? 'bg-amber-200 px-1 py-0.5 rounded transition-colors duration-300' : ''}`}
            onClick={() => onSelectText && onSelectText(index)}
          >
            {word}{' '}
          </span>
        ))}
      </div>
    </div>
  )
}
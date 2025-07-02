'use client'

import { useState, useEffect } from 'react'

export default function DocumentNavigation({ content }) {
  const [headings, setHeadings] = useState([])
  const [isOpen, setIsOpen] = useState(true)
  
  useEffect(() => {
    if (!content) return

    // Extract heading-like structures from the text
    // This is a simplified version - in a real app you'd parse the document structure
    const lines = content.split('\n')
    const possibleHeadings = []
    
    lines.forEach((line, index) => {
      const trimmedLine = line.trim()
      // Look for potential headings: short lines ending with colon, numbered points, etc.
      if ((trimmedLine.length < 100 && trimmedLine.endsWith(':')) || 
          /^\d+\.\s/.test(trimmedLine) ||
          (trimmedLine.toUpperCase() === trimmedLine && trimmedLine.length > 3 && trimmedLine.length < 50)) {
        possibleHeadings.push({
          id: `heading-${index}`,
          text: trimmedLine,
          level: /^\d+\.\s/.test(trimmedLine) ? 2 : 1, // Simple rule for heading levels
          position: index
        })
      }
    })
    
    setHeadings(possibleHeadings)
  }, [content])
  
  const scrollToHeading = (position) => {
    const contentElement = document.querySelector('.document-content')
    if (!contentElement) return
    
    const lines = contentElement.querySelectorAll('.document-line')
    if (lines[position]) {
      lines[position].scrollIntoView({ behavior: 'smooth', block: 'start' })
      
      // Highlight temporarily
      lines[position].classList.add('bg-yellow-100')
      setTimeout(() => {
        lines[position].classList.remove('bg-yellow-100')
      }, 2000)
    }
  }
  
  if (headings.length === 0) return null
  
  return (
    <div className="bg-white rounded-lg shadow mb-4 overflow-hidden">
      <div
        className="p-3 bg-gray-50 border-b border-gray-200 flex justify-between items-center cursor-pointer"
        onClick={() => setIsOpen(!isOpen)}
      >
        <h3 className="font-medium text-gray-700">Document Outline</h3>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className={`h-5 w-5 transition-transform ${isOpen ? 'transform rotate-180' : ''}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </div>
      
      {isOpen && (
        <div className="p-3">
          <ul className="space-y-1">
            {headings.map((heading) => (
              <li
                key={heading.id}
                className={`cursor-pointer hover:bg-gray-100 rounded px-2 py-1 transition ${
                  heading.level === 1 ? 'font-medium' : 'pl-4 text-sm'
                }`}
                onClick={() => scrollToHeading(heading.position)}
              >
                {heading.text}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}
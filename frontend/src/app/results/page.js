'use client'

import { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { useAccessibility } from '@/components/AccessibilityProvider'

export default function Results() {
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [activeTab, setActiveTab] = useState('text')
  const searchParams = useSearchParams()
  const fileId = searchParams.get('id')
  
  // Get context with fallback default
  const { fontFamily = 'Inter var, sans-serif' } = useAccessibility()
  
  useEffect(() => {
    if (!fileId) {
      setError("No file ID provided")
      setLoading(false)
      return
    }
    
    // Simulate API call for demo
    setTimeout(() => {
      setResult({
        filename: fileId,
        text_content: "This is sample text content from the uploaded document. In a real application, this would be the actual extracted text from your document.",
        summary: "A short AI-generated summary would appear here.",
        audio_available: true,
        audio_path: "/api/audio/sample.mp3"
      })
      setLoading(false)
    }, 1500)
  }, [fileId])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent"></div>
          <p className="mt-4 text-lg font-medium text-gray-700">Processing your document...</p>
        </div>
      </div>
    )
  }
  
  if (error) {
    return (
      <div className="min-h-screen p-8">
        <div className="max-w-4xl mx-auto">
          <div className="bg-red-50 border-l-4 border-red-500 p-6 rounded-md">
            <h2 className="text-2xl font-bold text-red-700 mb-2">Error</h2>
            <p className="text-red-600">{error}</p>
            <Link href="/upload" className="mt-4 inline-block text-blue-600 hover:underline">
              Try uploading again
            </Link>
          </div>
        </div>
      </div>
    )
  }
  
  if (!result) return null
  
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white py-12">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
            <h1 className="text-2xl font-bold text-gray-800 truncate">
              {decodeURIComponent(result.filename)}
            </h1>
            <Link href="/upload" className="text-sm text-blue-600 hover:underline">
              Process another file
            </Link>
          </div>
          
          <div className="border-b border-gray-200">
            <nav className="flex">
              <button
                className={`px-4 py-3 border-b-2 font-medium text-sm ${
                  activeTab === 'text' 
                    ? 'border-blue-500 text-blue-600' 
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
                onClick={() => setActiveTab('text')}
              >
                Text Content
              </button>
              <button
                className={`px-4 py-3 border-b-2 font-medium text-sm ${
                  activeTab === 'summary' 
                    ? 'border-blue-500 text-blue-600' 
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
                onClick={() => setActiveTab('summary')}
              >
                Summary
              </button>
              <button
                className={`px-4 py-3 border-b-2 font-medium text-sm ${
                  activeTab === 'audio' 
                    ? 'border-blue-500 text-blue-600' 
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
                onClick={() => setActiveTab('audio')}
              >
                Audio
              </button>
            </nav>
          </div>
          
          <div className="p-6">
            {activeTab === 'text' && (
              <div>
                <div 
                  className="accessible-content dyslexic-friendly-text"
                  style={{ fontFamily: fontFamily }}
                >
                  {result.text_content.split('\n').map((paragraph, index) => (
                    <p key={index} className="mb-4">{paragraph}</p>
                  ))}
                </div>
              </div>
            )}
            
            {activeTab === 'summary' && (
              <div>
                <h2 className="text-xl font-semibold mb-4">AI-Generated Summary</h2>
                <div 
                  className="bg-blue-50 p-4 rounded-lg border border-blue-100 accessible-content"
                  style={{ fontFamily: fontFamily }}
                >
                  <p className="text-gray-800">{result.summary}</p>
                </div>
              </div>
            )}
            
            {activeTab === 'audio' && (
              <div>
                <h2 className="text-xl font-semibold mb-4">Audio Narration</h2>
                {result.audio_available ? (
                  <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
                    <audio controls className="w-full">
                      <source src={result.audio_path} type="audio/mp3" />
                      Your browser does not support the audio element.
                    </audio>
                    <div className="mt-4 flex items-center justify-center">
                      <a 
                        href={result.audio_path}
                        download
                        className="flex items-center text-blue-600 hover:text-blue-800"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                        </svg>
                        Download Audio File
                      </a>
                    </div>
                  </div>
                ) : (
                  <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-100">
                    <p className="text-yellow-800">Audio version is not available for this document.</p>
                  </div>
                )}
              </div>
            )}
          </div>
          
          <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm text-gray-500">Processed by EdTech Accessibility Hub</p>
              </div>
              <div className="flex space-x-2">
                <button 
                  className="px-4 py-2 bg-white border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  Save to Library
                </button>
                <button 
                  className="px-4 py-2 bg-blue-600 rounded-md text-sm font-medium text-white hover:bg-blue-700"
                >
                  Share Document
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
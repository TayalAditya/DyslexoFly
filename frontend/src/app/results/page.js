'use client'

import { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { useAccessibility } from '@/components/AccessibilityProvider'
import TextPane from '@/components/TextPane'
import SummaryPane from '@/components/SummaryPane'
import AudioPane from '@/components/AudioPane'

// Demo documents content - for the results page
const demoDocumentsData = {
  'science-textbook.pdf': { 
    filename: 'Science Textbook Chapter.pdf',
    text_content: "The water cycle is the continuous movement of water within Earth and its atmosphere. Water moves from the Earth's surface to the atmosphere through evaporation and transpiration. It then returns to the surface as precipitation. This cycle includes: evaporation, condensation, precipitation, infiltration, runoff, and transpiration. The sun drives the entire water cycle and is responsible for its continuous movement. Water that falls on land collects in rivers, lakes, and underground sources. Plants absorb water through their roots and release it through their leaves.",
    summary: "The water cycle describes how water moves through Earth's systems through processes of evaporation, condensation, precipitation, and collection. This cycle is essential for maintaining Earth's water balance and supporting all life forms.",
    audio_path: "https://samplelib.com/lib/preview/mp3/sample-3s.mp3",
    audio_available: true
  },
  'history-essay.pdf': { 
    filename: 'History Essay.pdf',
    text_content: "The Industrial Revolution began in Great Britain in the late 1700s. It marked a major turning point in history as manual labor was replaced by machine-based manufacturing. Key inventions included the steam engine by James Watt, the spinning jenny by James Hargreaves, and the power loom by Edmund Cartwright. These innovations transformed how people worked and lived. Cities grew rapidly as people moved from rural areas to work in factories. Working conditions were often dangerous and hours were long. Child labor was common. The revolution eventually spread to other parts of Europe and North America, changing societies forever.",
    summary: "The Industrial Revolution was a period of rapid industrialization that began in Great Britain in the 18th century and later spread to other countries. It introduced machine manufacturing, improved transportation systems, and created new economic and social structures that transformed society.",
    audio_path: "https://samplelib.com/lib/preview/mp3/sample-3s.mp3",
    audio_available: true
  },
  'story-excerpt.pdf': { 
    filename: 'Short Story Excerpt.pdf',
    text_content: "The old clock on the wall ticked loudly in the quiet room. Sarah sat by the window, watching raindrops race down the glass. It had been three weeks since she received the mysterious letter. 'Meet me where it all began,' it said, nothing more. She knew exactly where that was – the old lighthouse by the sea where they had first met ten years ago. The journey would take her back to her hometown, a place she had avoided for years. Memories flooded back as she packed her small suitcase. Would he still be the same person? Would she? Only time would tell.",
    summary: "Sarah receives a mysterious letter inviting her to meet someone at a lighthouse where they met ten years ago. She prepares for the journey back to her hometown, reflecting on the past and wondering what this reunion might bring.",
    audio_path: "https://samplelib.com/lib/preview/mp3/sample-3s.mp3",
    audio_available: true
  }
}

export default function Results() {
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [activeTab, setActiveTab] = useState('text')
  const [currentPlayingIndex, setCurrentPlayingIndex] = useState(null)
  const searchParams = useSearchParams()
  const fileId = searchParams.get('id')
  
  // Get context with fallback default
  const { fontFamily = 'Inter var, sans-serif', theme = 'cream' } = useAccessibility()
  
  useEffect(() => {
    if (!fileId) {
      setError("No file ID provided")
      setLoading(false)
      return
    }
    
    // Check if this is a demo document
    if (demoDocumentsData[fileId]) {
      setResult(demoDocumentsData[fileId])
      setLoading(false)
      return
    }
    
    // Try to fetch from backend
    setTimeout(() => {
      // Fallback to generic demo content if file not found
      setResult({
        filename: fileId,
        text_content: "This is sample text content from the uploaded document. In a real application, this would be the actual extracted text from your document.",
        summary: "A short AI-generated summary would appear here. This would typically highlight the main points and key information from the document.",
        audio_available: true,
        audio_path: "https://samplelib.com/lib/preview/mp3/sample-3s.mp3" // Demo audio URL
      })
      setLoading(false)
    }, 1500)
  }, [fileId])

  const handleSelectText = (index) => {
    setCurrentPlayingIndex(index)
  }

  const handlePlayingIndexChange = (index) => {
    setCurrentPlayingIndex(index)
  }

  if (loading) {
    return (
      <div className="min-h-screen pattern-bg flex items-center justify-center">
        <div className="text-center bg-white/80 backdrop-blur-sm p-8 rounded-2xl shadow-lg">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-indigo-500 border-t-transparent"></div>
          <p className="mt-4 text-lg font-medium text-indigo-700">Processing your document...</p>
        </div>
      </div>
    )
  }
  
  if (error) {
    return (
      <div className="min-h-screen pattern-bg p-8">
        <div className="max-w-4xl mx-auto">
          <div className="bg-red-50 border-l-4 border-red-500 p-6 rounded-xl shadow-lg">
            <h2 className="text-2xl font-bold text-red-700 mb-2">Error</h2>
            <p className="text-red-600">{error}</p>
            <Link href="/upload" className="mt-4 inline-block text-indigo-600 hover:text-indigo-800 font-medium">
              Try uploading again
            </Link>
          </div>
        </div>
      </div>
    )
  }
  
  if (!result) return null
  
  return (
    <div className="min-h-screen pattern-bg py-12">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl overflow-hidden border border-indigo-100">
          <div className="px-6 py-4 border-b border-indigo-100 flex justify-between items-center bg-gradient-to-r from-indigo-50 to-purple-50">
            <h1 className="text-2xl font-bold text-indigo-900 truncate">
              {decodeURIComponent(result.filename)}
            </h1>
            <Link href="/upload" className="text-sm text-indigo-600 hover:text-indigo-800 font-medium">
              Process another file
            </Link>
          </div>
          
          <div className="border-b border-indigo-100">
            <nav className="flex bg-white">
              <button
                className={`px-6 py-4 font-medium text-sm transition-colors duration-200 ${
                  activeTab === 'text' 
                    ? 'border-b-2 border-indigo-500 text-indigo-700 bg-indigo-50' 
                    : 'border-transparent text-gray-600 hover:text-indigo-600 hover:bg-indigo-50/50'
                }`}
                onClick={() => setActiveTab('text')}
              >
                <div className="flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clipRule="evenodd" />
                  </svg>
                  Text Content
                </div>
              </button>
              <button
                className={`px-6 py-4 font-medium text-sm transition-colors duration-200 ${
                  activeTab === 'summary' 
                    ? 'border-b-2 border-indigo-500 text-indigo-700 bg-indigo-50' 
                    : 'border-transparent text-gray-600 hover:text-indigo-600 hover:bg-indigo-50/50'
                }`}
                onClick={() => setActiveTab('summary')}
              >
                <div className="flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M3 5a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 10a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 15a1 1 0 011-1h6a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
                  </svg>
                  Summary
                </div>
              </button>
              <button
                className={`px-6 py-4 font-medium text-sm transition-colors duration-200 ${
                  activeTab === 'audio' 
                    ? 'border-b-2 border-indigo-500 text-indigo-700 bg-indigo-50' 
                    : 'border-transparent text-gray-600 hover:text-indigo-600 hover:bg-indigo-50/50'
                }`}
                onClick={() => setActiveTab('audio')}
              >
                <div className="flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.707.707L4.586 13H2a1 1 0 01-1-1V8a1 1 0 011-1h2.586l3.707-3.707a1 1 0 011.09-.217zM14.657 2.929a1 1 0 011.414 0A9.972 9.972 0 0119 10a9.972 9.972 0 01-2.929 7.071a1 1 0 01-1.414-1.414A7.971 7.971 0 0017 10c0-2.21-.894-4.208-2.343-5.657a1 1 0 010-1.414zm-2.829 2.828a1 1 0 011.415 0A5.983 5.983 0 0115 10a5.984 5.984 0 01-1.757 4.243a1 1 0 01-1.415-1.415A3.984 3.984 0 0013 10a3.983 3.983 0 00-1.172-2.828a1 1 0 010-1.415z" clipRule="evenodd" />
                  </svg>
                  Audio
                </div>
              </button>
            </nav>
          </div>
          
          <div className="p-6 bg-gradient-to-b from-white to-indigo-50/30 min-h-[400px]">
            {/* Content based on active tab */}
            <div className="w-full">
              {activeTab === 'text' && (
                <TextPane 
                  content={result.text_content}
                  currentPlayingIndex={currentPlayingIndex}
                  onSelectText={handleSelectText}
                />
              )}
              
              {activeTab === 'summary' && (
                <SummaryPane summary={result.summary} />
              )}
              
              {activeTab === 'audio' && (
                <AudioPane 
                  audioUrl={result.audio_path}
                  onPlayingIndexChange={handlePlayingIndexChange}
                  textContent={result.text_content}
                />
              )}
            </div>
          </div>
          
          <div className="px-6 py-4 bg-gradient-to-r from-indigo-50 to-purple-50 border-t border-indigo-100">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm text-indigo-700 font-medium">
                  <span className="flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M11 17a1 1 0 001.447.894l4-2A1 1 0 0017 15V9.236a1 1 0 00-1.447-.894l-4 2a1 1 0 00-.553.894V17zM15.211 6.276a1 1 0 000-1.788l-4.764-2.382a1 1 0 00-.894 0L4.789 4.488a1 1 0 000 1.788l4.764 2.382a1 1 0 00.894 0l4.764-2.382zM4.447 8.342A1 1 0 003 9.236V15a1 1 0 00.553.894l4 2A1 1 0 009 17v-5.764a1 1 0 00-.553-.894l-4-2z" />
                    </svg>
                    Processed by DyslexoFly
                  </span>
                </p>
              </div>
              <div className="flex space-x-2">
                <button 
                  className="px-4 py-2 bg-white border border-indigo-200 rounded-md text-sm font-medium text-indigo-700 hover:bg-indigo-50 transition-colors shadow-sm"
                >
                  Save to Library
                </button>
                <button 
                  className="px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-md text-sm font-medium text-white hover:from-indigo-700 hover:to-purple-700 transition-colors shadow-sm"
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
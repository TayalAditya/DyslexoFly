'use client'

import { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { useAccessibility } from '@/components/AccessibilityProvider'
import TextPane from '@/components/TextPane'
import SummaryPane from '@/components/SummaryPane'
import AudioPane from '@/components/AudioPane'

// Demo documents (same content you had)
const demoDocumentsData = {
  // ... your demoDocumentsData here ...
}

export default function ResultsPageClient() {
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [activeTab, setActiveTab] = useState('text')
  const [currentPlayingIndex, setCurrentPlayingIndex] = useState(null)
  const [summaryLevel, setSummaryLevel] = useState('standard')

  const searchParams = useSearchParams()
  const fileId = searchParams.get('id')

  const { fontFamily = 'Inter var, sans-serif', theme = 'cream' } = useAccessibility()

  useEffect(() => {
    if (!fileId) {
      setError("No file ID provided")
      setLoading(false)
      return
    }

    if (demoDocumentsData[fileId]) {
      setResult(demoDocumentsData[fileId])
      setLoading(false)
      return
    }

    setTimeout(() => {
      setResult({
        filename: fileId,
        text_content: "This is sample text content from the uploaded document. In a real application, this would be the actual extracted text from your document.",
        summaries: {
          tldr: "Brief overview of document content.",
          standard: "A short AI-generated summary would appear here.",
          detailed: "A more comprehensive summary covering all major points and supporting information."
        },
        audio_available: true,
        audio_path: "https://samplelib.com/lib/preview/mp3/sample-3s.mp3"
      })
      setLoading(false)
    }, 1500)
  }, [fileId])

  const handleSelectText = (index) => setCurrentPlayingIndex(index)
  const handlePlayingIndexChange = (index) => setCurrentPlayingIndex(index)

  // Loading & error UI
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

  // Your full UI rendering (text, summary, audio tabs) remains unchanged from your original
  return (
    <div className="min-h-screen pattern-bg py-12">
      {/* ...Your full tabbed UI layout here exactly as before... */}
    </div>
  )
}

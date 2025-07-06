'use client'

import Link from 'next/link'
import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useRouter } from 'next/navigation'
import LicenseModal from '@/components/LicenseModal'
import UploadButton from '@/components/UploadButton'
import FloatingActions from '@/components/FloatingActions'

export default function Home() {
  const [showLicensePopup, setShowLicensePopup] = useState(false)
  const router = useRouter()

  // Demo documents with pre-generated summaries
  const demoDocuments = {
    'Science_Textbook_Chapter': {
      title: 'Science Textbook',
      subtitle: 'Water Cycle Concepts',
      icon: '🧪',
      gradient: 'from-cyan-400 to-blue-500',
      border: 'border-blue-200',
      preview: 'The water cycle is the continuous movement of water within Earth and its atmosphere through evaporation, condensation...',
      stats: { words: 850, hasAudio: true, hasSummaries: true },
      summaries: {
        tldr: 'Water continuously moves through Earth and atmosphere via evaporation, condensation, and precipitation in an endless cycle that sustains all life.',
        standard: 'The water cycle describes how water moves continuously through our environment. Solar energy causes water to evaporate from oceans, lakes, and rivers. This water vapor rises into the atmosphere where it cools and condenses into clouds. Eventually, precipitation occurs as rain or snow, returning water to Earth\'s surface where it flows back to water bodies, completing the cycle. This process is essential for weather patterns and sustaining ecosystems.',
        detailed: 'The water cycle is a fundamental Earth system process where water continuously circulates between oceans, atmosphere, and land masses. It begins when solar radiation provides energy for evaporation from water bodies and transpiration from plants. Water vapor rises into the atmosphere where temperature decreases with altitude, causing condensation around particles to form clouds. When cloud droplets grow large enough, precipitation occurs as rain, snow, sleet, or hail. Precipitation that reaches Earth\'s surface either infiltrates soil to become groundwater, flows as surface runoff to rivers and streams, or evaporates back into the atmosphere. This continuous circulation distributes fresh water globally, drives weather patterns, shapes climate zones, and maintains the hydrological balance essential for all terrestrial life.'
      }
    },
    'History_Essay': {
      title: 'History Essay',
      subtitle: 'Industrial Revolution',
      icon: '📜',
      gradient: 'from-amber-400 to-yellow-500',
      border: 'border-amber-200',
      preview: 'The Industrial Revolution transformed human society through mechanization, urbanization, and technological advancement...',
      stats: { words: 1200, hasAudio: true, hasSummaries: true },
      summaries: {
        tldr: 'The Industrial Revolution (1760-1840) transformed society through steam power, factories, and mass production, creating modern industrial civilization.',
        standard: 'The Industrial Revolution was a period of unprecedented technological and social transformation from the late 18th to early 19th centuries. Beginning in Britain, it introduced steam-powered machinery, factory production systems, and railroad networks. This mechanization replaced manual labor and cottage industries with mass production in urban factories. The revolution brought rapid urbanization as people moved from rural areas to industrial cities, fundamentally changing work patterns, social structures, and living conditions.',
        detailed: 'The Industrial Revolution represents one of history\'s most significant transformative periods, fundamentally altering human society from agrarian and handicraft economies to mechanized manufacturing. Spanning roughly from 1760 to 1840, it began in Britain due to favorable conditions including abundant coal deposits, capital accumulation from colonial trade, and innovative entrepreneurs. Key innovations included James Watt\'s improved steam engine, textile machinery like the spinning jenny and power loom, and revolutionary transportation systems including canals and railways. This mechanization enabled mass production, reduced costs, and increased output dramatically. However, it also created new social challenges including harsh working conditions, child labor, environmental pollution, and stark class divisions between industrial capitalists and factory workers. The revolution spread throughout Europe and North America, ultimately establishing the foundation for modern industrial society and continuing technological progress.'
      }
    },
    'Short_Story_Excerpt': {
      title: 'Literature',
      subtitle: 'Short Story Excerpt',
      icon: '📚',
      gradient: 'from-emerald-400 to-green-500',
      border: 'border-emerald-200',
      preview: 'The old clock on the wall ticked loudly in the quiet room, marking time with methodical precision...',
      stats: { words: 650, hasAudio: true, hasSummaries: true },
      summaries: {
        tldr: 'A reflective narrative about an elderly woman contemplating her life while listening to her grandfather\'s antique clock.',
        standard: 'This literary excerpt follows an elderly protagonist sitting in her childhood home, listening to the steady rhythm of an antique wall clock. Through sensory details and internal monologue, the story explores themes of memory, aging, and the passage of time. The clock serves as both a literal timekeeper and a symbolic connection to family history, triggering reflections on significant life moments and the inevitable progression from past to present.',
        detailed: 'The short story excerpt employs rich sensory imagery and stream-of-consciousness narration to create an intimate portrait of an aging woman\'s contemplative moment. Set in a quiet room dominated by the rhythmic ticking of an inherited wall clock, the narrative weaves together present sensory experience with memories spanning decades. The author skillfully uses the clock as a central metaphor for time\'s relentless progression while simultaneously representing continuity across generations. Through carefully chosen details—the clock\'s brass pendulum, faded wallpaper, afternoon light—the story examines how physical objects can serve as repositories of personal and family history. The protagonist\'s internal dialogue reveals deep themes about mortality, legacy, and the bittersweet nature of remembrance, while the meticulous description of the clock\'s mechanical precision contrasts with the fluid, non-linear nature of human memory and emotion.'
      }
    }
  }

const handleDemoClick = async (demoId) => {
    // Create a mapping between demo IDs and file IDs
    const demoToFileId = {
      'Science_Textbook_Chapter': 'science-textbook.pdf',
      'History_Essay': 'history-essay.pdf',
      'Short_Story_Excerpt': 'science-textbook.pdf' // Note: This shows 'science-textbook.pdf' but the correct one should be 'story-excerpt.pdf'
    }

    // Get the correct file ID for this demo
    const fileId = demoToFileId[demoId] || 'science-textbook.pdf'

    // Store demo data in sessionStorage for the results page
    const demoData = {
      fileId: fileId,
      textContent: `${demoDocuments[demoId].preview}\n\n[This is a demo document. Full content would be displayed here in a real scenario.]`,
      summaries: demoDocuments[demoId].summaries,
      audioUrls: {
        original: `http://127.0.0.1:5000/api/audio/${fileId}_pdf_en-us_female_1750983453.mp3`,
        tldr: `http://127.0.0.1:5000/api/audio/${fileId}_tldr_summary_en-us_female.mp3`,
        standard: `http://127.0.0.1:5000/api/audio/${fileId}_standard_summary_en-us_female.mp3`,
        detailed: `http://127.0.0.1:5000/api/audio/${fileId}_detailed_summary_en-us_female.mp3`
      },
      isDemo: true
    }

    // Store in sessionStorage
    sessionStorage.setItem('demoDocument', JSON.stringify(demoData))

    // Navigate to results page with the specific ID parameter
    router.push(`/results?id=${fileId}`)
  }

  useEffect(() => {
    // Check if user has seen license popup today
    const today = new Date().toDateString()
    const lastShown = localStorage.getItem('dyslexofly-license-shown')
    
    if (lastShown !== today) {
      // Show license popup after 2 seconds on home page visit
      const timer = setTimeout(() => {
        setShowLicensePopup(true)
        localStorage.setItem('dyslexofly-license-shown', today)
      }, 2000)
      
      return () => clearTimeout(timer)
    }
  }, [])

  return (
    <>
      {/* License Popup for Home Page */}
      <LicenseModal isOpen={showLicensePopup} onClose={() => setShowLicensePopup(false)} />

    <div className="relative bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 overflow-hidden">
      {/* Hero section */}
      <div className="min-h-screen flex items-center relative">
        {/* Background pattern */}
        <div className="absolute inset-0 opacity-10">
          <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
            <defs>
              <pattern id="hero-pattern" x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse">
                <circle cx="10" cy="10" r="2" fill="currentColor" className="text-indigo-300"/>
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#hero-pattern)" />
          </svg>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left content */}
            <div className="text-center lg:text-left">
              <div className="mb-6 space-y-3">
                
                <span className="inline-flex items-center px-4 py-2 rounded-full text-sm font-medium bg-gradient-to-r from-purple-100 to-pink-100 text-purple-800 border border-purple-200">
                  <span className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></span>
                  Empowering 70M+ Dyslexic Learners in India
                </span>
              </div>
              
              <h1 className="text-4xl tracking-tight font-extrabold text-gray-900 sm:text-5xl md:text-6xl">
                <span className="block">DyslexoFly</span>
                <span className="block bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                  Words take flight, reading feels right!
                </span>
              </h1>
              
              <p className="mt-6 text-lg text-gray-600 max-w-2xl lg:mx-0 mx-auto leading-relaxed">
                Transform any educational content into dyslexia-friendly formats with our AI-powered platform. 
                Get instant audio narration, intelligent summaries, and optimized text rendering designed 
                specifically for dyslexic learners.
              </p>

              {/* Key benefits */}
              <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-4 text-center lg:text-left">
                <div className="flex items-center justify-center lg:justify-start space-x-2">
                  <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full flex items-center justify-center">
                    <span className="text-white text-sm">📄</span>
                  </div>
                  <span className="text-sm font-medium text-gray-700">Smart Text Processing</span>
                </div>
                <div className="flex items-center justify-center lg:justify-start space-x-2">
                  <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                    <span className="text-white text-sm">🎵</span>
                  </div>
                  <span className="text-sm font-medium text-gray-700">Audio Narration</span>
                </div>
                <div className="flex items-center justify-center lg:justify-start space-x-2">
                  <div className="w-8 h-8 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center">
                    <span className="text-white text-sm">🧠</span>
                  </div>
                  <span className="text-sm font-medium text-gray-700">AI Summaries</span>
                </div>
              </div>

              <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                <UploadButton size="large" variant="primary" />
                
                <Link href="/project-overview" className="group border-2 border-purple-300 text-purple-700 px-8 py-4 rounded-xl font-semibold text-lg hover:bg-purple-50 transition-all duration-300 flex items-center justify-center">
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Learn More
                </Link>
              </div>
            </div>

            {/* Right content - Interactive demo preview */}
            <div className="relative">
              <div className="bg-white rounded-2xl shadow-2xl p-6 border border-gray-100">
                <div className="flex items-center space-x-2 mb-4">
                  <div className="w-3 h-3 bg-red-400 rounded-full"></div>
                  <div className="w-3 h-3 bg-yellow-400 rounded-full"></div>
                  <div className="w-3 h-3 bg-green-400 rounded-full"></div>
                  <span className="text-sm text-gray-500 ml-2">DyslexoFly Platform</span>
                </div>
                
                <div className="space-y-4">
                  <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-lg border border-blue-200">
                    <h3 className="font-semibold text-gray-800 mb-2">📄 Document Processing</h3>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-gradient-to-r from-blue-500 to-indigo-500 h-2 rounded-full w-4/5 animate-pulse"></div>
                    </div>
                    <p className="text-sm text-gray-600 mt-2">Converting to dyslexia-friendly format...</p>
                  </div>
                  
                  <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-4 rounded-lg border border-purple-200">
                    <h3 className="font-semibold text-gray-800 mb-2">🎵 Audio Generation</h3>
                    <div className="flex items-center space-x-2">
                      <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                        <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <span className="text-sm text-gray-600">High-quality text-to-speech ready</span>
                    </div>
                  </div>
                  
                  <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-4 rounded-lg border border-green-200">
                    <h3 className="font-semibold text-gray-800 mb-2">🧠 AI Summary</h3>
                    <p className="text-sm text-gray-600 leading-relaxed">
                      &ldquo;This document explains the water cycle, including evaporation, condensation, and precipitation processes...&rdquo;
                    </p>
                  </div>
                </div>
              </div>
              
              {/* Floating elements */}
              <div className="absolute -top-4 -right-4 w-16 h-16 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center shadow-lg animate-bounce">
                <span className="text-white text-xl">✨</span>
              </div>
              <div className="absolute -bottom-4 -left-4 w-12 h-12 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full flex items-center justify-center shadow-lg animate-pulse">
                <span className="text-white">🚀</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Features section - Below the hero */}
      <div className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="lg:text-center">
            <h2 className="text-base text-purple-600 font-semibold tracking-wide uppercase">Features</h2>
            <p className="mt-2 text-3xl leading-8 font-extrabold tracking-tight text-gray-900 sm:text-4xl">
              Make reading accessible for everyone
            </p>
            <p className="mt-4 max-w-2xl text-xl text-gray-500 lg:mx-auto">
              Specially designed to help those with dyslexia, but beneficial for all readers.
            </p>
          </div>

          <div className="mt-16">
            <dl className="space-y-10 md:space-y-0 md:grid md:grid-cols-2 lg:grid-cols-4 md:gap-x-8 md:gap-y-10">
              <div className="relative group">
                <dt>
                  <div className="absolute flex items-center justify-center h-16 w-16 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg group-hover:shadow-xl transition-all duration-300 group-hover:scale-110">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <p className="ml-20 text-lg leading-6 font-bold text-gray-900">Dyslexia-Friendly Formatting</p>
                </dt>
                <dd className="mt-2 ml-20 text-base text-gray-500">
                  Customize fonts, spacing, and colors to create the perfect reading environment for your needs.
                </dd>
              </div>

              <div className="relative group">
                <dt>
                  <div className="absolute flex items-center justify-center h-16 w-16 rounded-xl bg-gradient-to-r from-blue-500 to-indigo-500 text-white shadow-lg group-hover:shadow-xl transition-all duration-300 group-hover:scale-110">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15.465a5 5 0 01-7.072-7.072" />
                    </svg>
                  </div>
                  <p className="ml-20 text-lg leading-6 font-bold text-gray-900">Multi-Language Audio</p>
                </dt>
                <dd className="mt-2 ml-20 text-base text-gray-500">
                  Listen to documents with synchronized highlighting in 2 languages with different voice options.
                </dd>
              </div>

              <div className="relative group">
                <dt>
                  <div className="absolute flex items-center justify-center h-16 w-16 rounded-xl bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-lg group-hover:shadow-xl transition-all duration-300 group-hover:scale-110">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  </div>
                  <p className="ml-20 text-lg leading-6 font-bold text-gray-900">AI Smart Summaries</p>
                </dt>
                <dd className="mt-2 ml-20 text-base text-gray-500">
                  Get TL;DR, Standard, or Detailed summaries with key points extraction and downloadable formats.
                </dd>
              </div>

              <div className="relative group">
                <dt>
                  <div className="absolute flex items-center justify-center h-16 w-16 rounded-xl bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-lg group-hover:shadow-xl transition-all duration-300 group-hover:scale-110">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <p className="ml-20 text-lg leading-6 font-bold text-gray-900">Smart Processing</p>
                </dt>
                <dd className="mt-2 ml-20 text-base text-gray-500">
                  Support for PDF, DOCX, TXT files with intelligent text extraction and processing time estimation.
                </dd>
              </div>
            </dl>
          </div>
        </div>
      </div>

      {/* Demo Documents Section */}
      <div className="py-16 bg-gradient-to-r from-gray-50 to-blue-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
              Try Demo Documents
            </h2>
            <p className="mt-4 max-w-2xl mx-auto text-xl text-gray-500">
              Experience DyslexoFly with pre-loaded educational content across different subjects.
            </p>
          </div>

          <div className="mt-12 grid gap-8 md:grid-cols-3">
            {Object.entries(demoDocuments).map(([demoId, demo]) => (
              <motion.div
                key={demoId}
                whileHover={{ scale: 1.05, y: -5 }}
                className={`bg-white rounded-2xl shadow-lg overflow-hidden ${demo.border} cursor-pointer transform transition-all hover:shadow-xl`}
                onClick={() => handleDemoClick(demoId)}
              >
                <div className={`bg-gradient-to-r ${demo.gradient} p-6 text-white`}>
                  <div className="flex items-center">
                    <div className="text-4xl mr-4">{demo.icon}</div>
                    <div>
                      <h3 className="text-xl font-bold">{demo.title}</h3>
                      <p className="opacity-90">{demo.subtitle}</p>
                    </div>
                  </div>
                </div>
                <div className="p-6">
                  <p className="text-gray-600 mb-4">
                    &ldquo;{demo.preview}&rdquo;
                  </p>
                  <div className="flex justify-between text-sm text-gray-500">
                    <span>📄 {demo.stats.words} words</span>
                    <span>🎵 {demo.stats.hasAudio ? 'Audio ready' : 'No audio'}</span>
                    <span>📝 {demo.stats.hasSummaries ? 'Summaries' : 'No summaries'}</span>
                  </div>
                  <div className="mt-4 text-center">
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      <span className="w-2 h-2 bg-green-400 rounded-full mr-2"></span>
                      Click to Try Demo
                    </span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          <div className="text-center mt-12">
            <UploadButton size="medium" variant="primary">
              Upload Your Own Document
            </UploadButton>
          </div>
        </div>
      </div>

      {/* Impact Statistics */}
      <div className="py-16 bg-gradient-to-r from-purple-600 to-pink-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-extrabold text-white sm:text-4xl">
              Making Education Accessible
            </h2>
            <p className="mt-4 max-w-2xl mx-auto text-xl text-purple-100">
              Built by The Kamand Krew for the global dyslexic learning community.
            </p>
          </div>

          <div className="mt-12 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
            <div className="text-center">
              <div className="text-4xl font-bold text-white">70M+</div>
              <div className="mt-2 text-purple-100">Dyslexic learners in India</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-white">2</div>
              <div className="mt-2 text-purple-100">Languages supported</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-white">3</div>
              <div className="mt-2 text-purple-100">Summary types available</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-white">100%</div>
              <div className="mt-2 text-purple-100">Free & Open Source</div>
            </div>
          </div>
        </div>
      </div>

      {/* Call to Action */}
      <div className="py-16 bg-white">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
            Ready to transform your learning experience?
          </h2>
          <p className="mt-4 text-xl text-gray-500">
            Join thousands of students who are already using DyslexoFly to make reading easier and more accessible.
          </p>
          <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
            <UploadButton size="large" variant="primary">
              Get Started Now
            </UploadButton>
            <Link href="/project-overview" className="inline-flex items-center px-8 py-4 border border-purple-300 text-lg font-medium rounded-xl text-purple-700 bg-purple-50 hover:bg-purple-100 transition-all duration-300">
              Learn More About Our Team
            </Link>
          </div>
        </div>
      </div>
      
      {/* Floating Actions */}
      <FloatingActions />
    </div>
    </>
  )
}
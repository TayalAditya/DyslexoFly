'use client'

import { useState, useRef, useEffect, memo, useCallback } from 'react'
import { useAccessibility } from './AccessibilityProvider'
import { motion, AnimatePresence } from 'framer-motion'

const TextPane = memo(({ content, currentPlayingIndex = -1, onSelectText }) => {
  const { fontFamily } = useAccessibility()
  const contentRef = useRef(null)
  const [structuredContent, setStructuredContent] = useState([])
  const [activeWordPosition, setActiveWordPosition] = useState(null)
  const [isSearchActive, setIsSearchActive] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState([])
  const [currentSearchIndex, setCurrentSearchIndex] = useState(0)
  const [textSize, setTextSize] = useState(100) // percentage of base size
  const [loading, setLoading] = useState(false)
  const [isSpeaking, setIsSpeaking] = useState(false)
  const [speakError, setSpeakError] = useState(null)
  const [lineSpacing, setLineSpacing] = useState(1.7)
  const [speakingWordIndex, setSpeakingWordIndex] = useState(null)

  // New state variables
  const [currentLineIndex, setCurrentLineIndex] = useState(null)
  const [visibleRange, setVisibleRange] = useState({ start: 0, end: 25 })
  const [totalLines, setTotalLines] = useState(0)
  const [linesPerPage, setLinesPerPage] = useState(25); // <-- New state variable
  const [useDyslexicFont, setUseDyslexicFont] = useState(true); // <-- Dyslexic font state

  // Process text content into structured format with better error handling
  useEffect(() => {
    if (content) {
      setLoading(true)
      
      try {
        // Process content in next tick to avoid blocking UI
        setTimeout(() => {
          const paragraphs = content
            .split(/\r?\n+/)
            .map(p => p.trim())
            .filter(Boolean)
            .map(para => para.split(/\s+/))
    
          setStructuredContent(paragraphs)
          setLoading(false)
        }, 10)
      } catch (err) {
        console.error("Error processing content:", err)
        setLoading(false)
        setStructuredContent([["Error", "loading", "content.", "Please", "try", "again."]])
      }
    }
  }, [content])

  // Word tracking with performance optimizations
  const handleWordTracking = useCallback(() => {
    if (currentPlayingIndex >= 0 && contentRef.current) {
      const wordElems = contentRef.current.querySelectorAll('.word')
      if (wordElems[currentPlayingIndex]) {
        const activeWord = wordElems[currentPlayingIndex]
        
        // Get position for floating highlight
        const rect = activeWord.getBoundingClientRect()
        
        setActiveWordPosition({
          left: activeWord.offsetLeft,
          top: activeWord.offsetTop,
          width: rect.width,
          height: rect.height
        })
        
        // Smooth scroll with requestAnimationFrame for better performance
        requestAnimationFrame(() => {
          activeWord.scrollIntoView({
            behavior: 'smooth',
            block: 'center'
          })
        })
        
        // Only update classes on affected elements
        const prevActive = contentRef.current.querySelector('.active-word')
        if (prevActive && prevActive !== activeWord) {
          prevActive.classList.remove('active-word')
        }
        activeWord.classList.add('active-word')
      }
    }
  }, [currentPlayingIndex])

  useEffect(() => {
    handleWordTracking()
  }, [handleWordTracking])
  
  // Enhanced text search functionality
  const handleSearch = useCallback(() => {
    if (!searchQuery.trim() || !content) {
      setSearchResults([])
      return
    }
    
    const query = searchQuery.toLowerCase()
    const allWords = content.toLowerCase().split(/\s+/)
    
    const matches = []
    allWords.forEach((word, index) => {
      if (word.includes(query)) {
        matches.push(index)
      }
    })
    
    setSearchResults(matches)
    
    // Highlight first result if there are any
    if (matches.length > 0 && onSelectText) {
      onSelectText(matches[0])
      setCurrentSearchIndex(0)
    }
  }, [searchQuery, content, onSelectText])

  // Handle text zoom
  const changeTextSize = (delta) => {
    setTextSize(prev => Math.min(200, Math.max(50, prev + delta)))
  }
  
  // Handle line spacing
  const changeLineSpacing = (delta) => {
    setLineSpacing(prev => Math.min(3, Math.max(1, prev + delta)))
  }
  
  // Improved speech synthesis with proper error handling
  const speakSelectedText = () => {
    if (!window.speechSynthesis) {
      setSpeakError("Your browser doesn't support speech synthesis")
      setTimeout(() => setSpeakError(null), 3000)
      return
    }
    
    const selection = window.getSelection()
    if (selection && selection.toString()) {
      try {
        // Cancel any ongoing speech
        if (speechSynthesis.speaking) {
          speechSynthesis.cancel()
          setIsSpeaking(false)
          setSpeakingWordIndex(null)
          setTimeout(() => performSpeech(selection.toString()), 100) // Brief delay before starting new speech
        } else {
          performSpeech(selection.toString())
        }
      } catch (err) {
        console.error("Speech synthesis error:", err)
        setSpeakError("Failed to speak text. Please try again.")
        setTimeout(() => setSpeakError(null), 3000)
      }
    } else {
      setSpeakError("Please select text to speak")
      setTimeout(() => setSpeakError(null), 3000)
    }
  }
  
  const performSpeech = (text) => {
    const utterance = new SpeechSynthesisUtterance(text)
    
    // Improve speech quality and settings
    utterance.rate = 0.9 // Slightly slower than default
    utterance.pitch = 1.0
    utterance.volume = 1.0
    
    // Get available voices and select a good one if available
    const voices = speechSynthesis.getVoices()
    const englishVoices = voices.filter(voice => voice.lang.includes('en'))
    if (englishVoices.length > 0) {
      utterance.voice = englishVoices[0]
    }
    
    // Add event handlers for speech feedback
    utterance.onstart = () => setIsSpeaking(true)
    utterance.onend = () => setIsSpeaking(false)
    utterance.onerror = () => {
      setIsSpeaking(false)
      setSpeakError("Error while speaking text")
      setTimeout(() => setSpeakError(null), 3000)
    }
    
    speechSynthesis.speak(utterance)
  }

  // Add new function to speak individual words
  const speakWord = (word, index) => {
    if (!window.speechSynthesis) {
      setSpeakError("Your browser doesn't support speech synthesis")
      setTimeout(() => setSpeakError(null), 3000)
      return
    }
    
    try {
      // Cancel any ongoing speech
      if (speechSynthesis.speaking) {
        speechSynthesis.cancel()
        setIsSpeaking(false)
        setSpeakingWordIndex(null)
        // Brief delay before starting new speech
        setTimeout(() => performWordSpeech(word, index), 100)
      } else {
        performWordSpeech(word, index)
      }
    } catch (err) {
      console.error("Speech synthesis error:", err)
      setSpeakError("Failed to speak text. Please try again.")
      setTimeout(() => setSpeakError(null), 3000)
    }
  }
  
  const performWordSpeech = (word, index) => {
    setSpeakingWordIndex(index)
    const utterance = new SpeechSynthesisUtterance(word)
    
    // Configure speech settings
    utterance.rate = 0.9
    utterance.pitch = 1.1
    utterance.volume = 1.0
    
    // Get available voices and select a good one
    const voices = speechSynthesis.getVoices()
    const englishVoices = voices.filter(voice => voice.lang.includes('en'))
    if (englishVoices.length > 0) {
      utterance.voice = englishVoices[0]
    }
    
    // Add event handlers
    utterance.onstart = () => setIsSpeaking(true)
    utterance.onend = () => {
      setIsSpeaking(false)
      setSpeakingWordIndex(null)
    }
    utterance.onerror = () => {
      setIsSpeaking(false)
      setSpeakingWordIndex(null)
      setSpeakError("Error speaking word")
      setTimeout(() => setSpeakError(null), 3000)
    }
    
    speechSynthesis.speak(utterance)
  }

  // Add a function to speak an entire line
  const speakLine = (paragraph, lineIndex) => {
    if (!window.speechSynthesis) {
      setSpeakError("Your browser doesn't support speech synthesis")
      setTimeout(() => setSpeakError(null), 3000)
      return
    }
    
    try {
      // Cancel any ongoing speech
      if (speechSynthesis.speaking) {
        speechSynthesis.cancel()
        setIsSpeaking(false)
        setSpeakingWordIndex(null)
      }
      
      // Set the current line being spoken
      setCurrentLineIndex(lineIndex)
      
      // Join the paragraph array back into text
      const lineText = paragraph.join(' ')
      
      const utterance = new SpeechSynthesisUtterance(lineText)
      utterance.rate = 0.9
      utterance.pitch = 1.0
      utterance.volume = 1.0
      
      // Get available voices and select a good one if available
      const voices = speechSynthesis.getVoices()
      const englishVoices = voices.filter(voice => voice.lang.includes('en'))
      if (englishVoices.length > 0) {
        utterance.voice = englishVoices[0]
      }
      
      // Add event handlers for speech feedback
      utterance.onstart = () => setIsSpeaking(true)
      utterance.onend = () => {
        setIsSpeaking(false)
        setCurrentLineIndex(null)
      }
      utterance.onerror = () => {
        setIsSpeaking(false)
        setCurrentLineIndex(null)
        setSpeakError("Error while speaking line")
        setTimeout(() => setSpeakError(null), 3000)
      }
      
      speechSynthesis.speak(utterance)
    } catch (err) {
      console.error("Speech synthesis error:", err)
      setCurrentLineIndex(null)
      setSpeakError("Failed to speak text. Please try again.")
      setTimeout(() => setSpeakError(null), 3000)
    }
  }

  // After structuredContent is set, update total lines
  useEffect(() => {
    if (structuredContent.length) {
      setTotalLines(structuredContent.length)
    }
  }, [structuredContent])

  // Add navigation controls for the 25-line view
  const handlePrevPage = () => {
    setVisibleRange(prev => ({
      start: Math.max(0, prev.start - linesPerPage),
      end: Math.max(linesPerPage, prev.end - linesPerPage)
    }))
  }

  const handleNextPage = () => {
    setVisibleRange(prev => ({
      start: Math.min(totalLines - 1, prev.start + linesPerPage),
      end: Math.min(totalLines, prev.end + linesPerPage)
    }))
  }

  // Add this function near your other control functions
  const changeLinesPerPage = (delta) => {
    setLinesPerPage(prev => Math.min(100, Math.max(10, prev + delta)));
    // Update the visible range when changing lines per page
    setVisibleRange(prev => ({
      start: prev.start,
      end: prev.start + Math.min(100, Math.max(10, linesPerPage + delta))
    }));
  };

  // Add this function to toggle font
  const toggleFont = () => {
    setUseDyslexicFont(prev => !prev);
  };

  if (!content) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center p-8 rounded-xl bg-white/80 backdrop-blur-sm shadow-lg">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto text-indigo-400 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <p className="text-indigo-900 font-medium">No content available</p>
          <p className="text-indigo-600/70 text-sm mt-1">Upload a document or paste text to begin</p>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center">
          <div className="loading-spinner mb-4"></div>
          <p className="text-indigo-900">Loading content...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white/90 backdrop-blur-sm rounded-xl shadow-xl p-5 h-full overflow-hidden border border-indigo-100 flex flex-col">
      <div className="flex flex-wrap justify-between items-center mb-4 gap-2">
        <motion.h2 
          className="font-bold text-lg text-indigo-900 flex items-center"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-indigo-600" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clipRule="evenodd" />
          </svg>
          Text Caption
        </motion.h2>

        <div className="flex flex-wrap gap-2">
          {/* Text size controls */}
          <div className="flex shadow-sm rounded-lg overflow-hidden">
            <button 
              onClick={() => changeTextSize(-10)} 
              className="bg-indigo-100 hover:bg-indigo-200 text-indigo-800 px-2 py-1"
              title="Decrease text size"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M5 10a1 1 0 011-1h8a1 1 0 110 2H6a1 1 0 01-1-1z" clipRule="evenodd" />
              </svg>
            </button>
            <div className="bg-white px-2 py-1 text-xs">{textSize}%</div>
            <button 
              onClick={() => changeTextSize(10)} 
              className="bg-indigo-100 hover:bg-indigo-200 text-indigo-800 px-2 py-1"
              title="Increase text size"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
              </svg>
            </button>
          </div>

          {/* Line spacing controls - NEW */}
          <div className="flex shadow-sm rounded-lg overflow-hidden">
            <button 
              onClick={() => changeLineSpacing(-0.1)} 
              className="bg-amber-100 hover:bg-amber-200 text-amber-800 px-2 py-1"
              title="Decrease line spacing"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
              </svg>
            </button>
            <div className="bg-white px-2 py-1 text-xs">{lineSpacing.toFixed(1)}</div>
            <button 
              onClick={() => changeLineSpacing(0.1)} 
              className="bg-amber-100 hover:bg-amber-200 text-amber-800 px-2 py-1"
              title="Increase line spacing"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
              </svg>
            </button>
          </div>

          {/* Lines per page controls */}
          <div className="flex shadow-sm rounded-lg overflow-hidden">
            <button 
              onClick={() => changeLinesPerPage(-5)} 
              className="bg-blue-100 hover:bg-blue-200 text-blue-800 px-2 py-1"
              title="Fewer lines per page"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            <div className="bg-white px-2 py-1 text-xs">{linesPerPage} lines</div>
            <button 
              onClick={() => changeLinesPerPage(5)} 
              className="bg-blue-100 hover:bg-blue-200 text-blue-800 px-2 py-1"
              title="More lines per page"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
              </svg>
            </button>
          </div>

          {/* Font toggle button */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={toggleFont}
            className={`text-white transition-colors px-3 py-1 rounded text-sm shadow-md flex items-center gap-1.5 ${
              useDyslexicFont 
                ? 'bg-green-600 hover:bg-green-700' 
                : 'bg-gray-600 hover:bg-gray-700'
            }`}
            title={useDyslexicFont ? "Switch to standard font" : "Switch to dyslexic font"}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16m-7 6h7" />
            </svg>
            {useDyslexicFont ? "Standard Font" : "Dyslexic Font"}
          </motion.button>

          {/* Text to speech button with improved feedback */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={speakSelectedText}
            className={`text-white ${isSpeaking ? 'bg-green-600 hover:bg-green-700' : 'bg-purple-600 hover:bg-purple-700'} transition-colors p-1.5 rounded-full shadow-md relative`}
            title={isSpeaking ? "Speaking selected text..." : "Speak selected text"}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.707.707L4.586 13H2a1 1 0 01-1-1V8a1 1 0 011-1h2.586l3.707-3.707a1 1 0 011.09-.217zM14.657 2.929a1 1 0 011.414 0A9.972 9.972 0 0119 10a9.972 9.972 0 01-2.929 7.071 1 1 0 01-1.414-1.414A7.971 7.971 0 0017 10c0-2.21-.894-4.208-2.343-5.657a1 1 0 010-1.414zm-2.829 2.828a1 1 0 011.415 0A5.983 5.983 0 0115 10a5.984 5.984 0 01-1.757 4.243 1 1 0 01-1.415-1.415A3.984 3.984 0 0013 10a3.983 3.983 0 00-1.172-2.828a1 1 0 010-1.415z" clipRule="evenodd" />
            </svg>
            {isSpeaking && (
              <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-green-400 animate-pulse"></span>
            )}
          </motion.button>

          {/* Search button */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setIsSearchActive(!isSearchActive)}
            className={`text-white transition-colors p-1.5 rounded-full shadow-md ${
              isSearchActive ? 'bg-amber-500 hover:bg-amber-600' : 'bg-indigo-600 hover:bg-indigo-700'
            }`}
            title="Search in text"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
            </svg>
          </motion.button>

          {/* Standard buttons */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigator.clipboard.writeText(content)}
            className="text-white bg-indigo-600 hover:bg-indigo-700 transition-colors p-1.5 rounded-full shadow-md"
            title="Copy to clipboard"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
              <path d="M8 3a1 1 0 011-1h2a1 1 0 110 2H9a1 1 0 01-1-1z" />
              <path d="M6 3a2 2 0 00-2 2v11a2 2 0 002 2h8a2 2 0 002-2V5a2 2 0 00-2-2 3 3 0 01-3 3H9a3 3 0 01-3-3z" />
            </svg>
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
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
            className="text-white bg-indigo-600 hover:bg-indigo-700 transition-colors p-1.5 rounded-full shadow-md"
            title="Download as text"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </motion.button>
        </div>
      </div>

      {/* Error notification for speech synthesis */}
      <AnimatePresence>
        {speakError && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="mb-3 p-2 bg-red-50 text-red-700 text-sm rounded-md border border-red-100 flex items-center"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            {speakError}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Search panel */}
      <AnimatePresence>
        {isSearchActive && (
          <motion.div 
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="mb-3 overflow-hidden"
          >
            <div className="bg-indigo-50 p-2 rounded-lg flex items-center gap-2">
              <input 
                type="text" 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                placeholder="Search text..."
                className="flex-1 border border-indigo-200 rounded px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              <button 
                onClick={handleSearch}
                className="bg-indigo-600 hover:bg-indigo-700 text-white px-2 py-1 rounded text-sm"
              >
                Search
              </button>
              {searchResults.length > 0 && (
                <div className="flex items-center gap-1 text-xs">
                  <span>{currentSearchIndex + 1}/{searchResults.length}</span>
                  <div className="flex">
                    <button
                      onClick={() => {
                        const newIndex = (currentSearchIndex - 1 + searchResults.length) % searchResults.length
                        setCurrentSearchIndex(newIndex)
                        onSelectText(searchResults[newIndex])
                      }}
                      className="bg-gray-200 hover:bg-gray-300 px-1 py-0.5 rounded-l"
                    >
                      ←
                    </button>
                    <button
                      onClick={() => {
                        const newIndex = (currentSearchIndex + 1) % searchResults.length
                        setCurrentSearchIndex(newIndex)
                        onSelectText(searchResults[newIndex])
                      }}
                      className="bg-gray-200 hover:bg-gray-300 px-1 py-0.5 rounded-r"
                    >
                      →
                    </button>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Add pagination controls */}
      {totalLines > linesPerPage && (
        <div className="mb-3 flex justify-between items-center bg-indigo-50 p-2 rounded-lg">
          <button 
            onClick={handlePrevPage}
            disabled={visibleRange.start === 0}
            className={`px-3 py-1 rounded text-xs font-medium ${
              visibleRange.start === 0 
                ? 'bg-gray-200 text-gray-500 cursor-not-allowed' 
                : 'bg-indigo-100 text-indigo-700 hover:bg-indigo-200'
            }`}
          >
            ← Previous
          </button>
          <span className="text-xs text-indigo-700">
            Showing lines {visibleRange.start + 1}-{Math.min(visibleRange.end, totalLines)} of {totalLines}
          </span>
          <button 
            onClick={handleNextPage}
            disabled={visibleRange.end >= totalLines}
            className={`px-3 py-1 rounded text-xs font-medium ${
              visibleRange.end >= totalLines 
                ? 'bg-gray-200 text-gray-500 cursor-not-allowed' 
                : 'bg-indigo-100 text-indigo-700 hover:bg-indigo-200'
            }`}
          >
            Next →
          </button>
        </div>
      )}

      <div className="relative flex-grow overflow-hidden">
        <div className="absolute left-0 w-full h-1 bg-gradient-to-r from-amber-300 to-yellow-400 top-1/2 transform -translate-y-1/2 z-10 opacity-20"></div>
        
        {/* Main text content with pagination */}
        <div
          ref={contentRef}
          className="accessible-content h-full overflow-y-auto p-6 rounded-lg relative"
          style={{ 
            fontFamily: useDyslexicFont ? 'OpenDyslexic, sans-serif' : 'Inter, sans-serif',
            whiteSpace: 'normal',
            letterSpacing: useDyslexicFont ? '0.5px' : 'normal',
            lineHeight: lineSpacing,
            wordSpacing: useDyslexicFont ? '0.25em' : 'normal',
            overflowY: 'auto',
            scrollBehavior: 'smooth',
            background: 'linear-gradient(to right, rgba(255, 250, 240, 0.9), rgba(255, 247, 237, 0.9))',
            fontSize: `${textSize}%`
          }}
        >
          {activeWordPosition && (
            <motion.div 
              className="absolute bg-indigo-100/80 rounded-md pointer-events-none z-0"
              initial={false}
              animate={{
                left: activeWordPosition.left - 4,
                top: activeWordPosition.top - 2,
                width: activeWordPosition.width + 8,
                height: activeWordPosition.height + 4,
              }}
              transition={{ type: 'spring', stiffness: 300, damping: 20 }}
            />
          )}
          
          {structuredContent
            .slice(visibleRange.start, visibleRange.end)
            .map((paragraph, visibleIndex) => {
              const pIndex = visibleIndex + visibleRange.start;
              const wordsBefore = structuredContent
                .slice(0, pIndex)
                .reduce((sum, para) => sum + para.length, 0);
              
              const isCurrentLine = currentLineIndex === pIndex;

              return (
                <div 
                  key={pIndex} 
                  className={`mb-8 flex ${isCurrentLine ? 'speaking-line' : ''}`}
                  id={`line-${pIndex}`}
                > 
                  <div 
                    onClick={() => speakLine(paragraph, pIndex)}
                    className={`text-xs mr-3 select-none w-6 text-right mt-1.5 cursor-pointer
                      flex items-center justify-end ${
                        isCurrentLine 
                          ? 'text-green-600 font-bold' 
                          : 'text-gray-400 hover:text-indigo-600'
                      }`}
                    title="Click to hear this line"
                  >
                    <span className="relative">
                      {pIndex + 1}
                      {isCurrentLine && (
                        <span className="absolute -right-2 top-0 w-2 h-2 bg-green-500 rounded-full animate-ping"></span>
                      )}
                    </span>
                  </div>
                  <div className={`flex-1 p-3 rounded-lg border-l-2 shadow-sm ${
                    isCurrentLine 
                      ? 'border-green-300 bg-green-50/70' 
                      : 'border-indigo-200 bg-white/50'
                  }`}>
                    {paragraph.map((word, wIndex) => {
                      const globalIndex = wordsBefore + wIndex;
                      const isSearchMatch = searchResults.includes(globalIndex);
                      const isSpeakingWord = speakingWordIndex === globalIndex;
                      
                      return (
                        <span
                          key={wIndex}
                          className={`word relative z-10 
                            ${currentPlayingIndex === globalIndex ? 'active-word' : ''}
                            ${isSearchMatch ? 'search-match' : ''}
                            ${isSpeakingWord ? 'speaking-word' : ''}
                            cursor-pointer hover:text-indigo-700 transition-colors`}
                          onClick={() => {
                            onSelectText && onSelectText(globalIndex);
                            speakWord(word, globalIndex);
                          }}
                          title="Click to speak this word"
                        >
                          {word}
                          {isSpeakingWord && (
                            <span className="absolute top-0 right-0 w-2 h-2 bg-green-400 rounded-full animate-pulse" 
                                  style={{transform: 'translate(50%, -50%)'}}></span>
                          )}
                          {' '}
                        </span>
                      )
                    })}
                  </div>
                </div>
              );
            })}

          {/* Show indication if there are more lines */}
          {visibleRange.end < totalLines && (
            <div className="text-center py-3 text-sm text-indigo-500">
              Scroll down or click "Next" to see more content
            </div>
          )}
        </div>
      </div>
      
      <div className="w-full h-6 bg-gradient-to-t from-white/90 to-transparent pointer-events-none absolute bottom-0 left-0 right-0"></div>
      
      {/* Selected text indicator at the bottom */}
      {window.getSelection()?.toString() && (
        <div className="bg-indigo-50 mt-2 py-1 px-2 rounded text-xs text-indigo-700 flex justify-between items-center">
          <span>Text selected: {window.getSelection().toString().slice(0, 30)}{window.getSelection().toString().length > 30 ? '...' : ''}</span>
          <button 
            onClick={speakSelectedText}
            className={`px-2 py-0.5 text-xs rounded ${isSpeaking ? 'bg-green-100 text-green-800' : 'bg-indigo-100 text-indigo-800'}`}
          >
            {isSpeaking ? 'Speaking...' : 'Speak'}
          </button>
        </div>
      )}
      
      <style jsx global>{`
        @font-face {
          font-family: 'OpenDyslexic';
          src: url('/fonts/OpenDyslexic-Regular.otf') format('opentype');
          font-weight: normal;
          font-style: normal;
          font-display: swap;
        }
        
        @font-face {
          font-family: 'OpenDyslexic';
          src: url('/fonts/OpenDyslexic-Bold.otf') format('opentype');
          font-weight: bold;
          font-style: normal;
          font-display: swap;
        }
        
        .word {
          position: relative;
          transition: all 0.3s ease;
          border-radius: 4px;
          padding: 0 2px;
        }
        
        .active-word {
          color: #4338ca;
          font-weight: bold;
          position: relative;
          background: rgba(255, 240, 210, 0.5);
          border-radius: 4px;
          padding: 0 3px;
          box-shadow: 0 1px 2px rgba(0,0,0,0.05);
        }
        
        .search-match {
          background-color: rgba(250, 204, 21, 0.3);
          border-radius: 4px;
        }
        
        /* Added underline to help track words better */
        .word:hover {
          text-decoration: underline;
          text-decoration-thickness: 2px;
          text-decoration-color: rgba(99, 102, 241, 0.4);
        }
        
        /* Improved contrast for better readability */
        .accessible-content {
          color: rgba(30, 41, 59, 0.95);
          text-shadow: 0 1px 0 rgba(255, 255, 255, 0.5);
        }
        
        .accessible-content::-webkit-scrollbar {
          width: 6px;
        }
        
        .accessible-content::-webkit-scrollbar-track {
          background: transparent;
        }
        
        .accessible-content::-webkit-scrollbar-thumb {
          background-color: rgba(99, 102, 241, 0.3);
          border-radius: 20px;
        }
        
        .loading-spinner {
          width: 40px;
          height: 40px;
          margin: 0 auto;
          border-radius: 50%;
          border: 3px solid rgba(99, 102, 241, 0.2);
          border-top-color: rgba(99, 102, 241, 0.8);
          animation: spin 1s ease-in-out infinite;
        }
        
        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        /* Make selection more visible */
        ::selection {
          background: rgba(79, 70, 229, 0.2);
          color: #1e293b;
          text-shadow: none;
        }

        .speaking-word {
          color: #047857; /* Green-800 */
          position: relative;
          background: rgba(209, 250, 229, 0.4); /* Green-100 with transparency */
          border-radius: 4px;
          padding: 0 3px;
          box-shadow: 0 1px 2px rgba(0,0,0,0.05);
          font-weight: 600;
        }
        
        /* Animation for speaking word */
        @keyframes pulse-border {
          0% { box-shadow: 0 0 0 0 rgba(16, 185, 129, 0.4); }
          70% { box-shadow: 0 0 0 4px rgba(16, 185, 129, 0); }
          100% { box-shadow: 0 0 0 0 rgba(16, 185, 129, 0); }
        }
        
        .speaking-word {
          animation: pulse-border 2s infinite;
        }

        @keyframes gentle-highlight {
          0% { background-color: rgba(209, 250, 229, 0.3); }
          50% { background-color: rgba(209, 250, 229, 0.6); }
          100% { background-color: rgba(209, 250, 229, 0.3); }
        }
        
        .speaking-line {
          animation: gentle-highlight 3s infinite;
        }
      `}</style>
    </div>
  )
})

TextPane.displayName = 'TextPane'

export default TextPane
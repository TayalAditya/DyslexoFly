'use client'

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link'
import { useAccessibility } from '@/components/AccessibilityProvider'
import TextPane from '@/components/TextPane'
import SummaryPane from '@/components/SummaryPane'
import AudioPane from '@/components/AudioPane'

// Demo documents with different summary levels
const demoDocumentsData = {
  'science-textbook.pdf': { 
    filename: 'Science Textbook Chapter.pdf',
    text_content: "The water cycle is the continuous movement of water within Earth and its atmosphere. Water moves from the Earth's surface to the atmosphere through evaporation and transpiration. It then returns to the surface as precipitation. This cycle includes: evaporation, condensation, precipitation, infiltration, runoff, and transpiration. The sun drives the entire water cycle and is responsible for its continuous movement. Water that falls on land collects in rivers, lakes, and underground sources. Plants absorb water through their roots and release it through their leaves.",
    summaries: {
      tldr: "The water cycle moves water between Earth and atmosphere through evaporation and precipitation.",
      standard: "The water cycle describes how water moves through Earth's systems through processes of evaporation, condensation, precipitation, and collection. This cycle is essential for maintaining Earth's water balance.",
      detailed: "The water cycle is the continuous movement of water within Earth and its atmosphere. It includes six key processes: evaporation, condensation, precipitation, infiltration, runoff, and transpiration. The sun powers this cycle, causing water to evaporate from surface sources, condense as clouds, fall as precipitation, then collect in bodies of water or return to the atmosphere through plant transpiration. This perpetual cycle maintains Earth's water balance and supports all life forms."
    },
    audioPath: "https://samplelib.com/lib/preview/mp3/sample-3s.mp3",
    audio_available: true
  },
  'history-essay.pdf': { 
    filename: 'History Essay.pdf',
    text_content: "The Industrial Revolution began in Great Britain in the late 1700s. It marked a major turning point in history as manual labor was replaced by machine-based manufacturing. Key inventions included the steam engine by James Watt, the spinning jenny by James Hargreaves, and the power loom by Edmund Cartwright. These innovations transformed how people worked and lived. Cities grew rapidly as people moved from rural areas to work in factories. Working conditions were often dangerous and hours were long. Child labor was common. The revolution eventually spread to other parts of Europe and North America, changing societies forever.",
    summaries: {
      tldr: "The Industrial Revolution replaced manual labor with machines, starting in Britain in the 1700s.",
      standard: "The Industrial Revolution was a period of rapid industrialization that began in Great Britain in the 18th century and later spread to other countries. It introduced machine manufacturing and transformed society.",
      detailed: "The Industrial Revolution began in Great Britain in the late 1700s and represented a fundamental shift from manual production to machine manufacturing. Key innovations like the steam engine, spinning jenny, and power loom transformed production methods and social structures. As industrialization grew, urbanization accelerated with people migrating from rural areas to factory jobs in cities. Working conditions were often hazardous with long hours, including widespread child labor. The revolution's effects eventually spread across Europe and North America, permanently altering economic systems, class structures, and daily life."
    },
    audioPath: "https://samplelib.com/lib/preview/mp3/sample-3s.mp3",
    audio_available: true
  },
  'story-excerpt.pdf': { 
    filename: 'Short Story Excerpt.pdf',
    text_content: "The old clock on the wall ticked loudly in the quiet room. Sarah sat by the window, watching raindrops race down the glass. It had been three weeks since she received the mysterious letter. 'Meet me where it all began,' it said, nothing more. She knew exactly where that was – the old lighthouse by the sea where they had first met ten years ago. The journey would take her back to her hometown, a place she had avoided for years. Memories flooded back as she packed her small suitcase. Would he still be the same person? Would she? Only time would tell.",
    summaries: {
      tldr: "Sarah receives a mysterious invitation to return to a lighthouse from her past.",
      standard: "Sarah receives a mysterious letter inviting her to meet someone at a lighthouse where they met ten years ago. She prepares for the journey back to her hometown, reflecting on the past.",
      detailed: "Sarah sits watching rain while contemplating a mysterious letter she received three weeks ago. The note simply says 'Meet me where it all began,' referring to an old lighthouse where she met someone significant ten years earlier. This journey will force her to return to her hometown, a place she has deliberately avoided for years. As she prepares for the trip, she's filled with memories and uncertainty about how both she and the other person may have changed over time. The story creates tension around this upcoming reunion and confrontation with her past."
    },
    audioPath: "https://samplelib.com/lib/preview/mp3/sample-3s.mp3",
    audio_available: true
  }
}

export default function Results() {
  const searchParams = useSearchParams();
  const fileId = searchParams.get('id') || 'sample';
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('text')
  const [currentPlayingIndex, setCurrentPlayingIndex] = useState(null)
  const [summaryLevel, setSummaryLevel] = useState('standard')
  const [voiceOption, setVoiceOption] = useState({ language: 'en-us', gender: 'female' });
  const [isTextLoading, setIsTextLoading] = useState(false);
  
  // Get accessibility context - apply to root div
  const accessibilitySettings = useAccessibility();
  
  // Add this console log to debug
  useEffect(() => {
    if (result?.audioPath) {
      console.log('Audio Path:', result.audioPath);
    }
  }, [result?.audioPath]);

  useEffect(() => {
    // Load document - NO AUDIO GENERATION
    const loadDocument = async () => {
      if (!fileId) return;
      
      setLoading(true);
      setError(null);
      
      try {
        // Check if it's a demo document first
        if (demoDocumentsData[fileId]) {
          console.log("Loading demo document:", fileId);
          setResult(demoDocumentsData[fileId]);
          setLoading(false);
          return;
        }
        
        // Regular document from backend
        console.log("Fetching document from backend:", fileId);
        const response = await fetch(`http://127.0.0.1:5000/api/documents/${fileId}`);
        
        if (!response.ok) {
          if (response.status === 404) {
            throw new Error(`Document "${fileId}" not found. Please check if the file exists on the server.`);
          } else {
            throw new Error(`Server error: ${response.status}. Please try again later.`);
          }
        }
        
        const data = await response.json();
        console.log("Document loaded successfully");
        
        // Set result WITHOUT audio progress simulation
        setResult(data);
        setLoading(false);
        
      } catch (err) {
        console.error("Error loading document:", err);
        setError(err.message);
        setLoading(false);
      }
    };
    
    loadDocument();
  }, [fileId])

  // Replace your second useEffect with this version
  useEffect(() => {
    const shouldFetchText = 
      fileId && 
      !demoDocumentsData[fileId] && 
      !isTextLoading && 
      result && 
      !result.text_content;
      
    if (shouldFetchText) {
      console.log("Fetching extracted text for:", fileId);
      setIsTextLoading(true);
      
      // Add timeout to prevent infinite loading if server doesn't respond
      const fetchTimeout = setTimeout(() => {
        console.error("Fetch text timeout - server not responding");
        setIsTextLoading(false);
        setResult(prev => ({
          ...prev,
          text_content: "Failed to load text content: Server timeout",
          hasTriedTextFetch: true
        }));
      }, 15000); // 15 second timeout
      
      fetch(`http://localhost:5000/api/documents/${fileId}/extracted-text`)
        .then(response => {
          clearTimeout(fetchTimeout);
          console.log("Text fetch response status:", response.status);
          if (!response.ok) {
            throw new Error(`Failed to fetch text content (${response.status})`);
          }
          return response.json();
        })
        .then(data => {
          console.log("Text fetch successful, data:", data);
          if (data.success && data.text_content) {
            setResult(prev => ({
              ...prev,
              text_content: data.text_content,
              hasTriedTextFetch: true
            }));
          } else {
            throw new Error('No text content in response');
          }
        })
        .catch(err => {
          console.error("Error fetching text content:", err);
          setResult(prev => ({
            ...prev,
            text_content: `This document couldn't be processed properly. Error: ${err.message}`,
            hasTriedTextFetch: true
          }));
        })
        .finally(() => {
          setIsTextLoading(false);
        });
    }
  }, [fileId, isTextLoading, result]); // Remove hasTriedTextFetch from dependencies

  const handleSelectText = (index) => {
    setCurrentPlayingIndex(index)
  }

  // Update the handleVoiceChange function
  const handleVoiceChange = async (newVoice) => {
    // Don't make API call for demo content
    if (demoDocumentsData[fileId]) {
      console.log("Demo content - voice change not implemented");
      // Return a resolved promise for demo content
      return Promise.resolve();
    }
    
    setLoading(true);
    try {
      console.log("Requesting audio regeneration with:", newVoice);
      
      // Make an API request to regenerate audio with new voice
      const response = await fetch('http://localhost:5000/api/regenerate-audio', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          fileId: fileId,
          language: newVoice.language,
          gender: newVoice.gender
        }),
      });
      
      const data = await response.json();
      
      if (data.success) {
        setResult(prev => ({
          ...prev,
          audioPath: data.audioPath
        }));
        return Promise.resolve();
      } else {
        console.error('Failed to regenerate audio:', data.error);
        return Promise.reject(new Error('Failed to regenerate audio'));
      }
    } catch (err) {
      console.error('Error regenerating audio', err);
      return Promise.reject(err);
    } finally {
      setLoading(false);
    }
  };
  
  // Debugging useEffect
  useEffect(() => {
    if (result) {
      console.log("Result State:", {
        filename: result.filename,
        hasTextContent: !!result.text_content,
        audioPath: result.audioPath,
        textLength: result.text_content ? result.text_content.length : 0
      });
    }
  }, [result]);
  
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
  
  if (!result) return null;
  
  // Apply accessibility settings to the root element
  const rootStyle = {
    fontFamily: accessibilitySettings.fontFamily || 'Inter var, sans-serif',
  };
  
  return (
    <div className="min-h-screen pattern-bg py-12" style={rootStyle}>
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
                <div className="p-6 bg-white rounded-lg shadow">
                  {isTextLoading ? (
                    <div className="flex items-center justify-center py-12">
                      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500"></div>
                    </div>
                  ) : (
                    <div>
                      <p className="mb-4 text-sm text-gray-500">
                        Text content length: {result.text_content?.length || 0} characters
                      </p>
                      <TextPane 
                        content={result.text_content || "Text was successfully extracted for audio processing."}
                        currentPlayingIndex={currentPlayingIndex}
                        onSelectText={handleSelectText}
                      />
                    </div>
                  )}
                </div>
              )}
              
              {activeTab === 'summary' && (
                <div className="w-full">
                  <div className="mb-6 flex items-center justify-center space-x-2">
                    <button 
                      onClick={() => setSummaryLevel('tldr')}
                      className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                        summaryLevel === 'tldr' 
                          ? 'bg-indigo-600 text-white' 
                          : 'bg-indigo-100 text-indigo-700 hover:bg-indigo-200'
                      }`}
                    >
                      TL;DR
                    </button>
                    <button 
                      onClick={() => setSummaryLevel('standard')}
                      className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                        summaryLevel === 'standard' 
                          ? 'bg-indigo-600 text-white' 
                          : 'bg-indigo-100 text-indigo-700 hover:bg-indigo-200'
                      }`}
                    >
                      Standard
                    </button>
                    <button 
                      onClick={() => setSummaryLevel('detailed')}
                      className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                        summaryLevel === 'detailed' 
                          ? 'bg-indigo-600 text-white' 
                          : 'bg-indigo-100 text-indigo-700 hover:bg-indigo-200'
                      }`}
                    >
                      Detailed
                    </button>
                  </div>
                  
                  <div className="mb-8">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium text-indigo-600">Summary Length</span>
                      <span className="text-sm font-medium text-indigo-900">{summaryLevel === 'tldr' ? 'Brief' : summaryLevel === 'standard' ? 'Standard' : 'Detailed'}</span>
                    </div>
                    <div className="relative">
                      <input 
                        type="range" 
                        min="0" 
                        max="2" 
                        value={summaryLevel === 'tldr' ? 0 : summaryLevel === 'standard' ? 1 : 2}
                        onChange={(e) => {
                          const val = parseInt(e.target.value);
                          if (val === 0) setSummaryLevel('tldr');
                          else if (val === 1) setSummaryLevel('standard');
                          else setSummaryLevel('detailed');
                        }}
                        className="w-full h-2 bg-indigo-100 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                      />
                      <div className="flex justify-between text-xs text-indigo-500 mt-1">
                        <span>Brief</span>
                        <span>Standard</span>
                        <span>Detailed</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-blue-50 p-6 rounded-lg border border-blue-100">
                    <h2 className="text-xl font-semibold text-indigo-900 mb-3">
                      {summaryLevel === 'tldr' ? 'Quick Overview' : 
                       summaryLevel === 'standard' ? 'Standard Summary' : 'Detailed Summary'}
                    </h2>
                    <div className="prose prose-indigo max-w-none">
                      <SummaryPane summary={result.summaries[summaryLevel]} />
                    </div>
                  </div>
                </div>
              )}
              
              {activeTab === 'audio' && (
                <div className="w-full">
                  <AudioPane 
                    audioUrl={result?.audioPath} 
                    textContent={result?.text_content} 
                    onPlayingIndexChange={handleSelectText}
                    onVoiceChange={handleVoiceChange}
                  />
                </div>
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
              {/* Optional: You can uncomment these buttons if you want to keep them as disabled/non-functional UI elements */}
              <div className="flex space-x-2">
                <button 
                  className="px-4 py-2 bg-white border border-indigo-200 rounded-md text-sm font-medium text-indigo-400 cursor-not-allowed opacity-70"
                  disabled
                  title="Coming soon"
                >
                  Save to Library
                </button>
                <button 
                  className="px-4 py-2 bg-gradient-to-r from-indigo-400 to-purple-400 rounded-md text-sm font-medium text-white cursor-not-allowed opacity-70"
                  disabled
                  title="Coming soon"
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
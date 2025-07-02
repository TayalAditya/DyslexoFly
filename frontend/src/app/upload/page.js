'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import FileUploader from '@/components/FileUploader'
import ProcessingStatus from '@/components/ProcessingStatus'
import FloatingActions from '@/components/FloatingActions'

export default function Upload() {
  const [file, setFile] = useState(null)
  const [isUploading, setIsUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [status, setStatus] = useState('')
  const [error, setError] = useState("")
  const [isComplete, setIsComplete] = useState(false)
  const [currentStage, setCurrentStage] = useState(0)
  const [fileSize, setFileSize] = useState(null)
  const [estimatedTime, setEstimatedTime] = useState(null)
  const [showWelcomePopup, setShowWelcomePopup] = useState(false)
  const [showFeatureHighlight, setShowFeatureHighlight] = useState(false)
  const router = useRouter()

  const processingStages = [
    { name: 'File Upload', duration: '2-5s' },
    { name: 'Text Extraction', duration: '5-15s' },
    { name: 'Content Processing', duration: '3-8s' },
    { name: 'AI Analysis', duration: '10-20s' },
    { name: 'Finalizing', duration: '2-3s' }
  ]

  useEffect(() => {
    testBackendConnection();
    
    // Show welcome popup for first-time visitors or once per day
    const today = new Date().toDateString()
    const lastShown = localStorage.getItem('dyslexofly-welcome-shown')
    
    if (lastShown !== today) {
      setTimeout(() => {
        setShowWelcomePopup(true)
        localStorage.setItem('dyslexofly-welcome-shown', today)
      }, 1500);
    }
  }, []);

  const testBackendConnection = async () => {
    try {
      // Add timeout to avoid hanging if server doesn't respond
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);
      
      const response = await fetch('http://127.0.0.1:5000/', {
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      const text = await response.text();
      console.log('Backend connection successful:', text);
      setError(''); // Clear any previous errors
    } catch (err) {
      console.error('Backend connection failed:', err);
      
      if (err.name === 'AbortError') {
        setError('Connection to backend server timed out. Please ensure it is running at http://127.0.0.1:5000');
      } else {
        setError('Cannot connect to backend server. Please ensure it is running at http://127.0.0.1:5000');
      }
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!file) {
      setError("Please select a file first");
      return;
    }

    setIsUploading(true);
    setError("");
    setFileSize(file.size);
    
    // Calculate estimated time based on file size
    const estimatedSeconds = Math.max(20, Math.min(60, Math.floor(file.size / (1024 * 1024)) * 8));
    setEstimatedTime(`${Math.floor(estimatedSeconds / 60)}:${(estimatedSeconds % 60).toString().padStart(2, '0')}`);

    // Stage 1: File Upload
    setCurrentStage(0);
    setUploadProgress(5);
    setStatus('Uploading file...');

    const formData = new FormData();
    formData.append('file', file);

    try {
      // Simulate upload progress
      const uploadInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev < 25) return prev + 2;
          return prev;
        });
      }, 200);

      const response = await fetch('http://127.0.0.1:5000/api/upload', {
        method: 'POST',
        body: formData,
        headers: {
          'ngrok-skip-browser-warning': 'true'
        }
      });

      clearInterval(uploadInterval);

      // Stage 2: Text Extraction
      setCurrentStage(1);
      setUploadProgress(35);
      setStatus('Extracting text from document...');

      // Simulate text extraction time
      await new Promise(resolve => setTimeout(resolve, 2000));
      setUploadProgress(55);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Upload failed with status: ${response.status}`);
      }

      const data = await response.json();

      // Stage 3: Content Processing
      setCurrentStage(2);
      setUploadProgress(70);
      setStatus('Processing content for accessibility...');
      await new Promise(resolve => setTimeout(resolve, 1500));

      // Stage 4: AI Analysis
      setCurrentStage(3);
      setUploadProgress(85);
      setStatus('Preparing AI-powered features...');
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Stage 5: Finalizing
      setCurrentStage(4);
      setUploadProgress(95);
      setStatus('Finalizing your accessible document...');
      await new Promise(resolve => setTimeout(resolve, 1000));

      setUploadProgress(100);
      setStatus('Processing complete!');
      setIsComplete(true);

      setTimeout(() => {
        router.push(`/results?id=${encodeURIComponent(data.filename)}`);
      }, 1500);

    } 
    catch (err) {
      console.error("Upload error:", err);
      setError(err.message || 'Connection error. Is the backend server running?');
      setIsUploading(false);
      setUploadProgress(0);
      setStatus('');
      setCurrentStage(0);
    }
  }

  const supportedFormats = [
    { ext: 'PDF', description: 'Adobe PDF Documents' },
    { ext: 'DOCX', description: 'Microsoft Word Documents' },
    { ext: 'TXT', description: 'Plain Text Files' },
  ]

  // Demo documents for users to try
  const demoDocuments = [
    { 
      id: 'science-textbook.pdf', 
      name: 'Science Textbook Chapter', 
      description: 'Sample science content with clear explanations of concepts',
      icon: '🧪',
      preview: 'The water cycle is the continuous movement of water within Earth and its atmosphere...',
      color: 'from-cyan-50 to-blue-50',
      iconBg: 'bg-blue-100'
    },
    { 
      id: 'history-essay.pdf', 
      name: 'History Essay', 
      description: 'Historical analysis with dates, names and events',
      icon: '📜',
      preview: 'The Industrial Revolution began in Great Britain in the late 1700s...',
      color: 'from-amber-50 to-yellow-50',
      iconBg: 'bg-amber-100'
    },
    { 
      id: 'story-excerpt.pdf', 
      name: 'Short Story Excerpt', 
      description: 'Literary text with rich vocabulary and dialogue',
      icon: '📚',
      preview: 'The old clock on the wall ticked loudly in the quiet room...',
      color: 'from-emerald-50 to-green-50',
      iconBg: 'bg-emerald-100'
    }
  ]

  return (
    <>
      {/* Welcome Popup */}
      <AnimatePresence>
        {showWelcomePopup && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-8 text-center"
            >
              <div className="mb-6">
                <div className="mx-auto w-16 h-16 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full flex items-center justify-center mb-4">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-3">Welcome to DyslexoFly! 🦋</h2>
                <p className="text-gray-600 leading-relaxed">
                  Transform your learning materials into dyslexia-friendly formats with AI-powered summaries, 
                  text-to-speech audio, and accessible reading tools.
                </p>
              </div>
              
              <div className="grid grid-cols-2 gap-4 mb-6 text-sm">
                <div className="p-3 bg-blue-50 rounded-lg">
                  <div className="text-blue-600 font-semibold mb-1">📄 Smart Processing</div>
                  <div className="text-gray-600">PDF, DOCX, TXT support</div>
                </div>
                <div className="p-3 bg-purple-50 rounded-lg">
                  <div className="text-purple-600 font-semibold mb-1">🎵 Multi-Voice Audio</div>
                  <div className="text-gray-600">2 languages, 3 voice types</div>
                </div>
                <div className="p-3 bg-green-50 rounded-lg">
                  <div className="text-green-600 font-semibold mb-1">🧠 AI Summaries</div>
                  <div className="text-gray-600">TL;DR, Standard, Detailed</div>
                </div>
                <div className="p-3 bg-orange-50 rounded-lg">
                  <div className="text-orange-600 font-semibold mb-1">♿ Accessibility</div>
                  <div className="text-gray-600">Dyslexic fonts, zoom, spacing</div>
                </div>
              </div>
              
              <div className="flex gap-3">
                <button
                  onClick={() => setShowFeatureHighlight(true) || setShowWelcomePopup(false)}
                  className="flex-1 bg-gradient-to-r from-indigo-500 to-purple-600 text-white px-6 py-3 rounded-lg font-medium hover:from-indigo-600 hover:to-purple-700 transition-all"
                >
                  Quick Tour
                </button>
                <button
                  onClick={() => setShowWelcomePopup(false)}
                  className="flex-1 bg-gray-100 text-gray-700 px-6 py-3 rounded-lg font-medium hover:bg-gray-200 transition-colors"
                >
                  Get Started
                </button>
              </div>
              
              <div className="mt-4 text-xs text-gray-500">
                © 2025 DyslexoFly - MIT License | Built for Pragati AI Hackathon
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Feature Highlight Popup */}
      <AnimatePresence>
        {showFeatureHighlight && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full p-8"
            >
              <h3 className="text-xl font-bold text-gray-900 mb-6 text-center">🌟 Key Features</h3>
              
              <div className="grid gap-4 mb-6">
                <div className="flex items-start space-x-4 p-4 bg-gray-50 rounded-lg">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-blue-600 text-lg">📚</span>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">Smart Text Processing</h4>
                    <p className="text-gray-600 text-sm">Upload PDFs, Word docs, or text files. Our AI extracts and processes content with high accuracy.</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-4 p-4 bg-gray-50 rounded-lg">
                  <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-purple-600 text-lg">🎯</span>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">Multiple Summary Types</h4>
                    <p className="text-gray-600 text-sm">Get TL;DR (quick), Standard (balanced), or Detailed (comprehensive) AI-generated summaries.</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-4 p-4 bg-gray-50 rounded-lg">
                  <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-green-600 text-lg">🔊</span>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">Multi-Language Audio</h4>
                    <p className="text-gray-600 text-sm">Text-to-speech in 7 languages with male, female, and child voice options.</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-4 p-4 bg-gray-50 rounded-lg">
                  <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-orange-600 text-lg">♿</span>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">Accessibility Features</h4>
                    <p className="text-gray-600 text-sm">Dyslexic-friendly fonts, adjustable text size, line spacing, search, and zoom controls.</p>
                  </div>
                </div>
              </div>
              
              <button
                onClick={() => setShowFeatureHighlight(false)}
                className="w-full bg-gradient-to-r from-indigo-500 to-purple-600 text-white px-6 py-3 rounded-lg font-medium hover:from-indigo-600 hover:to-purple-700 transition-all"
              >
                Start Using DyslexoFly
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-indigo-50 via-blue-50 to-cyan-50 relative overflow-hidden py-12">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          animate={{ 
            x: [0, 100, 0],
            y: [0, 50, 0],
            rotate: [0, 180, 360]
          }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          className="absolute top-10 left-10 w-32 h-32 bg-gradient-to-r from-purple-400/20 to-pink-400/20 rounded-full blur-xl"
        />
        <motion.div
          animate={{ 
            x: [0, -150, 0],
            y: [0, 100, 0],
            rotate: [360, 180, 0]
          }}
          transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
          className="absolute top-1/3 right-20 w-40 h-40 bg-gradient-to-r from-blue-400/20 to-indigo-400/20 rounded-full blur-xl"
        />
        <motion.div
          animate={{ 
            x: [0, 80, 0],
            y: [0, -60, 0],
            rotate: [0, 90, 180]
          }}
          transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
          className="absolute bottom-20 left-1/3 w-36 h-36 bg-gradient-to-r from-green-400/20 to-emerald-400/20 rounded-full blur-xl"
        />
      </div>
      
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 bg-clip-text text-transparent mb-4">
            📚 Upload Learning Materials
          </h1>
          <p className="text-lg text-gray-700 max-w-2xl mx-auto">
            Transform your educational content into <span className="font-semibold text-indigo-600">dyslexia-friendly formats</span> with AI-powered audio and summaries! 🎵✨
          </p>
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className="bg-white/95 backdrop-blur-sm rounded-3xl shadow-2xl overflow-hidden border border-purple-200/50"
        >
          <div className="p-6 md:p-8">
            <form onSubmit={handleSubmit}>
              <FileUploader 
                onFileSelected={setFile} 
                isUploading={isUploading} 
              />
              
              {error && (
                <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 rounded-r-lg text-red-700">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <svg className="h-5 w-5 text-red-500" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div className="ml-3">
                      <p className="text-sm font-medium">Backend Server Not Connected</p>
                      <p className="text-sm mt-1">{error}</p>
                      <div className="mt-3">
                        <details className="text-sm">
                          <summary className="text-red-800 cursor-pointer font-medium">How to fix this?</summary>
                          <div className="mt-2 pl-2 border-l-2 border-red-300">
                            <p className="mb-1">1. Make sure the Python backend server is running</p>
                            <p className="mb-1">2. Open a terminal and navigate to your backend folder</p>
                            <p className="mb-1">3. Run the command: <code className="bg-red-100 px-1 py-0.5 rounded">python app.py</code></p>
                            <p className="mt-2">If you don&apos;t have a backend server set up yet, you can continue using the frontend features in demo mode.</p>
                          </div>
                        </details>
                        <button 
                          type="button" 
                          onClick={testBackendConnection}
                          className="mt-2 text-sm text-red-800 bg-red-100 hover:bg-red-200 px-3 py-1 rounded-full font-medium transition-colors"
                        >
                          Try Again
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
              
              {isUploading && (
                <ProcessingStatus 
                  progress={uploadProgress} 
                  status={status}
                  isComplete={isComplete}
                  error={error && isUploading ? error : null}
                  stages={processingStages}
                  currentStage={currentStage}
                  estimatedTime={estimatedTime}
                  fileSize={fileSize}
                />
              )}
              
              <button
                type="submit"
                disabled={isUploading || !file}
                className="w-full py-3 px-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg hover:from-indigo-700 hover:to-purple-700 disabled:from-gray-400 disabled:to-gray-500 disabled:cursor-not-allowed transition-all transform hover:scale-[1.02] active:scale-[0.98] font-medium shadow-md"
              >
                {isUploading ? 'Processing...' : 'Upload and Process'}
              </button>
            </form>
            
            <div className="mt-8 border-t border-indigo-100 pt-6">
              <h3 className="text-lg font-medium text-indigo-900 mb-4">Supported File Formats</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {supportedFormats.map((format) => (
                  <div 
                    key={format.ext} 
                    className="bg-gradient-to-br from-indigo-50 to-purple-50 p-3 rounded-lg text-center border border-indigo-100 shadow-sm"
                  >
                    <p className="font-bold text-indigo-800">{format.ext}</p>
                    <p className="text-xs text-indigo-600">{format.description}</p>
                  </div>
                ))}
              </div>
            </div>
            
            {/* Demo Mode Section */}
            <div className="mt-8 border-t border-indigo-100 pt-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-indigo-900">Try a Demo Document</h3>
                <span className="text-xs bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-3 py-1 rounded-full">
                  No Backend Needed
                </span>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {demoDocuments.map((doc) => (
                  <Link
                    key={doc.id}
                    href={`/results?id=${encodeURIComponent(doc.id)}`}
                    className="group block bg-white rounded-xl shadow-sm border border-indigo-100 hover:shadow-md hover:border-indigo-300 transition-all p-4"
                  >
                    <div className="flex items-center space-x-3">
                      <div className={`text-3xl ${doc.iconBg} p-2 rounded-full`}>{doc.icon}</div>
                      <div>
                        <h4 className="font-medium text-indigo-900 group-hover:text-indigo-700">{doc.name}</h4>
                        <p className="text-xs text-indigo-600 mt-0.5">{doc.description}</p>
                      </div>
                    </div>
                    <div className="mt-4 text-center">
                      <span className="inline-flex items-center text-xs font-medium bg-indigo-50 text-indigo-700 group-hover:bg-indigo-100 px-2.5 py-0.5 rounded-full">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                        </svg>
                        View Demo Results
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
              
              <div className="mt-4 text-center">
                <p className="text-sm text-indigo-600">
                  These demo documents showcase the capabilities of DyslexoFly without requiring a backend server.
                </p>
              </div>
            </div>
          </div>
        </motion.div>
        
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mt-6 text-center"
        >
          <Link href="/" className="inline-flex items-center space-x-2 text-indigo-600 hover:text-indigo-800 font-medium transition-colors">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            <span>Back to Home</span>
          </Link>
        </motion.div>
      </div>
    </div>
    
    {/* Floating Actions */}
    <FloatingActions />
    </>
  )}
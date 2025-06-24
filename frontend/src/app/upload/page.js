'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import FileUploader from '@/components/FileUploader'
import ProcessingStatus from '@/components/ProcessingStatus'

export default function Upload() {
  const [file, setFile] = useState(null)
  const [isUploading, setIsUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [status, setStatus] = useState('')
  const [error, setError] = useState("")
  const [isComplete, setIsComplete] = useState(false)
  const router = useRouter()

  useEffect(() => {
    testBackendConnection();
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
    setUploadProgress(10);
    setStatus('Uploading file...');

    const formData = new FormData();
    formData.append('file', file);

    try {
      // Upload file
      const response = await fetch('http://127.0.0.1:5000/api/upload', {
        method: 'POST',
        body: formData,
      });

      setUploadProgress(60);
      setStatus('Extracting text...');

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Upload failed with status: ${response.status}`);
      }

      const data = await response.json();

      setUploadProgress(100);
      setStatus('Upload complete!');

      setTimeout(() => {
        router.push(`/results?id=${encodeURIComponent(data.filename)}`);
      }, 1000);

    } catch (err) {
      console.error("Upload error:", err);
      setError(err.message || 'Connection error. Is the backend server running?');
      setIsUploading(false);
      setUploadProgress(0);
      setStatus('');
    }
  }

  const supportedFormats = [
    { ext: 'PDF', description: 'Adobe PDF Documents' },
    { ext: 'DOCX', description: 'Microsoft Word Documents' },
    { ext: 'TXT', description: 'Plain Text Files' },
    { ext: 'JPG/PNG', description: 'Image Files (with text)' },
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
    <div className="min-h-screen pattern-bg py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-indigo-900 mb-4">Upload Learning Materials</h1>
          <p className="text-indigo-700 max-w-2xl mx-auto">
            Transform your educational content into dyslexia-friendly formats with audio and summaries.
          </p>
        </div>
        
        <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl overflow-hidden border border-indigo-100">
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
                            <p className="mt-2">If you don't have a backend server set up yet, you can continue using the frontend features in demo mode.</p>
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
        </div>
        
        <div className="mt-6 text-center">
          <Link href="/" className="text-indigo-600 hover:text-indigo-800 font-medium">
            Back to Home
          </Link>
        </div>
      </div>
    </div>
  )
}
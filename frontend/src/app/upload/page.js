'use client'

import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function Upload() {
  const [file, setFile] = useState(null)
  const [isUploading, setIsUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [error, setError] = useState("")
  const fileInputRef = useRef(null)
  const router = useRouter()

  useEffect(() => {
    testBackendConnection();
  }, []);

  const testBackendConnection = async () => {
    try {
      const response = await fetch('http://127.0.0.1:5000/');
      const text = await response.text();
      console.log('Backend connection successful:', text);
      setError(''); // Clear any previous errors
    } catch (err) {
      console.error('Backend connection failed:', err);
      setError('Cannot connect to backend server. Please ensure it is running at http://127.0.0.1:5000');
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!file) {
      setError("Please select a file first")
      return
    }

    setIsUploading(true)
    setError("")
    setUploadProgress(0)
    
    const formData = new FormData()
    formData.append('file', file)
    
    try {
      // Simulate progress updates
      const progressInterval = setInterval(() => {
        setUploadProgress((prev) => {
          const newProgress = prev + 5
          if (newProgress >= 90) {
            clearInterval(progressInterval)
            return 90
          }
          return newProgress
        })
      }, 300)
      
      const response = await fetch('http://127.0.0.1:5000/api/upload', {
        method: 'POST',
        body: formData,
      })
      
      clearInterval(progressInterval)
      setUploadProgress(100)
      
      if (!response.ok) {
        // Try to get error message from response
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Upload failed with status: ${response.status}`);
      }
      
      const data = await response.json()
      
      // Short delay to show 100% progress
      setTimeout(() => {
        router.push(`/results?id=${encodeURIComponent(data.filename)}`)
      }, 500)
      
    } catch (err) {
      console.error("Upload error:", err);
      setError(err.message || 'Connection error. Is the backend server running?');
      setIsUploading(false);
      setUploadProgress(0);
    }
  }

  const handleDragOver = (e) => {
    e.preventDefault()
    e.stopPropagation()
  }

  const handleDrop = (e) => {
    e.preventDefault()
    e.stopPropagation()
    
    const newFile = e.dataTransfer.files[0]
    if (newFile) {
      setFile(newFile)
      setError("")
    }
  }

  const supportedFormats = [
    { ext: 'PDF', description: 'Adobe PDF Documents' },
    { ext: 'DOCX', description: 'Microsoft Word Documents' },
    { ext: 'TXT', description: 'Plain Text Files' },
    { ext: 'JPG/PNG', description: 'Image Files (with text)' },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-4">Upload Learning Materials</h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Transform your educational content into dyslexia-friendly formats with audio and summaries.
          </p>
        </div>
        
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="p-6 md:p-8">
            <form onSubmit={handleSubmit}>
              <div 
                className={`border-2 border-dashed rounded-xl p-8 mb-6 text-center 
                  ${file ? 'border-blue-400 bg-blue-50' : 'border-gray-300 hover:border-blue-300'} 
                  transition-colors duration-200`}
                onDragOver={handleDragOver}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  className="hidden"
                  onChange={(e) => {
                    if (e.target.files[0]) {
                      setFile(e.target.files[0])
                      setError("")
                    }
                  }}
                  accept=".pdf,.docx,.doc,.txt,.png,.jpg,.jpeg"
                />
                
                <div className="flex flex-col items-center justify-center py-4">
                  {file ? (
                    <>
                      <div className="mb-4 p-3 bg-white rounded-full">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                      <p className="text-lg font-medium text-gray-800">{file.name}</p>
                      <p className="text-sm text-gray-500 mt-1">
                        {(file.size / (1024 * 1024)).toFixed(2)} MB
                      </p>
                      <button 
                        type="button"
                        className="mt-4 text-sm text-blue-600 hover:text-blue-800 font-medium"
                        onClick={(e) => {
                          e.stopPropagation()
                          setFile(null)
                        }}
                      >
                        Change file
                      </button>
                    </>
                  ) : (
                    <>
                      <div className="mb-4 p-3 bg-blue-100 rounded-full">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                        </svg>
                      </div>
                      <p className="text-lg font-medium text-gray-800">Drag and drop your file here</p>
                      <p className="text-sm text-gray-500 mt-1">or click to browse files</p>
                    </>
                  )}
                </div>
              </div>
              
              {error && (
                <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 text-red-700">
                  <p className="font-medium">Error</p>
                  <p>{error}</p>
                </div>
              )}
              
              {isUploading && (
                <div className="mb-6">
                  <div className="flex justify-between text-sm font-medium text-gray-700 mb-1">
                    <span>Uploading...</span>
                    <span>{uploadProgress}%</span>
                  </div>
                  <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-blue-500 transition-all duration-300"
                      style={{ width: `${uploadProgress}%` }}
                    ></div>
                  </div>
                </div>
              )}
              
              <button
                type="submit"
                disabled={isUploading || !file}
                className="w-full py-3 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors font-medium"
              >
                {isUploading ? 'Processing...' : 'Upload and Process'}
              </button>
            </form>
            
            <div className="mt-8 border-t border-gray-200 pt-6">
              <h3 className="text-lg font-medium text-gray-800 mb-4">Supported File Formats</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {supportedFormats.map((format) => (
                  <div key={format.ext} className="bg-gray-50 p-3 rounded-lg text-center">
                    <p className="font-bold text-gray-700">{format.ext}</p>
                    <p className="text-xs text-gray-500">{format.description}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
        
        <div className="mt-6 text-center">
          <Link href="/" className="text-blue-600 hover:underline">
            Back to Home
          </Link>
        </div>
      </div>
    </div>
  )
}
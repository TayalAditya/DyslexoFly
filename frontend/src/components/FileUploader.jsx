'use client'

import { useState, useRef, useEffect } from 'react'

export default function FileUploader({ onFileSelected, isUploading }) {
  const [isDragActive, setIsDragActive] = useState(false)
  const [isDragAccept, setIsDragAccept] = useState(false)
  const [isDragReject, setIsDragReject] = useState(false)
  const [selectedFile, setSelectedFile] = useState(null)
  const [filePreview, setFilePreview] = useState(null)
  const fileInputRef = useRef(null)
  
  const acceptedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'text/plain', 'image/jpeg', 'image/png']

  const handleDragOver = (e) => {
    e.preventDefault()
    setIsDragActive(true)
  }

  const handleDragLeave = (e) => {
    e.preventDefault()
    setIsDragActive(false)
  }

  const handleDrop = (e) => {
    e.preventDefault()
    setIsDragActive(false)
    
    if (isUploading) return
    
    const files = e.dataTransfer.files
    if (files && files.length > 0) {
      const file = files[0]
      
      if (acceptedTypes.includes(file.type)) {
        setIsDragAccept(true)
        setIsDragReject(false)
        setSelectedFile(file)
        onFileSelected(file)
        generatePreview(file)
        
        setTimeout(() => setIsDragAccept(false), 2000)
      } else {
        setIsDragReject(true)
        setIsDragAccept(false)
        
        setTimeout(() => setIsDragReject(false), 2000)
      }
    }
  }

  const handleFileChange = (e) => {
    if (isUploading) return
    
    const files = e.target.files
    if (files && files.length > 0) {
      const file = files[0]
      setSelectedFile(file)
      onFileSelected(file)
      generatePreview(file)
    }
  }

  const handleClick = () => {
    if (isUploading) return
    fileInputRef.current?.click()
  }
  
  const generatePreview = (file) => {
    if (file.type.startsWith('image/')) {
      const reader = new FileReader()
      reader.onload = (e) => {
        setFilePreview(e.target.result)
      }
      reader.readAsDataURL(file)
    } else if (file.type === 'application/pdf') {
      setFilePreview('pdf')
    } else if (file.type.includes('word')) {
      setFilePreview('docx') 
    } else if (file.type === 'text/plain') {
      setFilePreview('txt')
    }
  }

  const renderPreviewIcon = () => {
    if (filePreview === 'pdf') {
      return (
        <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center text-red-700">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
          </svg>
        </div>
      )
    } else if (filePreview === 'docx') {
      return (
        <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center text-blue-700">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        </div>
      )
    } else if (filePreview === 'txt') {
      return (
        <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center text-gray-700">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        </div>
      )
    } else if (typeof filePreview === 'string' && filePreview.startsWith('data:image')) {
      return (
        <div className="w-12 h-12 bg-gray-100 rounded-full overflow-hidden">
          <img src={filePreview} alt="Preview" className="w-full h-full object-cover" />
        </div>
      )
    }
    
    return (
      <svg className="w-12 h-12 mx-auto text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
      </svg>
    )
  }

  const acceptedFileTypes = ".pdf,.doc,.docx,.txt,.jpg,.jpeg,.png"

  return (
    <div className="mb-6">
      <div
        className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all duration-300 ${
          isDragActive 
            ? 'border-indigo-500 bg-indigo-50 scale-[1.01]' 
            : isDragAccept
              ? 'border-green-400 bg-green-50'
              : isDragReject
                ? 'border-red-400 bg-red-50'
                : selectedFile 
                  ? 'border-green-400 bg-green-50' 
                  : 'border-gray-300 hover:border-indigo-400 bg-gray-50 hover:bg-indigo-50/50'
        } ${isUploading ? 'opacity-75 pointer-events-none' : ''}`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={handleClick}
        role="button"
        tabIndex={0}
        aria-label="Upload file by clicking or dragging and dropping"
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            handleClick();
          }
        }}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept={acceptedFileTypes}
          className="hidden"
          onChange={handleFileChange}
          disabled={isUploading}
          aria-label="File upload input"
        />
        
        {isDragReject && (
          <div className="animate-bounce">
            <svg className="w-12 h-12 mx-auto text-red-500 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
            <p className="text-lg font-medium text-red-700 mb-1">Unsupported File Format</p>
            <p className="text-sm text-red-600">Please select a PDF, DOCX, TXT, JPG or PNG file</p>
          </div>
        )}
        
        {selectedFile && !isDragReject ? (
          <div className="animate-fadeIn">
            <div className="flex items-center justify-center mb-2">
              {renderPreviewIcon()}
            </div>
            <p className="text-lg font-medium text-green-700 mb-1">{selectedFile.name}</p>
            <p className="text-sm text-green-600">File selected - {(selectedFile.size / 1024 / 1024).toFixed(2)} MB</p>
            <button 
              type="button" 
              className="mt-3 text-sm text-green-700 hover:text-green-800 underline"
              onClick={(e) => {
                e.stopPropagation()
                if (isUploading) return
                setSelectedFile(null)
                setFilePreview(null)
                onFileSelected(null)
                fileInputRef.current.value = null
              }}
            >
              Change file
            </button>
          </div>
        ) : !isDragReject && (
          <div className="transition-all duration-300">
            <svg className={`w-12 h-12 mx-auto ${isDragActive ? 'text-indigo-600 animate-pulse' : 'text-indigo-500'} mb-3`} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"></path>
            </svg>
            <p className={`font-medium text-lg mb-1 ${isDragActive ? 'text-indigo-700' : 'text-indigo-900'}`}>
              {isDragActive ? 'Drop your file here' : 'Drag and drop your file here'}
            </p>
            <p className="text-indigo-700 mb-3">or click to browse files</p>
            <p className="text-sm text-indigo-600">Supported formats: PDF, DOCX, TXT, PNG, JPG</p>
          </div>
        )}
      </div>
    </div>
  )
}
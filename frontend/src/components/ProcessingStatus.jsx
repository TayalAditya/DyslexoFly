'use client'

import { useState, useEffect } from 'react'

export default function ProcessingStatus({ progress, status, isComplete, error }) {
  const [animatedProgress, setAnimatedProgress] = useState(0)
  
  useEffect(() => {
    // Smoothly animate the progress bar
    const animationFrame = requestAnimationFrame(() => {
      if (animatedProgress < progress) {
        setAnimatedProgress(Math.min(animatedProgress + 1, progress))
      }
    })
    
    return () => cancelAnimationFrame(animationFrame)
  }, [animatedProgress, progress])
  
  const getBackgroundColor = () => {
    if (error) return 'bg-red-500'
    if (isComplete) return 'bg-green-500'
    return 'bg-indigo-500'
  }

  if (error) {
    return (
      <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-md mb-6">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-red-500" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-red-800">Processing Error</h3>
            <p className="mt-1 text-sm text-red-700">{error}</p>
          </div>
        </div>
      </div>
    )
  }
  
  if (!progress && !status) {
    return null
  }
  
  return (
    <div className="mb-6">
      <div className="flex justify-between mb-1">
        <span className="text-sm font-medium text-indigo-700">{error ? 'Error' : status}</span>
        <span className="text-sm font-medium text-indigo-700">{progress}%</span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2.5">
        <div 
          className={`h-2.5 rounded-full transition-all duration-500 ${getBackgroundColor()}`} 
          style={{ width: `${progress}%` }}
        ></div>
      </div>
      
      {isComplete && (
        <div className="mt-3 text-green-700 bg-green-50 rounded-lg p-3 border border-green-200 flex items-start">
          <svg className="w-5 h-5 mr-2 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
          </svg>
          <span>Processing complete! Redirecting to results...</span>
        </div>
      )}
      
      {error && !isComplete && (
        <div className="mt-3 text-red-700 bg-red-50 rounded-lg p-3 border border-red-200 flex items-start">
          <svg className="w-5 h-5 mr-2 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
          </svg>
          <span>{error}</span>
        </div>
      )}
    </div>
  )
}
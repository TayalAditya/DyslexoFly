'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

export default function ProcessingStatus({ 
  progress, 
  status, 
  isComplete, 
  error, 
  stages = [],
  currentStage = 0,
  estimatedTime = null,
  fileSize = null 
}) {
  const [animatedProgress, setAnimatedProgress] = useState(0)
  const [timeElapsed, setTimeElapsed] = useState(0)
  const [startTime] = useState(Date.now())
  
  // Animate progress smoothly
  useEffect(() => {
    const interval = setInterval(() => {
      setAnimatedProgress(prev => {
        if (prev < progress) {
          return Math.min(prev + 2, progress)
        }
        return prev
      })
    }, 50)
    
    return () => clearInterval(interval)
  }, [progress])

  // Track elapsed time
  useEffect(() => {
    const interval = setInterval(() => {
      setTimeElapsed(Math.floor((Date.now() - startTime) / 1000))
    }, 1000)
    
    return () => clearInterval(interval)
  }, [startTime])
  
  const getBackgroundColor = () => {
    if (error) return 'bg-red-500'
    if (isComplete) return 'bg-green-500'
    if (progress > 75) return 'bg-blue-500'
    if (progress > 50) return 'bg-indigo-500'
    return 'bg-purple-500'
  }

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const formatFileSize = (bytes) => {
    if (!bytes) return ''
    const mb = (bytes / (1024 * 1024)).toFixed(1)
    return `${mb} MB`
  }

  if (error) {
    return (
      <motion.div 
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-red-50 border-l-4 border-red-500 p-4 rounded-md mb-6"
      >
        <div className="flex">
          <div className="flex-shrink-0">
            <motion.svg 
              className="h-5 w-5 text-red-500" 
              viewBox="0 0 20 20" 
              fill="currentColor"
              animate={{ rotate: [0, 10, -10, 0] }}
              transition={{ duration: 0.5 }}
            >
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </motion.svg>
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-red-800">Processing Error</h3>
            <p className="mt-1 text-sm text-red-700">{error}</p>
            <div className="mt-2 text-xs text-red-600">
              Time elapsed: {formatTime(timeElapsed)}
            </div>
          </div>
        </div>
      </motion.div>
    )
  }
  
  if (!progress && !status) {
    return null
  }
  
  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="mb-6 bg-white rounded-lg shadow-sm border border-indigo-100 overflow-hidden"
    >
      {/* Header with status and progress */}
      <div className="p-4 bg-gradient-to-r from-indigo-50 to-purple-50">
        <div className="flex justify-between items-center mb-2">
          <div className="flex items-center space-x-2">
            <motion.div
              animate={{ rotate: isComplete ? 0 : 360 }}
              transition={{ duration: 2, repeat: isComplete ? 0 : Infinity, ease: "linear" }}
              className={`w-4 h-4 rounded-full ${isComplete ? 'bg-green-500' : 'bg-indigo-500'}`}
            />
            <span className="text-sm font-medium text-indigo-900">
              {error ? 'Error' : status}
            </span>
          </div>
          <div className="text-right">
            <span className="text-lg font-bold text-indigo-900">{animatedProgress}%</span>
            <div className="text-xs text-indigo-600">
              {formatTime(timeElapsed)} elapsed
            </div>
          </div>
        </div>
        
        {/* Progress bar */}
        <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
          <motion.div 
            className={`h-3 rounded-full transition-all duration-300 ${getBackgroundColor()}`}
            initial={{ width: 0 }}
            animate={{ width: `${animatedProgress}%` }}
            transition={{ duration: 0.5, ease: "easeOut" }}
          />
        </div>
        
        {/* File info */}
        {fileSize && (
          <div className="mt-2 text-xs text-indigo-600">
            Processing {formatFileSize(fileSize)} file
          </div>
        )}
      </div>

      {/* Stages breakdown */}
      {stages.length > 0 && (
        <div className="p-4 space-y-3">
          <h4 className="text-sm font-medium text-gray-800">Processing Stages</h4>
          {stages.map((stage, index) => (
            <motion.div 
              key={index}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className={`flex items-center space-x-3 p-2 rounded-lg ${
                index < currentStage ? 'bg-green-50 text-green-800' :
                index === currentStage ? 'bg-blue-50 text-blue-800' :
                'bg-gray-50 text-gray-500'
              }`}
            >
              <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                index < currentStage ? 'bg-green-500 text-white' :
                index === currentStage ? 'bg-blue-500 text-white' :
                'bg-gray-300 text-gray-600'
              }`}>
                {index < currentStage ? '✓' : index + 1}
              </div>
              <span className="text-sm font-medium">{stage.name}</span>
              {index === currentStage && (
                <motion.div
                  animate={{ opacity: [1, 0.5, 1] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                  className="ml-auto"
                >
                  <div className="w-2 h-2 bg-blue-500 rounded-full" />
                </motion.div>
              )}
              {index < currentStage && (
                <div className="ml-auto text-xs text-green-600">
                  {stage.duration || 'Complete'}
                </div>
              )}
            </motion.div>
          ))}
        </div>
      )}

      {/* Completion message */}
      <AnimatePresence>
        {isComplete && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-4 bg-green-50 border-t border-green-200"
          >
            <div className="flex items-center space-x-2">
              <motion.svg 
                className="w-5 h-5 text-green-600" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 500, damping: 30 }}
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </motion.svg>
              <span className="text-sm font-medium text-green-800">
                Processing complete! Redirecting to results...
              </span>
            </div>
            <div className="mt-1 text-xs text-green-600">
              Total time: {formatTime(timeElapsed)}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Estimated time remaining */}
      {!isComplete && !error && estimatedTime && (
        <div className="px-4 pb-4">
          <div className="text-xs text-indigo-600 bg-indigo-50 rounded-lg p-2">
            <div className="flex justify-between">
              <span>Estimated time remaining:</span>
              <span className="font-medium">{estimatedTime}</span>
            </div>
          </div>
        </div>
      )}
    </motion.div>
  )
}
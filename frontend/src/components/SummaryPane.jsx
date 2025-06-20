'use client'

import { useState } from 'react'
import { useAccessibility } from './AccessibilityProvider'

export default function SummaryPane({ summary }) {
  const { fontFamily } = useAccessibility()
  const [summaryLength, setSummaryLength] = useState('medium') // short, medium, detailed
  
  if (!summary) {
    return (
      <div className="h-full flex items-center justify-center">
        <p className="text-gray-500">No summary available</p>
      </div>
    )
  }
  
  // In a real app, you'd generate these summaries or fetch them from an API
  // This is just a simple simulation
  const getSummaryByLength = () => {
    const fullSummary = summary;
    
    switch (summaryLength) {
      case 'short':
        // Return about 30% of the full summary
        return fullSummary.split(' ').slice(0, Math.max(3, Math.floor(fullSummary.split(' ').length * 0.3))).join(' ') + '...';
      case 'detailed':
        // Return the full summary with some additional details
        return fullSummary + ' Additional context and details would be provided in the detailed view.';
      default:
        // Medium - return the full summary as is
        return fullSummary;
    }
  }
  
  return (
    <div className="bg-white rounded-lg shadow p-4 h-full overflow-y-auto">
      <div className="flex justify-between mb-4">
        <h2 className="font-bold text-lg text-gray-800">Summary</h2>
        <div className="flex space-x-2">
          <button
            onClick={() => navigator.clipboard.writeText(getSummaryByLength())}
            className="text-blue-600 hover:text-blue-800"
            title="Copy to clipboard"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path d="M8 2a1 1 0 000 2h2a1 1 0 100-2H8z" />
              <path d="M3 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v6h-4.586l1.293-1.293a1 1 0 00-1.414-1.414l-3 3a1 1 0 000 1.414l3 3a1 1 0 001.414-1.414L10.414 13H15v3a2 2 0 01-2 2H5a2 2 0 01-2-2V5zM15 11h2a1 1 0 110 2h-2v-2z" />
            </svg>
          </button>
        </div>
      </div>
      
      <div className="mb-4">
        <div className="flex items-center justify-between">
          <label htmlFor="summary-length" className="block text-sm font-medium text-gray-700">
            Summary Length
          </label>
          <span className="text-sm text-gray-500">
            {summaryLength === 'short' ? 'TL;DR' : summaryLength === 'medium' ? 'Standard' : 'Detailed'}
          </span>
        </div>
        <input
          type="range"
          id="summary-length"
          min="1"
          max="3"
          step="1"
          value={summaryLength === 'short' ? 1 : summaryLength === 'medium' ? 2 : 3}
          onChange={(e) => {
            const val = parseInt(e.target.value);
            setSummaryLength(val === 1 ? 'short' : val === 2 ? 'medium' : 'detailed');
          }}
          className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600 mt-1"
        />
        <div className="flex justify-between text-xs text-gray-500 mt-1">
          <span>Brief</span>
          <span>Standard</span>
          <span>Detailed</span>
        </div>
      </div>
      
      <div className="bg-blue-50 p-4 rounded-lg border border-blue-100 accessible-content"
           style={{ fontFamily }}>
        <p className="text-gray-800">{getSummaryByLength()}</p>
      </div>
      
      <div className="mt-4 flex justify-center">
        <div className="inline-flex rounded-md" role="group">
          <button
            type="button"
            className={`px-4 py-2 text-sm font-medium rounded-l-lg ${
              summaryLength === 'short' 
                ? 'bg-blue-600 text-white' 
                : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
            }`}
            onClick={() => setSummaryLength('short')}
          >
            TL;DR
          </button>
          <button
            type="button"
            className={`px-4 py-2 text-sm font-medium ${
              summaryLength === 'medium' 
                ? 'bg-blue-600 text-white' 
                : 'bg-white text-gray-700 border-t border-b border-gray-300 hover:bg-gray-50'
            }`}
            onClick={() => setSummaryLength('medium')}
          >
            Standard
          </button>
          <button
            type="button"
            className={`px-4 py-2 text-sm font-medium rounded-r-lg ${
              summaryLength === 'detailed' 
                ? 'bg-blue-600 text-white' 
                : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
            }`}
            onClick={() => setSummaryLength('detailed')}
          >
            Detailed
          </button>
        </div>
      </div>
    </div>
  )
}
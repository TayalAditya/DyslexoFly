'use client'

import React, { useState, useEffect } from 'react';
import { useAccessibility } from './AccessibilityProvider';

// Single source of truth for file checks
const checkedFiles = {};

export default function SummarySection({ fileId }) {
  const { fontFamily, lineSpacing } = useAccessibility();
  const [activeTab, setActiveTab] = useState('tldr');
  
  // All summary states
  const [summaries, setSummaries] = useState({
    tldr: null,
    standard: null,
    detailed: null
  });
  
  // Track file status
  const [fileChecked, setFileChecked] = useState(false);
  const [fileExists, setFileExists] = useState(null);
  const [error, setError] = useState(null);
  
  // Track generation progress for each type
  const [generationStatus, setGenerationStatus] = useState({
    tldr: { loading: false, progress: 0, error: null },
    standard: { loading: false, progress: 0, error: null },
    detailed: { loading: false, progress: 0, error: null }
  });
  
  // For seeing if any summary type is loading
  const isAnySummaryLoading = 
    generationStatus.tldr.loading || 
    generationStatus.standard.loading || 
    generationStatus.detailed.loading;
  
  // Check file existence ONCE only
  useEffect(() => {
    if (!fileId) {
      setFileExists(false);
      return;
    }
    
    // Already checked this file - use cached result
    if (checkedFiles[fileId]) {
      console.log(`🔍 CACHED: File ${fileId} already verified`);
      setFileChecked(true);
      setFileExists(true);
      return;
    }
    
    // Mark file as checked BEFORE the request
    checkedFiles[fileId] = true;
    setFileChecked(true);
    
    fetch('http://127.0.0.1:5000/api/check-file', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ fileId })
    })
    .then(res => res.json())
    .then(data => {
      setFileExists(data.exists);
      
      if (data.exists) {
        // Auto-generate all summaries when file is found
        generateAllSummaries();
      }
    })
    .catch(err => {
      console.error(`❌ Check failed for ${fileId}:`, err);
      setFileExists(false);
      setError("Failed to verify document");
    });
  }, [fileId]);
  
  // Helper to map between UI and API types
  const getApiType = (uiType) => {
    return uiType === 'standard' ? 'brief' : uiType;
  };

  // Generate single summary type
  const generateSummary = (type) => {
    const apiType = getApiType(type);

    // Set loading state and start at 0%
    setGenerationStatus(prev => ({
      ...prev,
      [type]: { ...prev[type], loading: true, progress: 0, error: null }
    }));

    // Step 1: Request sent (simulate jump to 30%)
    setTimeout(() => {
      setGenerationStatus(prev => ({
        ...prev,
        [type]: { ...prev[type], progress: 30 }
      }));
    }, 200);

    // Make API call
    fetch('http://127.0.0.1:5000/api/generate-summary', {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({
        fileId: fileId,
        summaryType: apiType
      })
    })
    .then(res => {
      // Step 2: Response received (simulate jump to 60%)
      setGenerationStatus(prev => ({
        ...prev,
        [type]: { ...prev[type], progress: 60 }
      }));
      return res.json();
    })
    .then(data => {
      if (data.success) {
        // Step 3: Summary set (jump to 100%)
        setSummaries(prev => ({...prev, [type]: data.summary}));
        setGenerationStatus(prev => ({
          ...prev,
          [type]: { loading: false, progress: 100, error: null }
        }));
      } else {
        throw new Error(data.error || "Failed to generate summary");
      }
    })
    .catch(err => {
      setGenerationStatus(prev => ({
        ...prev,
        [type]: { loading: false, progress: 0, error: err.message }
      }));
    });
  };
  
  // Generate all summary types in parallel
  const generateAllSummaries = () => {
    // Start all three summary generations
    ['tldr', 'standard', 'detailed'].forEach(type => {
      if (!summaries[type]) {
        generateSummary(type);
      }
    });
  };

  return (
    <div className="flex flex-col h-full bg-white rounded-lg shadow-sm overflow-hidden">
      {/* Tabs Header */}
      <div className="flex border-b">
        {['tldr', 'standard', 'detailed'].map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-3 text-sm font-medium ${
              activeTab === tab 
                ? 'border-b-2 border-indigo-600 text-indigo-600' 
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            {tab === 'tldr' ? 'TL;DR' : tab.charAt(0).toUpperCase() + tab.slice(1)}
            
            {/* Progress indicator dot */}
            {generationStatus[tab].loading && (
              <span className="ml-2 inline-block w-2 h-2 bg-indigo-500 rounded-full animate-pulse"></span>
            )}
            
            {/* Completed indicator */}
            {!generationStatus[tab].loading && summaries[tab] && (
              <span className="ml-2 inline-block w-2 h-2 bg-green-500 rounded-full"></span>
            )}
          </button>
        ))}
      </div>
      
      {/* Content Area with scroll */}
      <div className="flex-1 overflow-y-auto p-6" style={{ 
        fontFamily, 
        lineHeight: lineSpacing 
      }}>
        {fileExists === false ? (
          <div className="text-center py-10 text-gray-500">
            <p className="mb-4">No document found</p>
            <p className="text-sm text-gray-400">Please upload a document to generate summaries</p>
          </div>
        ) : !fileChecked || fileExists === null ? (
          <div className="animate-pulse text-center py-10">
            <p className="text-gray-500">Checking document...</p>
          </div>
        ) : generationStatus[activeTab].loading ? (
          <div>
            <div className="mb-6">
              <div className="mb-2 flex justify-between items-center">
                <span className="text-sm font-medium text-indigo-600">
                  Generating {activeTab} summary...
                </span>
                <span className="text-xs font-medium text-indigo-900">
                  {Math.round(generationStatus[activeTab].progress)}%
                </span>
              </div>
              <div className="w-full h-2.5 bg-gray-200 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-indigo-600 rounded-full transition-all duration-300" 
                  style={{ width: `${generationStatus[activeTab].progress}%` }}
                ></div>
              </div>
            </div>
            
            <div className="animate-pulse">
              <div className="h-4 bg-blue-100 rounded mb-3 w-3/4"></div>
              <div className="h-4 bg-blue-100 rounded mb-3"></div>
              <div className="h-4 bg-blue-100 rounded mb-3 w-5/6"></div>
              <div className="h-4 bg-blue-100 rounded mb-3 w-2/3"></div>
              <div className="h-4 bg-blue-100 rounded mb-3 w-4/5"></div>
              <div className="h-4 bg-blue-100 rounded mb-3 w-2/3"></div>
            </div>
          </div>
        ) : summaries[activeTab] ? (
          <div>
            <p className="text-gray-700 whitespace-pre-line">{summaries[activeTab]}</p>
            <div className="mt-6 text-right">
              <button 
                className="px-4 py-2 bg-indigo-100 text-indigo-700 rounded-md hover:bg-indigo-200 text-sm font-medium flex items-center inline-flex"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
                Download Summary
              </button>
            </div>
          </div>
        ) : (
          <div className="text-center py-10 text-gray-500">
            <p className="mb-4">No {activeTab} summary available yet</p>
            
            {fileId && (
              <div>
                <button 
                  onClick={() => generateSummary(activeTab)}
                  className="px-6 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
                >
                  Generate {activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} Summary
                </button>
                
                <div className="mt-4">
                  <button 
                    onClick={generateAllSummaries}
                    className="px-6 py-2 border border-indigo-500 text-indigo-700 rounded-md hover:bg-indigo-50"
                  >
                    Generate All Summary Types
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
      
      {/* Overall Progress Dashboard */}
      {isAnySummaryLoading && (
        <div className="p-4 bg-gray-50 border-t">
          <h3 className="text-sm font-medium text-gray-800 mb-3">All Summaries Progress</h3>
          
          <div className="grid gap-3">
            {['tldr', 'standard', 'detailed'].map(type => (
              <div key={type} className={generationStatus[type].loading ? 'opacity-100' : 'opacity-50'}>
                <div className="flex justify-between items-center mb-1 text-xs">
                  <span className="font-medium text-gray-700">
                    {type === 'tldr' ? 'TL;DR' : type.charAt(0).toUpperCase() + type.slice(1)}
                  </span>
                  <span>{Math.round(generationStatus[type].progress)}%</span>
                </div>
                <div className="w-full h-1.5 bg-gray-100 rounded-full">
                  <div 
                    className="h-full bg-indigo-500 rounded-full transition-all duration-300" 
                    style={{ width: `${generationStatus[type].progress}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      
      {/* Error message */}
      {error && (
        <div className="p-3 bg-red-50 border-t border-red-100 text-red-600 flex justify-between">
          <span>{error}</span>
          <button onClick={() => setError(null)} className="font-medium">Dismiss</button>
        </div>
      )}
    </div>
  );
}
'use client'

import React, { useState, useEffect } from 'react';
import { useAccessibility } from './AccessibilityProvider'

const SummaryPane = ({ fileId }) => {
  const { fontFamily, lineSpacing } = useAccessibility()
  const [summaryType, setSummaryType] = useState('tldr');
  const [summaries, setSummaries] = useState({
    tldr: null,
    standard: null,
    detailed: null
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [sliderPosition, setSliderPosition] = useState(25); // Default to TLDR/Brief
  const [fileExists, setFileExists] = useState(null); // Changed to null initially for loading state

  // Check if file exists when fileId changes
  useEffect(() => {
    if (!fileId) {
      setFileExists(false);
      return;
    }
    
    // Reset file exists state when fileId changes
    setFileExists(null);
    setError(null); // Clear any previous errors
    
    console.log(`Checking if file exists: ${fileId}`);
    
    // Check if file exists
    fetch('http://127.0.0.1:5000/api/check-file', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ fileId })
    })
    .then(res => res.json())
    .then(data => {
      console.log("File check response:", data);
      setFileExists(data.exists);
      
      // If file exists, fetch initial summary
      if (data.exists && !summaries[summaryType]) {
        fetchSummary(summaryType);
      } else if (!data.exists) {
        // Don't set error here - we'll handle this with the fileExists state
        console.log("File does not exist:", fileId);
      }
    })
    .catch(err => {
      console.error("Error checking file:", err);
      setFileExists(false);
    });
  }, [fileId]);

  // When summary type changes, fetch that summary if needed
  useEffect(() => {
    if (fileExists === true && fileId && !summaries[summaryType] && !loading) {
      fetchSummary(summaryType);
    }
  }, [summaryType]);

  // Function to fetch summary
  const fetchSummary = async (type) => {
    if (summaries[type] || fileExists !== true) return;
    
    setLoading(true);
    setError(null);
    
    try {
      // Map UI types to API types
      const apiType = type === 'standard' ? 'brief' : type;
      
      console.log(`Fetching summary with type: ${apiType}`);  // Debug log
      
      const response = await fetch('http://127.0.0.1:5000/api/generate-summary', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          fileId: fileId,
          summaryType: apiType
        })
      });
      
      if (!response.ok) {
        throw new Error(`Server responded with status: ${response.status}`);
      }
      
      const data = await response.json();
      console.log("API response:", data);  // Debug log
      
      if (data.success) {
        setSummaries(prev => ({
          ...prev,
          [type]: data.summary
        }));
      } else {
        // If the error contains "file not found", update fileExists state
        if (data.error && data.error.toLowerCase().includes("file not found")) {
          setFileExists(false);
        } else {
          // Only set errors that aren't about file existence
          setError(data.error || 'Failed to generate summary');
        }
      }
    } catch (err) {
      console.error("Error fetching summary:", err);
      setError(`Network error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Get correct API type from UI type
  const getApiSummaryType = (type) => {
    return type === 'standard' ? 'brief' : type;
  };

  return (
    <div className="h-full flex flex-col">
      {/* Summary content only - NO HEADING */}
      <div className="flex-1 bg-blue-50 rounded-xl p-6">
        <div className="accessible-content" style={{ 
          fontFamily, 
          lineHeight: lineSpacing
        }}>
          {fileExists === false ? (
            <div className="text-center py-10 text-gray-500">
              <p className="mb-4">No document found</p>
              <p className="text-sm text-gray-400">Please upload a document to generate summaries</p>
              <button 
                onClick={() => {
                  setFileExists(null);
                  // Re-check if the file exists
                  fetch('http://127.0.0.1:5000/api/check-file', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ fileId })
                  })
                  .then(res => res.json())
                  .then(data => {
                    setFileExists(data.exists);
                  })
                  .catch(() => setFileExists(false));
                }}
                className="mt-4 px-3 py-1 bg-gray-200 text-gray-600 text-sm rounded hover:bg-gray-300"
              >
                Retry
              </button>
            </div>
          ) : fileExists === null ? (
            <div className="animate-pulse text-center py-10">
              <p className="text-gray-500">Checking document...</p>
            </div>
          ) : loading ? (
            <div className="animate-pulse">
              <div className="h-4 bg-blue-100 rounded mb-2 w-3/4"></div>
              <div className="h-4 bg-blue-100 rounded mb-2"></div>
              <div className="h-4 bg-blue-100 rounded mb-2 w-5/6"></div>
              <div className="h-4 bg-blue-100 rounded mb-2 w-2/3"></div>
            </div>
          ) : summaries[summaryType] ? (
            <p className="text-gray-700">{summaries[summaryType]}</p>
          ) : (
            <div className="text-center py-10 text-gray-500">
              <p className="mb-4">No summary available</p>
              
              {fileId && (
                <button 
                  onClick={() => fetchSummary(summaryType)}
                  className="px-6 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
                >
                  Generate {summaryType === 'tldr' ? 'brief' : 
                           summaryType === 'standard' ? 'standard' : 
                           'detailed'} summary
                </button>
              )}
            </div>
          )}
        </div>
      </div>
      
      {/* Only show errors that aren't related to file existence */}
      {error && !error.toLowerCase().includes("file not found") && (
        <div className="mt-4 p-3 bg-red-50 border border-red-100 text-red-600 rounded flex justify-between">
          <span>{error}</span>
          <button onClick={() => setError(null)} className="font-medium">Dismiss</button>
        </div>
      )}
    </div>
  )
}

export default SummaryPane;
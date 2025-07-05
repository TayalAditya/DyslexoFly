'use client'

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAccessibility } from './AccessibilityProvider';
import { DocumentStateManager } from '@/utils/documentStateManager';
import { summaryCache } from '@/utils/githubData';

// Global state for summaries accessible by other components
const globalSummaryState = {
  summaries: {}
};

// Make it accessible on window for other components
if (typeof window !== 'undefined') {
  window.globalSummaryState = globalSummaryState;
}

// Single source of truth for file checks
const checkedFiles = {};

export default function SummarySection({ fileId, initialSummaries }) {
  const { fontFamily, lineSpacing } = useAccessibility();
  const [activeTab, setActiveTab] = useState('tldr');
  
  // All summary states
  const [summaries, setSummaries] = useState({
    tldr: null,
    standard: null,
    detailed: null
  });

  // Update global state when summaries change
  useEffect(() => {
    if (fileId && summaries) {
      globalSummaryState.summaries[fileId] = summaries;
      console.log('Updated global summary state for', fileId, summaries);
    }
  }, [summaries, fileId]);

  // Load from global state on mount
  useEffect(() => {
    if (fileId && globalSummaryState.summaries[fileId]) {
      const globalSummaries = globalSummaryState.summaries[fileId];
      console.log('Loading summaries from global state for', fileId);
      setSummaries(globalSummaries);
    }
  }, [fileId]);

  // Handle initial summaries (for demo documents)
  useEffect(() => {
    if (initialSummaries && Object.keys(initialSummaries).length > 0) {
      console.log('📋 DEMO: Loading initial summaries for', fileId);
      setSummaries(initialSummaries);
      setFileExists(true);
      setFileChecked(true);
      
      // Cache the demo summaries
      summaryCache.cacheSummaries(fileId, initialSummaries);
      
      // Calculate stats for each summary
      Object.entries(initialSummaries).forEach(([type, summary]) => {
        const wordCount = summary.split(' ').length;
        const readTime = calculateReadingTime(summary);
        const points = extractKeyPoints(summary);
        
        setSummaryStats(prev => ({...prev, [type]: { wordCount, sentences: summary.split(/[.!?]+/).length - 1 }}));
        setReadingTime(prev => ({...prev, [type]: readTime}));
        setKeyPoints(prev => ({...prev, [type]: points}));
      });
      
      return;
    }
  }, [initialSummaries, fileId]);
  
  // Track file status
  const [fileChecked, setFileChecked] = useState(false);
  const [fileExists, setFileExists] = useState(null);
  const [error, setError] = useState(null);

  // Track generation progress for each type
  const [generationStatus, setGenerationStatus] = useState({
    tldr: { loading: false, progress: 0, error: null, startTime: null },
    standard: { loading: false, progress: 0, error: null, startTime: null },
    detailed: { loading: false, progress: 0, error: null, startTime: null }
  });
  
  // Summary statistics and metadata
  const [summaryStats, setSummaryStats] = useState({});
  const [readingTime, setReadingTime] = useState({});
  const [keyPoints, setKeyPoints] = useState({});
  
  // Enhanced features matching TextPane
  const [textSize, setTextSize] = useState(100);
  const [lineSpacingCustom, setLineSpacingCustom] = useState(1.7);
  const [isSearchActive, setIsSearchActive] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [currentSearchIndex, setCurrentSearchIndex] = useState(0);
  const [useDyslexicFont, setUseDyslexicFont] = useState(true);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [speakingType, setSpeakingType] = useState(null);
  const [readingMode, setReadingMode] = useState('normal');
  const [currentParagraph, setCurrentParagraph] = useState(0);
  const [autoScrollEnabled, setAutoScrollEnabled] = useState(false);
  const [speakError, setSpeakError] = useState(null);
  
  const contentRef = useRef(null);

  // Search functionality
  const performSearch = useCallback((query, summaryText) => {
    if (!query.trim() || !summaryText) return [];
    
    const regex = new RegExp(query.trim(), 'gi');
    const matches = [];
    let match;
    
    while ((match = regex.exec(summaryText)) !== null) {
      matches.push({
        index: match.index,
        text: match[0],
        start: match.index,
        end: match.index + match[0].length
      });
    }
    
    return matches;
  }, []);

  const handleSearch = useCallback((query) => {
    setSearchQuery(query);
    const currentSummary = summaries[activeTab];
    if (query.trim() && currentSummary) {
      const results = performSearch(query, currentSummary);
      setSearchResults(results);
      setCurrentSearchIndex(0);
    } else {
      setSearchResults([]);
      setCurrentSearchIndex(0);
    }
  }, [summaries, activeTab, performSearch]);

  const navigateSearch = useCallback((direction) => {
    if (searchResults.length === 0) return;
    
    const newIndex = direction === 'next' 
      ? (currentSearchIndex + 1) % searchResults.length
      : currentSearchIndex === 0 ? searchResults.length - 1 : currentSearchIndex - 1;
    
    setCurrentSearchIndex(newIndex);
    
    // Auto-scroll to result
    if (contentRef.current) {
      const text = contentRef.current.textContent || '';
      const targetIndex = searchResults[newIndex].index;
      // Scroll to the search result (simplified approach)
      contentRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, [searchResults, currentSearchIndex]);

  // Enhanced text-to-speech functionality
  const speakSummary = useCallback(() => {
    const currentSummary = summaries[activeTab];
    if (!currentSummary) return;

    if (!window.speechSynthesis) {
      setSpeakError("Your browser doesn't support speech synthesis");
      setTimeout(() => setSpeakError(null), 3000);
      return;
    }

    try {
      if (speechSynthesis.speaking) {
        speechSynthesis.cancel();
        setIsSpeaking(false);
        setSpeakingType(null);
        return;
      }

      const utterance = new SpeechSynthesisUtterance(currentSummary);
      utterance.rate = 0.9;
      utterance.pitch = 1.0;
      utterance.volume = 1.0;

      const voices = speechSynthesis.getVoices();
      const englishVoices = voices.filter(voice => voice.lang.includes('en'));
      if (englishVoices.length > 0) {
        utterance.voice = englishVoices[0];
      }

      utterance.onstart = () => {
        setIsSpeaking(true);
        setSpeakingType(activeTab);
      };
      
      utterance.onend = () => {
        setIsSpeaking(false);
        setSpeakingType(null);
      };
      
      utterance.onerror = () => {
        setIsSpeaking(false);
        setSpeakingType(null);
        setSpeakError("Error while speaking text");
        setTimeout(() => setSpeakError(null), 3000);
      };

      speechSynthesis.speak(utterance);
    } catch (err) {
      console.error("Speech synthesis error:", err);
      setSpeakError("Failed to speak text. Please try again.");
      setTimeout(() => setSpeakError(null), 3000);
    }
  }, [summaries, activeTab]);

  // Auto-scroll functionality
  useEffect(() => {
    if (autoScrollEnabled && contentRef.current) {
      const scrollElement = contentRef.current;
      const scrollHeight = scrollElement.scrollHeight;
      const clientHeight = scrollElement.clientHeight;
      
      if (scrollHeight > clientHeight) {
        const scrollStep = 1;
        const scrollInterval = setInterval(() => {
          scrollElement.scrollTop += scrollStep;
          
          if (scrollElement.scrollTop >= scrollHeight - clientHeight) {
            clearInterval(scrollInterval);
            setAutoScrollEnabled(false);
          }
        }, 50);
        
        return () => clearInterval(scrollInterval);
      }
    }
  }, [autoScrollEnabled]);

  // Highlight search results in text
  const highlightSearchResults = useCallback((text) => {
    if (!searchQuery.trim() || !text) return text;
    
    const regex = new RegExp(`(${searchQuery.trim()})`, 'gi');
    return text.replace(regex, '<mark class="bg-yellow-200 px-1 rounded">$1</mark>');
  }, [searchQuery]);

  // For seeing if any summary type is loading
  const isAnySummaryLoading = 
    generationStatus.tldr.loading || 
    generationStatus.standard.loading || 
    generationStatus.detailed.loading;

  // Summary type configurations
  const summaryTypes = {
    tldr: {
      name: 'TL;DR',
      description: 'Quick overview in 2-3 sentences',
      icon: '⚡',
      color: 'from-yellow-400 to-orange-500',
      bgColor: 'bg-yellow-50',
      textColor: 'text-yellow-800',
      expectedLength: '50-100 words'
    },
    standard: {
      name: 'Standard',
      description: 'Balanced summary with key points',
      icon: '📋',
      color: 'from-blue-400 to-indigo-500',
      bgColor: 'bg-blue-50',
      textColor: 'text-blue-800',
      expectedLength: '150-300 words'
    },
    detailed: {
      name: 'Detailed',
      description: 'Comprehensive analysis with examples',
      icon: '📚',
      color: 'from-purple-400 to-pink-500',
      bgColor: 'bg-purple-50',
      textColor: 'text-purple-800',
      expectedLength: '400-600 words'
    }
  };

  // Check file existence and load cached summaries
  useEffect(() => {
    if (!fileId) {
      setFileExists(false);
      return;
    }
    
    // Try to load cached summaries first from new cache system
    const cachedSummaries = summaryCache.getCachedSummaries(fileId);
    if (cachedSummaries) {
      console.log(`📋 CACHE HIT: Loading summaries for ${fileId}`);
      setSummaries(cachedSummaries);
      setFileExists(true);
      setFileChecked(true);
      return;
    }

    // Fallback to old cache system
    const cachedDoc = DocumentStateManager.getDocument(fileId);
    if (cachedDoc && cachedDoc.summaries) {
      console.log(`📋 LEGACY CACHE: Loading summaries for ${fileId}`);
      setSummaries(cachedDoc.summaries);
      // Migrate to new cache system
      summaryCache.cacheSummaries(fileId, cachedDoc.summaries);
      setFileExists(true);
      setFileChecked(true);
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
        // Auto-generate TL;DR first, then others on demand
        generateSummary('tldr');
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

  // Calculate reading time (average 200 words per minute)
  const calculateReadingTime = (text) => {
    const words = text.split(' ').length;
    const minutes = Math.ceil(words / 200);
    return minutes === 1 ? '1 min read' : `${minutes} min read`;
  };

  // Extract key points from summary
  const extractKeyPoints = (text) => {
    const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 20);
    return sentences.slice(0, 3).map(s => s.trim());
  };

  // Generate single summary type with enhanced progress tracking
  const generateSummary = (type) => {
    const apiType = getApiType(type);

    // Set loading state and start at 0%
    setGenerationStatus(prev => ({
      ...prev,
      [type]: { 
        ...prev[type], 
        loading: true, 
        progress: 0, 
        error: null,
        startTime: Date.now()
      }
    }));

    // Progressive loading simulation with realistic timing
    const progressSteps = [
      { progress: 15, delay: 300, status: 'Analyzing document...' },
      { progress: 35, delay: 800, status: 'Extracting key concepts...' },
      { progress: 60, delay: 1200, status: 'Generating summary...' },
      { progress: 85, delay: 1800, status: 'Refining content...' }
    ];

    progressSteps.forEach(({ progress, delay }) => {
      setTimeout(() => {
        setGenerationStatus(prev => ({
          ...prev,
          [type]: { ...prev[type], progress }
        }));
      }, delay);
    });

    // Make API call
    fetch('http://127.0.0.1:5000/api/generate-summary', {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({
        fileId: fileId,
        summaryType: apiType
      })
    })
    .then(res => res.json())
    .then(data => {
      if (data.success) {
        const summary = data.summary;
        // Set summary and calculate stats
        setSummaries(prev => {
          const newSummaries = {...prev, [type]: summary};
          
          // Save to both cache systems for persistence
          DocumentStateManager.updateSummaries(fileId, newSummaries);
          summaryCache.cacheSummaries(fileId, newSummaries);
          
          return newSummaries;
        });
        
        // Calculate stats
        const wordCount = summary.split(' ').length;
        const readTime = calculateReadingTime(summary);
        const points = extractKeyPoints(summary);
        
        setSummaryStats(prev => ({...prev, [type]: { wordCount, sentences: summary.split(/[.!?]+/).length - 1 }}));
        setReadingTime(prev => ({...prev, [type]: readTime}));
        setKeyPoints(prev => ({...prev, [type]: points}));
        
        setGenerationStatus(prev => ({
          ...prev,
          [type]: { loading: false, progress: 100, error: null, startTime: null }
        }));
      } else {
        throw new Error(data.error || "Failed to generate summary");
      }
    })
    .catch(err => {
      setGenerationStatus(prev => ({
        ...prev,
        [type]: { loading: false, progress: 0, error: err.message, startTime: null }
      }));
    });
  };
  
  // Generate all summary types in parallel
  const generateAllSummaries = () => {
    ['tldr', 'standard', 'detailed'].forEach(type => {
      if (!summaries[type] && !generationStatus[type].loading) {
        setTimeout(() => generateSummary(type), Math.random() * 500);
      }
    });
  };

  // Download summary as text file
  const downloadSummary = (type) => {
    const summary = summaries[type];
    if (!summary) return;
    
    const blob = new Blob([summary], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${fileId}_${type}_summary.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Copy summary to clipboard
  const copySummary = async (type) => {
    const summary = summaries[type];
    if (!summary) return;
    
    try {
      await navigator.clipboard.writeText(summary);
      // Could add a toast notification here
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  return (
    <div className="flex flex-col h-full bg-white/95 backdrop-blur-sm rounded-xl shadow-xl overflow-hidden border border-indigo-100">
      {/* Enhanced Header */}
      <div className="bg-gradient-to-r from-indigo-50 via-purple-50 to-pink-50 p-6 border-b border-indigo-100">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <div>
              <h2 className="text-xl font-bold text-indigo-900">AI-Powered Summaries</h2>
              <p className="text-sm text-indigo-600">Choose your preferred summary style</p>
            </div>
          </div>
          
          {fileExists && (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={generateAllSummaries}
              className="px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg text-sm font-medium shadow-md hover:shadow-lg transition-all"
            >
              Generate All
            </motion.button>
          )}
        </div>

        {/* Enhanced Tabs */}
        <div className="flex space-x-1 bg-white/60 backdrop-blur-sm rounded-lg p-1">
          {Object.entries(summaryTypes).map(([key, config]) => (
            <motion.button
              key={key}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setActiveTab(key)}
              className={`flex-1 px-4 py-3 rounded-md text-sm font-medium transition-all relative ${
                activeTab === key 
                  ? 'bg-white shadow-md text-indigo-900' 
                  : 'text-indigo-600 hover:text-indigo-800 hover:bg-white/50'
              }`}
            >
              <div className="flex items-center justify-center space-x-2">
                <span className="text-lg">{config.icon}</span>
                <span>{config.name}</span>
              </div>
              
              {/* Status indicators */}
              {generationStatus[key].loading && (
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                  className="absolute -top-1 -right-1 w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center"
                >
                  <div className="w-2 h-2 bg-white rounded-full" />
                </motion.div>
              )}
              
              {!generationStatus[key].loading && summaries[key] && (
                <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full flex items-center justify-center">
                  <svg className="w-2.5 h-2.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
              )}
            </motion.button>
          ))}
        </div>

        {/* Enhanced Text Controls Toolbar */}
        {summaries[activeTab] && (
          <div className="mt-4 flex flex-wrap justify-between items-center gap-2 bg-white/70 backdrop-blur-sm rounded-lg p-3 border">
            {/* Search Controls */}
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setIsSearchActive(!isSearchActive)}
                className={`p-2 rounded-lg transition-all ${
                  isSearchActive ? 'bg-indigo-100 text-indigo-700' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
                title="Search in summary"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </button>
              
              {isSearchActive && (
                <div className="flex items-center space-x-1">
                  <input
                    type="text"
                    placeholder="Search..."
                    value={searchQuery}
                    onChange={(e) => handleSearch(e.target.value)}
                    className="px-2 py-1 text-xs border rounded w-24"
                  />
                  {searchResults.length > 0 && (
                    <div className="flex items-center space-x-1">
                      <span className="text-xs text-gray-500">
                        {currentSearchIndex + 1}/{searchResults.length}
                      </span>
                      <button
                        onClick={() => navigateSearch('prev')}
                        className="p-1 text-xs bg-gray-100 rounded"
                      >
                        ↑
                      </button>
                      <button
                        onClick={() => navigateSearch('next')}
                        className="p-1 text-xs bg-gray-100 rounded"
                      >
                        ↓
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Text Size Controls */}
            <div className="flex items-center space-x-1">
              <button 
                onClick={() => setTextSize(prev => Math.max(50, prev - 10))} 
                className="bg-indigo-100 hover:bg-indigo-200 text-indigo-800 px-2 py-1 rounded text-xs"
                title="Decrease text size"
              >
                A-
              </button>
              <span className="text-xs px-1">{textSize}%</span>
              <button 
                onClick={() => setTextSize(prev => Math.min(200, prev + 10))} 
                className="bg-indigo-100 hover:bg-indigo-200 text-indigo-800 px-2 py-1 rounded text-xs"
                title="Increase text size"
              >
                A+
              </button>
            </div>

            {/* Line Spacing Controls */}
            <div className="flex items-center space-x-1">
              <button 
                onClick={() => setLineSpacingCustom(prev => Math.max(1, prev - 0.1))} 
                className="bg-purple-100 hover:bg-purple-200 text-purple-800 px-2 py-1 rounded text-xs"
                title="Decrease line spacing"
              >
                ≡-
              </button>
              <span className="text-xs px-1">{lineSpacingCustom.toFixed(1)}</span>
              <button 
                onClick={() => setLineSpacingCustom(prev => Math.min(3, prev + 0.1))} 
                className="bg-purple-100 hover:bg-purple-200 text-purple-800 px-2 py-1 rounded text-xs"
                title="Increase line spacing"
              >
                ≡+
              </button>
            </div>

            {/* Font Toggle */}
            <button
              onClick={() => setUseDyslexicFont(!useDyslexicFont)}
              className={`px-3 py-1 rounded text-xs font-medium transition-all ${
                useDyslexicFont 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
              title="Toggle dyslexic-friendly font"
            >
              {useDyslexicFont ? 'Dyslexic Font' : 'Standard Font'}
            </button>

            {/* Auto-scroll Toggle */}
            <button
              onClick={() => setAutoScrollEnabled(!autoScrollEnabled)}
              className={`px-3 py-1 rounded text-xs font-medium transition-all ${
                autoScrollEnabled 
                  ? 'bg-orange-100 text-orange-800' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
              title="Toggle auto-scroll"
            >
              {autoScrollEnabled ? 'Auto-scroll On' : 'Auto-scroll Off'}
            </button>

            {/* Text-to-Speech */}
            <button
              onClick={speakSummary}
              className={`px-3 py-1 rounded text-xs font-medium transition-all ${
                isSpeaking && speakingType === activeTab
                  ? 'bg-red-100 text-red-800' 
                  : 'bg-blue-100 text-blue-800 hover:bg-blue-200'
              }`}
              title={isSpeaking && speakingType === activeTab ? 'Stop speaking' : 'Read summary aloud'}
            >
              {isSpeaking && speakingType === activeTab ? 'Stop' : 'Speak'}
              {isSpeaking && speakingType === activeTab && (
                <span className="ml-2 w-2 h-2 bg-red-500 rounded-full animate-pulse inline-block"></span>
              )}
            </button>
          </div>
        )}
      </div>
      
      {/* Error notification for speech synthesis */}
      <AnimatePresence>
        {speakError && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="m-3 p-2 bg-red-50 text-red-700 text-sm rounded-md border border-red-100 flex items-center"
          >
            <svg className="w-4 h-4 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {speakError}
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Content Area */}
      <div className="flex-1 overflow-hidden">
        <AnimatePresence mode="wait">
          {fileExists === false ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex flex-col items-center justify-center h-full p-8 text-center"
            >
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Document Found</h3>
              <p className="text-gray-500">Please upload a document to generate AI-powered summaries</p>
            </motion.div>
          ) : !fileChecked || fileExists === null ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex items-center justify-center h-full"
            >
              <div className="text-center">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                  className="w-8 h-8 border-2 border-indigo-600 border-t-transparent rounded-full mx-auto mb-4"
                />
                <p className="text-indigo-600">Verifying document...</p>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="h-full overflow-y-auto"
            >
              {generationStatus[activeTab].loading ? (
                <div className="p-6">
                  {/* Enhanced loading state with time estimation */}
                  <div className="mb-6">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-2">
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                          className="w-5 h-5 border-2 border-indigo-600 border-t-transparent rounded-full"
                        />
                        <span className="text-sm font-medium text-indigo-900">
                          Generating {summaryTypes[activeTab].name} summary...
                        </span>
                      </div>
                      <div className="text-right">
                        <span className="text-sm font-bold text-indigo-900">
                          {Math.round(generationStatus[activeTab].progress)}%
                        </span>
                        {generationStatus[activeTab].startTime && (
                          <div className="text-xs text-indigo-600">
                            {Math.round((Date.now() - generationStatus[activeTab].startTime) / 1000)}s elapsed
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden">
                      <motion.div 
                        className={`h-full bg-gradient-to-r ${summaryTypes[activeTab].color} rounded-full`}
                        initial={{ width: 0 }}
                        animate={{ width: `${generationStatus[activeTab].progress}%` }}
                        transition={{ duration: 0.5, ease: "easeOut" }}
                      />
                    </div>
                    
                    <div className="mt-2 text-xs text-indigo-600">
                      Expected length: {summaryTypes[activeTab].expectedLength} • 
                      Estimated time: {activeTab === 'tldr' ? '10-15s' : activeTab === 'standard' ? '15-25s' : '25-40s'}
                    </div>
                  </div>
                  
                  {/* Animated skeleton with realistic content preview */}
                  <div className="space-y-4">
                    {[...Array(activeTab === 'tldr' ? 3 : activeTab === 'standard' ? 5 : 8)].map((_, i) => (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0.3 }}
                        animate={{ opacity: [0.3, 0.7, 0.3] }}
                        transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.1 }}
                        className={`h-4 bg-gradient-to-r ${summaryTypes[activeTab].color} opacity-20 rounded`}
                        style={{ width: `${Math.random() * 40 + 60}%` }}
                      />
                    ))}
                  </div>
                </div>
              ) : summaries[activeTab] ? (
                <div className="p-6">
                  {/* Enhanced summary stats with visual improvements */}
                  <div className="flex items-center space-x-4 mb-6 p-4 bg-gradient-to-r from-gray-50 to-indigo-50 rounded-lg border">
                    <div className="text-center">
                      <div className="text-lg font-bold text-indigo-900">
                        {summaryStats[activeTab]?.wordCount || 0}
                      </div>
                      <div className="text-xs text-indigo-600">Words</div>
                    </div>
                    <div className="text-center">
                      <div className="text-lg font-bold text-indigo-900">
                        {summaryStats[activeTab]?.sentences || 0}
                      </div>
                      <div className="text-xs text-indigo-600">Sentences</div>
                    </div>
                    <div className="text-center">
                      <div className="text-lg font-bold text-indigo-900">
                        {readingTime[activeTab] || '0 min'}
                      </div>
                      <div className="text-xs text-indigo-600">Read Time</div>
                    </div>
                    <div className="text-center">
                      <div className="text-lg font-bold text-green-600">
                        ✓
                      </div>
                      <div className="text-xs text-green-600">Generated</div>
                    </div>
                  </div>

                  {/* Enhanced summary content with all TextPane features */}
                  <div 
                    ref={contentRef}
                    className="prose prose-indigo max-w-none mb-6 relative overflow-auto select-text"
                    style={{ 
                      fontFamily: useDyslexicFont ? 'OpenDyslexic, sans-serif' : fontFamily || 'Inter, sans-serif',
                      lineHeight: lineSpacingCustom,
                      fontSize: `${textSize}%`,
                      letterSpacing: useDyslexicFont ? '0.5px' : 'normal',
                      wordSpacing: useDyslexicFont ? '0.25em' : 'normal',
                      background: 'linear-gradient(to right, rgba(255, 250, 240, 0.9), rgba(255, 247, 237, 0.9))',
                      borderRadius: '8px',
                      padding: '1.5rem',
                      maxHeight: '400px',
                      color: 'rgba(30, 41, 59, 0.95)',
                      textShadow: '0 1px 0 rgba(255, 255, 255, 0.5)'
                    }}
                  >
                    <div 
                      className="text-gray-800 leading-relaxed whitespace-pre-line"
                      dangerouslySetInnerHTML={{ 
                        __html: highlightSearchResults(summaries[activeTab]) 
                      }}
                    />
                  </div>

                  {/* Key points with enhanced styling */}
                  {keyPoints[activeTab] && keyPoints[activeTab].length > 0 && (
                    <div className="mb-6 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border">
                      <h4 className="text-sm font-semibold text-indigo-900 mb-3 flex items-center">
                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        Key Points:
                      </h4>
                      <ul className="space-y-2">
                        {keyPoints[activeTab].map((point, index) => (
                          <motion.li
                            key={index}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.1 }}
                            className="flex items-start space-x-2 text-sm text-indigo-800"
                          >
                            <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full mt-2 flex-shrink-0" />
                            <span>{point}</span>
                          </motion.li>
                        ))}
                      </ul>
                    </div>
                  )}
                  
                  {/* Enhanced action buttons */}
                  <div className="flex flex-wrap gap-3">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => copySummary(activeTab)}
                      className="flex items-center space-x-2 px-4 py-2 bg-indigo-100 text-indigo-700 rounded-lg hover:bg-indigo-200 text-sm font-medium transition-colors"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                      </svg>
                      <span>Copy</span>
                    </motion.button>
                    
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => downloadSummary(activeTab)}
                      className="flex items-center space-x-2 px-4 py-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 text-sm font-medium transition-colors"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      <span>Download</span>
                    </motion.button>

                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => {
                        const selection = window.getSelection();
                        const text = selection.toString() || summaries[activeTab];
                        navigator.clipboard.writeText(text);
                      }}
                      className="flex items-center space-x-2 px-4 py-2 bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 text-sm font-medium transition-colors"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                      </svg>
                      <span>Copy Selected</span>
                    </motion.button>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-full p-8 text-center">
                  <div className={`w-16 h-16 bg-gradient-to-r ${summaryTypes[activeTab].color} rounded-full flex items-center justify-center mb-4 text-white text-2xl`}>
                    {summaryTypes[activeTab].icon}
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    {summaryTypes[activeTab].name} Summary
                  </h3>
                  <p className="text-gray-500 mb-6 max-w-sm">
                    {summaryTypes[activeTab].description}
                  </p>
                  
                  {fileId && (
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => generateSummary(activeTab)}
                      className={`px-6 py-3 bg-gradient-to-r ${summaryTypes[activeTab].color} text-white rounded-lg font-medium shadow-md hover:shadow-lg transition-all`}
                    >
                      Generate {summaryTypes[activeTab].name} Summary
                    </motion.button>
                  )}
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      
      {/* Overall Progress Dashboard */}
      <AnimatePresence>
        {isAnySummaryLoading && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="p-4 bg-gradient-to-r from-indigo-50 to-purple-50 border-t border-indigo-100"
          >
            <h3 className="text-sm font-semibold text-indigo-900 mb-3 flex items-center">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                className="w-4 h-4 border-2 border-indigo-600 border-t-transparent rounded-full mr-2"
              />
              AI Processing Status
            </h3>
            
            <div className="grid gap-3">
              {Object.entries(summaryTypes).map(([type, config]) => (
                <div key={type} className={`transition-opacity ${generationStatus[type].loading ? 'opacity-100' : 'opacity-60'}`}>
                  <div className="flex justify-between items-center mb-1 text-xs">
                    <div className="flex items-center space-x-2">
                      <span>{config.icon}</span>
                      <span className="font-medium text-gray-700">{config.name}</span>
                      {generationStatus[type].startTime && (
                        <span className="text-gray-500">
                          ({Math.round((Date.now() - generationStatus[type].startTime) / 1000)}s)
                        </span>
                      )}
                    </div>
                    <span className="font-bold">{Math.round(generationStatus[type].progress)}%</span>
                  </div>
                  <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                    <motion.div 
                      className={`h-full bg-gradient-to-r ${config.color} rounded-full`}
                      initial={{ width: 0 }}
                      animate={{ width: `${generationStatus[type].progress}%` }}
                      transition={{ duration: 0.3 }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Error message */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="p-4 bg-red-50 border-t border-red-200 text-red-700 flex justify-between items-center"
          >
            <div className="flex items-center space-x-2">
              <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="text-sm">{error}</span>
            </div>
            <button 
              onClick={() => setError(null)} 
              className="text-sm font-medium hover:text-red-800 transition-colors"
            >
              Dismiss
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Global styles for enhanced features */}
      <style jsx global>{`
        @font-face {
          font-family: 'OpenDyslexic';
          src: url('/fonts/OpenDyslexic-Regular.otf') format('opentype');
          font-weight: normal;
          font-style: normal;
          font-display: swap;
        }
        
        @font-face {
          font-family: 'OpenDyslexic';
          src: url('/fonts/OpenDyslexic-Bold.otf') format('opentype');
          font-weight: bold;
          font-style: normal;
          font-display: swap;
        }

        /* Custom scrollbar for content */
        .prose::-webkit-scrollbar {
          width: 6px;
        }
        
        .prose::-webkit-scrollbar-track {
          background: transparent;
        }
        
        .prose::-webkit-scrollbar-thumb {
          background-color: rgba(99, 102, 241, 0.3);
          border-radius: 20px;
        }

        /* Enhanced selection styling */
        .prose ::selection {
          background: rgba(79, 70, 229, 0.2);
          color: #1e293b;
          text-shadow: none;
        }

        /* Search highlight styling */
        .prose mark {
          background-color: rgba(250, 204, 21, 0.4);
          padding: 2px 4px;
          border-radius: 4px;
          box-shadow: 0 1px 2px rgba(0,0,0,0.1);
        }

        /* Accessibility improvements */
        .prose:focus-within {
          outline: 2px solid rgba(99, 102, 241, 0.5);
          outline-offset: 2px;
        }

        /* Smooth animations for better UX */
        .prose * {
          transition: all 0.2s ease;
        }
      `}</style>
    </div>
  );
}
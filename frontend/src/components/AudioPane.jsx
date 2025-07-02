'use client'

import { useState, useRef, useEffect, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'

// Global state for audio persistence across file changes
const globalAudioState = {
  audioUrls: {},
  selectedVoices: {},
  hasSelectedLanguage: false,
  userPreferredLanguage: null
};

// Top 7 languages for selection
const topLanguages = [
  { code: 'en-us', name: 'English (US)', flag: '🇺🇸' },
  { code: 'en-gb', name: 'English (UK)', flag: '🇬🇧' },
  { code: 'hi-in', name: 'Hindi', flag: '🇮🇳' },
  { code: 'es-es', name: 'Spanish', flag: '🇪🇸' },
  { code: 'fr-fr', name: 'French', flag: '🇫🇷' },
  { code: 'de-de', name: 'German', flag: '🇩🇪' },
  { code: 'ja-jp', name: 'Japanese', flag: '🇯🇵' }
];

// Language translations for UI elements
const translations = {
  en: {
    selectVoice: "Select Voice",
    format: "Format",
    size: "Size",
    duration: "Duration",
    downloadAudio: "Download Audio",
    audioError: "Audio could not be loaded. Try selecting a different voice option.",
    processing: "Processing voice change...",
    interfaceLanguage: "भाषा बदलें", // "Change Language" in Hindi
    autoDetectedMsg: "Auto-detected language:",
    english: "English",
    hindi: "Hindi",
    mixed: "Mixed Content",
    speedLabel: "Speed",
    dyslexicFont: "Dyslexic Font",
    standardFont: "Standard Font"
  },
  hi: {
    selectVoice: "आवाज़ चुनें",
    format: "प्रारूप",
    size: "आकार",
    duration: "अवधि",
    downloadAudio: "ऑडियो डाउनलोड करें",
    audioError: "ऑडियो लोड नहीं हो सका। कृपया दूसरा विकल्प चुनें।",
    processing: "आवाज़ परिवर्तन प्रगति में...",
    interfaceLanguage: "Switch to English", // English option when in Hindi
    autoDetectedMsg: "स्वतः पहचानी गई भाषा:",
    english: "अंग्रेज़ी",
    hindi: "हिंदी",
    mixed: "मिश्रित सामग्री",
    speedLabel: "गति",
    dyslexicFont: "डिस्लेक्सिक फ़ॉन्ट",
    standardFont: "मानक फ़ॉन्ट"
  }
};

export default function AudioPane({ audioUrl, onPlayingIndexChange, textContent, onVoiceChange, fileId }) {
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [playbackRate, setPlaybackRate] = useState(1)
  const [selectedVoice, setSelectedVoice] = useState(globalAudioState.selectedVoices[fileId] || null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [processingProgress, setProcessingProgress] = useState(0)
  const [currentWordIndex, setCurrentWordIndex] = useState(0)
  const [audioInfo, setAudioInfo] = useState({ format: '—', size: '—', duration: '—' })
  const [matrixChars, setMatrixChars] = useState([])
  const [audioError, setAudioError] = useState(false)
  const [showWaveform, setShowWaveform] = useState(true)
  const [uiLanguage, setUiLanguage] = useState('en') // Default UI language is English
  const [detectedContentLanguage, setDetectedContentLanguage] = useState(null)
  const [showLanguageSelector, setShowLanguageSelector] = useState(!globalAudioState.hasSelectedLanguage)
  const [hasSelectedLanguage, setHasSelectedLanguage] = useState(globalAudioState.hasSelectedLanguage)
  
  // Set standard font as default for audio pane initially
  const [useDyslexicFont, setUseDyslexicFont] = useState(false)
  
  const textScrollRef = useRef(null);
  const audioRef = useRef(null)
  const progressInterval = useRef(null)
  const matrixInterval = useRef(null)
  const lastUpdateRef = useRef(Date.now());
  const wavesRef = useRef([]);
  
  // Get translated text based on current UI language
  const t = translations[uiLanguage];
  
  // Determine font class for better dyslexic support
  const fontClass = useDyslexicFont ? 'font-opendyslexic' : 'font-normal';
  
  const words = textContent 
    ? textContent
        .trim()
        .split(/\s+/)
        .filter(Boolean)
    : []

  // Calculate lines of text (for auto-scrolling purposes)
  const lines = useMemo(() => {
    if (!textContent) return [];
    return textContent.split('\n').filter(Boolean);
  }, [textContent]);
  
  // Auto-detect text content language
  useEffect(() => {
    if (!textContent) return;
    
    // Simple language detection function
    const detectLanguage = (text) => {
      // Hindi Unicode range (Devanagari): \u0900-\u097F
      const hindiPattern = /[\u0900-\u097F]/;
      const englishPattern = /[A-Za-z]/;
      
      const hindiCharCount = (text.match(new RegExp(hindiPattern, 'g')) || []).length;
      const englishCharCount = (text.match(new RegExp(englishPattern, 'g')) || []).length;
      
      const totalChars = hindiCharCount + englishCharCount;
      
      if (totalChars === 0) return 'unknown';
      
      const hindiPercent = (hindiCharCount / totalChars) * 100;
      
      if (hindiPercent > 60) return 'hi';
      if (hindiPercent < 20) return 'en';
      return 'mixed'; // 20-60% Hindi characters indicates mixed content
    };
    
    const detectedLang = detectLanguage(textContent);
    setDetectedContentLanguage(detectedLang);
    
    // Auto-select English (US) Female instead of showing popup
    if (!hasSelectedLanguage) {
      setHasSelectedLanguage(true);
      setSelectedVoice({ language: 'en-us', gender: 'female' });
      globalAudioState.hasSelectedLanguage = true;
      globalAudioState.userPreferredLanguage = 'en-us';
    }
  }, [textContent, selectedVoice]);
  
  // Update the voiceOptions array to include the child voice
  const voiceOptions = [
    { label: uiLanguage === 'en' ? 'English (US) - Female' : 'अंग्रेज़ी (US) - स्त्री', language: 'en-us', gender: 'female', icon: '🇺🇸', color: 'from-blue-500 to-indigo-600' },
    { label: uiLanguage === 'en' ? 'English (US) - Male' : 'अंग्रेज़ी (US) - पुरुष', language: 'en-us', gender: 'male', icon: '🇺🇸', color: 'from-blue-600 to-indigo-700' },
    { label: uiLanguage === 'en' ? 'English (US) - Child' : 'अंग्रेज़ी (US) - बच्चा', language: 'en-us', gender: 'child', icon: '🇺🇸', color: 'from-blue-400 to-cyan-500' }, // New child voice option
    { label: uiLanguage === 'en' ? 'Hindi - Female' : 'हिंदी - स्त्री', language: 'hi-in', gender: 'female', icon: '🇮🇳', color: 'from-orange-500 to-red-600' },
    { label: uiLanguage === 'en' ? 'Hindi - Male' : 'हिंदी - पुरुष', language: 'hi-in', gender: 'male', icon: '🇮🇳', color: 'from-orange-600 to-red-700' },
    { label: uiLanguage === 'en' ? 'English (UK) - Female' : 'अंग्रेज़ी (UK) - स्त्री', language: 'en-gb', gender: 'female', icon: '🇬🇧', color: 'from-red-500 to-purple-600' },
    { label: uiLanguage === 'en' ? 'English (UK) - Male' : 'अंग्रेज़ी (UK) - पुरुष', language: 'en-gb', gender: 'male', icon: '🇬🇧', color: 'from-red-600 to-purple-700' },
  ]
  
  // Processed audio URL for handling different environments
  const processedAudioUrl = useMemo(() => {
    if (!audioUrl) return null;
    
    // For demo content with absolute URLs, use directly
    if (audioUrl.startsWith('http')) {
      return audioUrl;
    }
    
    // For relative URLs from backend, add proper base URL
    if (audioUrl.startsWith('/api/')) {
      return `http://127.0.0.1:5000${audioUrl}`;
    }
    
    // Handle paths that don't have /api/ prefix but should
    if (!audioUrl.includes('://') && !audioUrl.startsWith('/api/')) {
      return `http://127.0.0.1:5000/api/audio/${audioUrl.split('/').pop()}`;
    }
    
    return audioUrl;
  }, [audioUrl]);
  
  // Detect voice from audioUrl - Enhanced version with better logging
  useEffect(() => {
    if (processedAudioUrl) {
      console.log("Audio URL received:", processedAudioUrl);

      // Only check absolute URLs
      if (/^https?:\/\//.test(processedAudioUrl)) {
        try {
          new URL(processedAudioUrl);
          console.log("✅ Valid audio URL format");
        } catch {
          console.error("❌ Invalid audio URL format:", processedAudioUrl);
        }
      }

      // Check if URL is accessible
      fetch(processedAudioUrl, { method: 'HEAD' })
        .then(response => {
          if (response.ok) {
            console.log("✅ Audio URL is accessible");
          } else {
            console.error("❌ Audio URL returned error:", response.status);
          }
        })
        .catch(error => {
          console.error("❌ Failed to check audio URL:", error);
        });
      
      let detectedLanguage = 'en-us';
      let detectedGender = 'female';
      
      if (processedAudioUrl.includes('_hi-in_')) detectedLanguage = 'hi-in';
      else if (processedAudioUrl.includes('_en-gb_')) detectedLanguage = 'en-gb';
      else if (processedAudioUrl.includes('_en-us_')) detectedLanguage = 'en-us';
      
      // Make this check more explicit and prioritize it
      if (processedAudioUrl.includes('_child_')) {
        detectedGender = 'child';
        console.log("📢 Child voice detected in URL");
      } else if (processedAudioUrl.includes('_male_')) {
        detectedGender = 'male';
      } else {
        detectedGender = 'female';
      }
      
      // Set the voice with a small delay to ensure React has processed previous state updates
      // Only auto-select if user hasn't manually selected a voice for this file
      setTimeout(() => {
        if (!globalAudioState.selectedVoices[fileId]) {
          setSelectedVoice({ language: detectedLanguage, gender: detectedGender });
          console.log(`Auto-detected voice set to: ${detectedLanguage}-${detectedGender}`);
        } else {
          console.log(`Using user-selected voice for ${fileId}`);
        }
      }, 50);
    }
  }, [processedAudioUrl]);
  
  // Generate matrix animation characters
  useEffect(() => {
    if (isProcessing) {
      const chars = Array(180).fill().map(() => ({
        char: String.fromCharCode(33 + Math.floor(Math.random() * 94)),
        x: Math.floor(Math.random() * 100),
        y: Math.floor(Math.random() * 100),
        opacity: Math.random() * 0.7 + 0.3,
        size: Math.floor(Math.random() * 16) + 10,
      }));
      setMatrixChars(chars);
      
      matrixInterval.current = setInterval(() => {
        setMatrixChars(prev => prev.map(c => ({
          ...c,
          char: Math.random() > 0.7 ? String.fromCharCode(33 + Math.floor(Math.random() * 94)) : c.char,
          opacity: Math.random() * 0.7 + 0.3,
          y: (c.y + 1) % 110
        })));
      }, 120);
      
      return () => {
        if (matrixInterval.current) {
          clearInterval(matrixInterval.current);
        }
      };
    }
  }, [isProcessing]);
  
  // Updated animation effect for randomly positioned waves
  useEffect(() => {
    let animationFrameId = null;
    
    if (isPlaying) {
      // Generate initial wave data with better amplitude range
      if (wavesRef.current.length === 0) {
        wavesRef.current = Array(24).fill().map(() => ({
          baseAmplitude: Math.random() * 0.5 + 0.5,
          speedMultiplier: Math.random() * 0.5 + 0.5,
          phase: Math.random() * Math.PI * 2
        }));
      }

      const animateWaves = () => {
        const waves = document.querySelectorAll('.audio-wave');
        
        if (waves.length > 0) {
          const now = Date.now() / 1000;
          
          waves.forEach((wave, i) => {
            if (wavesRef.current[i]) {
              const { baseAmplitude, speedMultiplier, phase } = wavesRef.current[i];
              
              // Multiple sine waves for more organic movement
              const primaryWave = Math.sin(now * speedMultiplier * 2 + phase);
              const secondaryWave = Math.sin(now * speedMultiplier * 0.7 + phase * 1.3);
              const combinedValue = primaryWave * 0.7 + secondaryWave * 0.3;
              
              // Dynamic height for the wave
              const height = 5 + baseAmplitude * 35 * Math.abs(combinedValue);
              
              // Get the wave's custom length
              const length = wave.style.getPropertyValue('--wave-length') || '30px';
              const lengthValue = parseFloat(length);
              
              // Apply height and transform to create extension effect
              wave.style.height = `${height}px`;
              wave.style.transformOrigin = 'center left';
              
              // Vary the width slightly based on the amplitude
              wave.style.width = `${1.5 + baseAmplitude * 0.5}px`;
              
              // Add slight opacity variation
              wave.style.opacity = 0.5 + baseAmplitude * 0.3 * Math.abs(combinedValue);
            }
          });
        }
        
        if (isPlaying) {
          animationFrameId = requestAnimationFrame(animateWaves);
        }
      };
      
      animateWaves();
      
      // Proper cleanup of animation frame
      return () => {
        if (animationFrameId) {
          cancelAnimationFrame(animationFrameId);
        }
      };
    }
  }, [isPlaying]);
  
  // Extract audio file info when URL changes
  useEffect(() => {
    if (processedAudioUrl) {
      const format = processedAudioUrl.split('.').pop().toUpperCase();
      
      const fetchAudioInfo = async () => {
        try {
          const response = await fetch(processedAudioUrl, { method: 'HEAD' });
          const size = response.headers.get('Content-Length');
          const sizeInMB = size ? (size / (1024 * 1024)).toFixed(2) + ' MB' : '—';
          setAudioInfo(prev => ({ ...prev, format, size: sizeInMB }));
        } catch (error) {
          console.log('Could not fetch audio file info');
          setAudioInfo(prev => ({ ...prev, format: format || 'MP3' }));
        }
      };
      
      fetchAudioInfo();
    }
  }, [processedAudioUrl]);
  
  // Persist state globally
  useEffect(() => {
    if (fileId && selectedVoice) {
      globalAudioState.selectedVoices[fileId] = selectedVoice;
    }
  }, [selectedVoice, fileId]);

  useEffect(() => {
    if (fileId && processedAudioUrl) {
      globalAudioState.audioUrls[fileId] = processedAudioUrl;
    }
  }, [processedAudioUrl, fileId]);

  // Language selection functions
  const selectPreferredLanguage = (languageCode) => {
    globalAudioState.userPreferredLanguage = languageCode;
    globalAudioState.hasSelectedLanguage = true;
    setHasSelectedLanguage(true);
    setShowLanguageSelector(false);
    
    // Auto-select appropriate voice based on language preference
    const femaleVoice = { language: languageCode, gender: 'female' };
    handleVoiceChange(femaleVoice);
  };

  // Download all audio types for current file
  const downloadAllAudio = () => {
    const allAudioTypes = ['text', 'tldr', 'standard', 'detailed'];
    allAudioTypes.forEach(type => {
      const audioKey = `${fileId}_${type}`;
      if (globalAudioState.audioUrls[audioKey]) {
        const link = document.createElement('a');
        link.href = globalAudioState.audioUrls[audioKey];
        link.download = `${fileId}_${type}_audio.mp3`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }
    });
  };
  
  // Handle voice change with processing animation
  const handleVoiceChange = (voice) => {
    const newVoice = { 
      language: voice.language, 
      gender: voice.gender 
    };
    setSelectedVoice(newVoice);
    
    setIsProcessing(true);
    setProcessingProgress(0);
    
    // Calculate estimated time based on text length
    const estimatedTime = Math.max(5, Math.min(30, words.length * 0.1)); // 5-30 seconds
    const startTime = Date.now();
    
    progressInterval.current = setInterval(() => {
      setProcessingProgress(prev => {
        const elapsed = (Date.now() - startTime) / 1000;
        const timeBasedProgress = (elapsed / estimatedTime) * 100;
        
        if (timeBasedProgress >= 100) {
          clearInterval(progressInterval.current);
          setIsProcessing(false);
          setProcessingProgress(100);
        }
        
        return Math.min(100, timeBasedProgress);
      });
    }, 100);
    
    onVoiceChange(newVoice);
  };
  
  // Play or pause audio
  const togglePlay = () => {
    setIsPlaying(prev => !prev);
  }
  
  // Update current time based on audio playback with proper text scrolling synced to audio duration
  useEffect(() => {
    if (!audioRef.current) return;

    const handleTimeUpdate = () => {
      setCurrentTime(audioRef.current.currentTime);
      
      // Auto-scroll text with an improved distribution to match full audio duration
      if (textScrollRef.current && duration > 0) {
        // Simple linear distribution - directly maps audio position to scroll position
        const rawProgress = audioRef.current.currentTime / duration;
        
        // Calculate scroll position - directly proportional to audio position
        const scrollMax = textScrollRef.current.scrollHeight - textScrollRef.current.clientHeight;
        textScrollRef.current.scrollTop = scrollMax * rawProgress;
      }

      const currentIndex = Math.floor(audioRef.current.currentTime / (duration / words.length));
      setCurrentWordIndex(currentIndex);

      if (onPlayingIndexChange) {
        onPlayingIndexChange(currentIndex);
      }
    };

    audioRef.current.addEventListener('timeupdate', handleTimeUpdate);

    return () => {
      if (audioRef.current) {
        audioRef.current.removeEventListener('timeupdate', handleTimeUpdate);
      }
    };
  }, [audioRef, duration, words.length, onPlayingIndexChange]);
  
  // Toggle UI language
  const toggleUiLanguage = () => {
    setUiLanguage(prev => prev === 'en' ? 'hi' : 'en');
  };
  
  // Toggle dyslexic font
  const toggleFont = () => {
    setUseDyslexicFont(prev => !prev);
  };
  
  // Seek audio to new time
  const seekAudio = (newTime) => {
    if (audioRef.current) {
      audioRef.current.currentTime = newTime;
      setCurrentTime(newTime);
      
      // Update current word index
      const currentIndex = Math.floor(newTime / (duration / words.length));
      setCurrentWordIndex(currentIndex);
      
      if (onPlayingIndexChange) {
        onPlayingIndexChange(currentIndex);
      }
    }
  };
  
  // Adjust playback rate
  const handlePlaybackRateChange = (rate) => {
    setPlaybackRate(rate);
    
    if (audioRef.current) {
      audioRef.current.playbackRate = rate;
    }
  };
  
  // Play or pause audio based on isPlaying state
  useEffect(() => {
    if (!audioRef.current) return;
    
    if (isPlaying) {
      console.log("▶️ Playing audio:", processedAudioUrl);
      audioRef.current.play().catch(err => {
        console.error("Failed to play:", err);
        setIsPlaying(false);
      });
    } else {
      console.log("⏸️ Pausing audio");
      audioRef.current.pause();
    }
  }, [isPlaying, processedAudioUrl]);

  // Add to your AudioPane.jsx file
  const [audioFinishedPlaying, setAudioFinishedPlaying] = useState(false);

  // Add this event handler for the audio element
  const handleAudioEnded = () => {
    console.log("Audio playback complete");
    setAudioFinishedPlaying(true);
    
    // Now safe to clean up - but add a small delay to ensure file isn't deleted while still in use
    if (processedAudioUrl) {
      setTimeout(() => {
        fetch('http://127.0.0.1:5000/api/audio/cleanup', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ 
            audioPath: processedAudioUrl,
            playbackCompleted: true 
          }),
        })
        .then(response => response.json())
        .then(data => {
          console.log('Cleanup after playback response:', data);
        })
        .catch(error => {
          console.error('Error cleaning up audio after playback:', error);
        });
      }, 1000); // Add 1 second delay before cleanup
    }
  };

  useEffect(() => {
    // Function to handle tab visibility change
    const handleVisibilityChange = () => {
      if (document.hidden && processedAudioUrl) {
        // Tab is inactive, but don't delete if still playing
        // Only mark for cleanup
        fetch('http://127.0.0.1:5000/api/audio/cleanup', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ 
            audioPath: processedAudioUrl,
            playbackCompleted: audioFinishedPlaying 
          }),
        })
        .catch(error => {
          console.error('Error marking audio for cleanup:', error);
        });
      }
    };

    // Add event listener for visibility change
    document.addEventListener('visibilitychange', handleVisibilityChange);

    // Cleanup on component unmount
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      
      // Clean up audio when component unmounts, but only if playback is done
      if (processedAudioUrl) {
        fetch('http://127.0.0.1:5000/api/audio/cleanup', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ 
            audioPath: processedAudioUrl,
            playbackCompleted: audioFinishedPlaying || true  // Force cleanup on unmount
          }),
        }).catch(err => console.error('Error cleaning up audio on unmount:', err));
      }
    };
  }, [processedAudioUrl, audioFinishedPlaying]);

  // Top 7 languages for selection
  const topLanguages = [
    { code: 'en-us', name: 'English (US)', flag: '🇺🇸' },
    { code: 'en-gb', name: 'English (UK)', flag: '🇬🇧' },
    { code: 'hi-in', name: 'Hindi', flag: '🇮🇳' },
    { code: 'es-es', name: 'Spanish', flag: '🇪🇸' },
    { code: 'fr-fr', name: 'French', flag: '🇫🇷' },
    { code: 'de-de', name: 'German', flag: '🇩🇪' },
    { code: 'ja-jp', name: 'Japanese', flag: '🇯🇵' }
  ];

  const handleLanguageSelection = (languageCode) => {
    setSelectedVoice({
      language: languageCode,
      gender: 'female'
    });
    setHasSelectedLanguage(true);
    setShowLanguageSelector(false);
    
    // Auto-switch UI language for Hindi content with better detection
    if (languageCode === 'hi-in') {
      setUiLanguage('hi');
    } else {
      setUiLanguage('en');
    }
    
    // Store global preference
    globalAudioState.userPreferredLanguage = languageCode;
  };

  return (
    <>
      <div className="audio-pane relative overflow-hidden rounded-[24px] border border-indigo-200/50 shadow-2xl backdrop-blur-sm p-6 md:p-10 max-w-4xl mx-auto my-8">
      {/* Enhanced animated background with floating particles */}
      <div className="absolute inset-0 bg-gradient-to-br from-indigo-100 via-purple-50 to-blue-100 z-0 overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full bg-grid-pattern opacity-10"></div>
        <div className="absolute top-0 right-0 w-64 h-64 rounded-full bg-gradient-to-r from-pink-200 to-purple-300 blur-3xl opacity-20 animate-pulse"></div>
        <div className="absolute bottom-0 left-0 w-80 h-80 rounded-full bg-gradient-to-r from-blue-200 to-cyan-300 blur-3xl opacity-20 animate-pulse" style={{animationDelay: '1s'}}></div>
        
        {/* Floating particles */}
        <div className="particles-container absolute inset-0 overflow-hidden">
          {[...Array(8)].map((_, i) => (
            <div 
              key={i}
              className="absolute rounded-full bg-white/30 blur-sm"
              style={{
                width: `${Math.random() * 30 + 10}px`,
                height: `${Math.random() * 30 + 10}px`,
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                opacity: Math.random() * 0.4 + 0.1,
                animation: `float ${Math.random() * 15 + 10}s linear infinite`,
                animationDelay: `${Math.random() * 10}s`,
              }}
            ></div>
          ))}
        </div>
      </div>

      {/* Top Navigation Controls */}
      <div className="relative z-20 flex justify-end mb-6">
        {/* Language Switch Button */}
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={toggleUiLanguage}
          className="px-3 py-1.5 rounded-full text-xs bg-white/80 text-indigo-800 font-medium shadow-md border border-indigo-200 flex items-center gap-1 hover:bg-white hover:shadow-lg transition-all"
        >
          {uiLanguage === 'en' ? '🇮🇳' : '🇬🇧'} {t.interfaceLanguage}
        </motion.button>
      </div>

      {/* Content container */}
      <div className="relative z-10">
        {/* Auto-detected language notification */}
        {detectedContentLanguage && (
          <div className="mb-4 text-center text-sm text-indigo-800/70 bg-white/50 py-1 px-3 rounded-full inline-block mx-auto">
            {t.autoDetectedMsg} {' '}
            <span className="font-semibold">
              {detectedContentLanguage === 'en' ? t.english : 
               detectedContentLanguage === 'hi' ? t.hindi : t.mixed}
            </span>
          </div>
        )}
        
        {/* 1. LANGUAGE OPTIONS - Moved to top as requested */}
        <div className="mb-10">
          <h3 className="text-lg font-semibold text-indigo-900 mb-4 text-center">{t.selectVoice}</h3>
          
          <div className="grid grid-cols-2 md:grid-cols-7 gap-3">
            {/* English (US) Voices */}
            <div className="col-span-2 md:col-span-3 p-3 bg-white/30 rounded-xl">
              <div className="text-center text-sm font-medium text-indigo-800 mb-2 flex items-center justify-center">
                <span className="mr-1">🇺🇸</span> English (US)
              </div>
              <div className="grid grid-cols-3 gap-2">
                {/* English US Female */}
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className={`relative overflow-hidden rounded-xl border-2 transition-all duration-300 shadow-md h-20
                    ${selectedVoice?.language === 'en-us' && selectedVoice?.gender === 'female'
                      ? 'border-white shadow-lg ring-2 ring-indigo-500 ring-offset-1'
                      : 'border-transparent'}`}
                  onClick={() => handleVoiceChange({ language: 'en-us', gender: 'female' })}
                >
                  <div className={`absolute inset-0 bg-gradient-to-br from-blue-500 to-indigo-600 ${
                    selectedVoice?.language === 'en-us' && selectedVoice?.gender === 'female'
                      ? 'opacity-100' : 'opacity-70 hover:opacity-90'
                  }`}></div>
                  
                  <div className="absolute inset-0 flex items-center justify-center text-white">
                    <div className="text-center">
                      <span className="text-xs font-medium">Female</span>
                    </div>
                  </div>
                </motion.button>
                
                {/* English US Male */}
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className={`relative overflow-hidden rounded-xl border-2 transition-all duration-300 shadow-md h-20
                    ${selectedVoice?.language === 'en-us' && selectedVoice?.gender === 'male'
                      ? 'border-white shadow-lg ring-2 ring-indigo-500 ring-offset-1'
                      : 'border-transparent'}`}
                  onClick={() => handleVoiceChange({ language: 'en-us', gender: 'male' })}
                >
                  <div className={`absolute inset-0 bg-gradient-to-br from-blue-600 to-indigo-700 ${
                    selectedVoice?.language === 'en-us' && selectedVoice?.gender === 'male'
                      ? 'opacity-100' : 'opacity-70 hover:opacity-90'
                  }`}></div>
                  
                  <div className="absolute inset-0 flex items-center justify-center text-white">
                    <div className="text-center">
                      <span className="text-xs font-medium">Male</span>
                    </div>
                  </div>
                </motion.button>
                
                {/* English US Child */}
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className={`relative overflow-hidden rounded-xl border-2 transition-all duration-300 shadow-md h-20
                    ${selectedVoice?.language === 'en-us' && selectedVoice?.gender === 'child'
                      ? 'border-white shadow-lg ring-2 ring-indigo-500 ring-offset-1'
                      : 'border-transparent'}`}
                  onClick={() => handleVoiceChange({ language: 'en-us', gender: 'child' })}
                >
                  <div className={`absolute inset-0 bg-gradient-to-br from-blue-400 to-cyan-500 ${
                    selectedVoice?.language === 'en-us' && selectedVoice?.gender === 'child'
                      ? 'opacity-100' : 'opacity-70 hover:opacity-90'
                  }`}></div>
                  
                  <div className="absolute inset-0 flex items-center justify-center text-white">
                    <div className="text-center">
                      <span className="text-xs font-medium">Child</span>
                      <span className="absolute top-1 right-1 bg-yellow-300 rounded-full w-2 h-2 animate-pulse"></span>
                    </div>
                  </div>
                </motion.button>
              </div>
            </div>
            
            {/* Hindi Voices */}
            <div className="col-span-2 md:col-span-2 p-3 bg-white/30 rounded-xl">
              <div className="text-center text-sm font-medium text-indigo-800 mb-2 flex items-center justify-center">
                <span className="mr-1">🇮🇳</span> Hindi
              </div>
              <div className="grid grid-cols-2 gap-2">
                {/* Hindi Female */}
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className={`relative overflow-hidden rounded-xl border-2 transition-all duration-300 shadow-md h-20
                    ${selectedVoice?.language === 'hi-in' && selectedVoice?.gender === 'female'
                      ? 'border-white shadow-lg ring-2 ring-indigo-500 ring-offset-1'
                      : 'border-transparent'}`}
                  onClick={() => handleVoiceChange({ language: 'hi-in', gender: 'female' })}
                >
                  <div className={`absolute inset-0 bg-gradient-to-br from-orange-500 to-red-600 ${
                    selectedVoice?.language === 'hi-in' && selectedVoice?.gender === 'female'
                      ? 'opacity-100' : 'opacity-70 hover:opacity-90'
                  }`}></div>
                  
                  <div className="absolute inset-0 flex items-center justify-center text-white">
                    <div className="text-center">
                      <span className="text-xs font-medium">Female</span>
                    </div>
                  </div>
                </motion.button>
                
                {/* Hindi Male */}
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className={`relative overflow-hidden rounded-xl border-2 transition-all duration-300 shadow-md h-20
                    ${selectedVoice?.language === 'hi-in' && selectedVoice?.gender === 'male'
                      ? 'border-white shadow-lg ring-2 ring-indigo-500 ring-offset-1'
                      : 'border-transparent'}`}
                  onClick={() => handleVoiceChange({ language: 'hi-in', gender: 'male' })}
                >
                  <div className={`absolute inset-0 bg-gradient-to-br from-orange-600 to-red-700 ${
                    selectedVoice?.language === 'hi-in' && selectedVoice?.gender === 'male'
                      ? 'opacity-100' : 'opacity-70 hover:opacity-90'
                  }`}></div>
                  
                  <div className="absolute inset-0 flex items-center justify-center text-white">
                    <div className="text-center">
                      <span className="text-xs font-medium">Male</span>
                    </div>
                  </div>
                </motion.button>
              </div>
            </div>
            
            {/* UK English Voices */}
            <div className="col-span-2 md:col-span-2 p-3 bg-white/30 rounded-xl">
              <div className="text-center text-sm font-medium text-indigo-800 mb-2 flex items-center justify-center">
                <span className="mr-1">🇬🇧</span> English (UK)
              </div>
              <div className="grid grid-cols-2 gap-2">
                {/* UK Female */}
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className={`relative overflow-hidden rounded-xl border-2 transition-all duration-300 shadow-md h-20
                    ${selectedVoice?.language === 'en-gb' && selectedVoice?.gender === 'female'
                      ? 'border-white shadow-lg ring-2 ring-indigo-500 ring-offset-1'
                      : 'border-transparent'}`}
                  onClick={() => handleVoiceChange({ language: 'en-gb', gender: 'female' })}
                >
                  <div className={`absolute inset-0 bg-gradient-to-br from-red-500 to-purple-600 ${
                    selectedVoice?.language === 'en-gb' && selectedVoice?.gender === 'female'
                      ? 'opacity-100' : 'opacity-70 hover:opacity-90'
                  }`}></div>
                  
                  <div className="absolute inset-0 flex items-center justify-center text-white">
                    <div className="text-center">
                      <span className="text-xs font-medium">Female</span>
                    </div>
                  </div>
                </motion.button>
                
                {/* UK Male */}
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className={`relative overflow-hidden rounded-xl border-2 transition-all duration-300 shadow-md h-20
                    ${selectedVoice?.language === 'en-gb' && selectedVoice?.gender === 'male'
                      ? 'border-white shadow-lg ring-2 ring-indigo-500 ring-offset-1'
                      : 'border-transparent'}`}
                  onClick={() => handleVoiceChange({ language: 'en-gb', gender: 'male' })}
                >
                  <div className={`absolute inset-0 bg-gradient-to-br from-red-600 to-purple-700 ${
                    selectedVoice?.language === 'en-gb' && selectedVoice?.gender === 'male'
                      ? 'opacity-100' : 'opacity-70 hover:opacity-90'
                  }`}></div>
                  
                  <div className="absolute inset-0 flex items-center justify-center text-white">
                    <div className="text-center">
                      <span className="text-xs font-medium">Male</span>
                    </div>
                  </div>
                </motion.button>
              </div>
            </div>
          </div>
        </div>

        {/* 2. AUDIO INFO with IMPROVED VISUALIZATION */}
        <div className="relative flex flex-col items-center mb-10">
          {/* Info Cards */}
          <div className="flex flex-wrap gap-4 justify-center z-10">
            <div className="bg-white/60 backdrop-blur-md rounded-2xl p-4 shadow-lg flex items-center gap-3 border border-white/50 hover:shadow-xl transition-all hover:bg-white/80">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center text-white text-lg font-bold shadow-lg">
                {audioInfo.format}
              </div>
              <div>
                <div className="text-xs text-indigo-800/70">{t.format}</div>
                <div className="font-medium text-indigo-900">{audioInfo.format}</div>
              </div>
            </div>
            
            <div className="bg-white/60 backdrop-blur-md rounded-2xl p-4 shadow-lg flex items-center gap-3 border border-white/50 hover:shadow-xl transition-all hover:bg-white/80">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-indigo-500 to-blue-600 flex items-center justify-center text-white text-lg font-bold shadow-lg">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </div>
              <div>
                <div className="text-xs text-indigo-800/70">{t.size}</div>
                <div className="font-medium text-indigo-900">{audioInfo.size}</div>
              </div>
            </div>
            
            <div className="bg-white/60 backdrop-blur-md rounded-2xl p-4 shadow-lg flex items-center gap-3 border border-white/50 hover:shadow-xl transition-all hover:bg-white/80">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-cyan-600 flex items-center justify-center text-white text-lg font-bold shadow-lg">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                </svg>
              </div>
              <div>
                <div className="text-xs text-indigo-800/70">{t.duration}</div>
                <div className="font-medium text-indigo-900">{audioInfo.duration}</div>
              </div>
            </div>
          </div>
        </div>

        {/* 3. ENHANCED PLAY BUTTON WITH AUDIO WAVES */}
        <div className="flex justify-center mb-10">
          <div className="play-button-container relative">
            {/* Animated concentric circles - keep these */}
            {isPlaying && (
              <>
                <div className="absolute inset-0 rounded-full animate-ping-slow opacity-20 bg-indigo-300"></div>
                <div className="absolute -inset-4 rounded-full animate-ping-slow opacity-10 bg-purple-300" style={{animationDelay: '0.5s'}}></div>
                <div className="absolute -inset-8 rounded-full animate-ping-slow opacity-5 bg-blue-300" style={{animationDelay: '1s'}}></div>
              </>
            )}
            
            {/* The actual play button */}
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={togglePlay}
              className="relative w-24 h-24 rounded-full bg-gradient-to-r from-indigo-500 to-purple-600 flex items-center justify-center text-white text-4xl shadow-xl overflow-hidden group z-10"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-indigo-500 opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <div className="absolute inset-0 flex items-center justify-center">
                {isPlaying ? (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M10 9v6m4-6v6m7-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                )}
              </div>
              
              {/* Inner glow */}
              <div className="absolute inset-1 rounded-full bg-gradient-to-r from-indigo-300/30 to-purple-300/30 blur-sm"></div>
            </motion.button>
          </div>
        </div>

        {/* 4. TIME BAR */}
        <div className="flex items-center gap-4 mb-8">
          <span className="font-mono text-xs text-indigo-800 bg-white/60 px-2 py-1 rounded-md shadow-sm">
            {new Date(currentTime * 1000).toISOString().substr(11, 8)}
          </span>
          <div className="relative flex-1 h-5 bg-white/40 rounded-full overflow-hidden shadow-inner backdrop-blur-sm cursor-pointer group"
            onClick={e => {
              const rect = e.currentTarget.getBoundingClientRect();
              const percent = (e.clientX - rect.left) / rect.width;
              seekAudio(percent * duration);
            }}
          >
            {/* Background pulse effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-indigo-200/30 via-purple-200/30 to-indigo-200/30 bg-[length:200%_100%] animate-gradient"></div>
            
            {/* Progress fill */}
            <div
              className="absolute top-0 left-0 h-full bg-gradient-to-r from-indigo-500 to-purple-600"
              style={{ width: `${(currentTime / duration) * 100}%`, transition: 'width 0.1s linear' }}
            >
              <div className="absolute top-0 right-0 h-full w-1 bg-white/20"></div>
            </div>
            
            {/* Thumb */}
            <div
              className="absolute top-1/2 -translate-y-1/2 group-hover:scale-125 transition-all duration-200"
              style={{ left: `calc(${(currentTime / duration) * 100}% - 8px)` }}
            >
              <div className="w-5 h-5 rounded-full bg-white shadow-lg ring-4 ring-indigo-400/30"></div>
            </div>
            
            {/* Time markers */}
            <div className="absolute inset-0 flex">
              {[...Array(10)].map((_, i) => (
                <div key={i} className="flex-1 border-l border-white/30 h-full first:border-l-0"></div>
              ))}
            </div>
          </div>
          <span className="font-mono text-xs text-indigo-800 bg-white/60 px-2 py-1 rounded-md shadow-sm">
            {new Date(duration * 1000).toISOString().substr(11, 8)}
          </span>
        </div>

        {/* 5. SPEED CONTROLS */}
        <div className="mb-2 text-center">
          <span className="text-sm text-indigo-800/70 font-medium">{t.speedLabel}:</span>
        </div>
        <div className="flex flex-wrap justify-center gap-2 mb-8">
          {[0.25, 0.5, 0.75, 1, 1.25, 1.5, 1.75, 2].map((rate) => (
            <motion.button
              key={rate}
              whileHover={{ y: -2 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => handlePlaybackRateChange(rate)}
              className={`px-4 py-2 rounded-full text-xs md:text-sm font-bold transition-all shadow-md
                ${playbackRate === rate
                  ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white scale-110'
                  : 'bg-white/80 backdrop-blur-sm text-indigo-800 border border-indigo-100'}`}
            >
              {rate}x
            </motion.button>
          ))}
        </div>
        
        {/* 6. TEXT DISPLAY with Font Toggle */}
        <div className="mb-2 flex justify-center">
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={toggleFont}
            className={`px-4 py-1.5 rounded-full text-sm font-medium shadow-md flex items-center gap-2 transition-all duration-300
              ${useDyslexicFont 
                ? 'bg-indigo-600 text-white border border-indigo-700' 
                : 'bg-gradient-to-r from-indigo-100 to-purple-100 text-indigo-800 border border-indigo-200'}`}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4h13M3 8h9m-9 4h6m4 0l4-4m0 0l4 4m-4-4v12" />
            </svg>
            <span>{useDyslexicFont ? t.dyslexicFont : t.standardFont}</span>
            {useDyslexicFont && (
              <span className="ml-1 text-xs bg-indigo-600 text-white px-1.5 py-0.5 rounded-full">ON</span>
            )}
          </motion.button>
        </div>
        
        <div className="bg-white/40 backdrop-blur-sm rounded-2xl border border-white/50 p-5 shadow-2xl mb-6 relative overflow-hidden hover:shadow-2xl transition-shadow">
          <div className="absolute inset-0 bg-gradient-to-br from-indigo-50/30 to-purple-50/30"></div>
          
          <div 
            ref={textScrollRef}
            className={`relative z-10 h-48 overflow-y-auto text-md leading-relaxed pr-2 text-indigo-900 scrollbar-thin scrollbar-thumb-indigo-300 scrollbar-track-transparent
              ${useDyslexicFont ? 'font-opendyslexic' : 'font-sans'}`}
            style={{
              scrollBehavior: 'smooth',
              fontFamily: useDyslexicFont ? '"OpenDyslexic", sans-serif' : 'system-ui, -apple-system, sans-serif'
            }}
          >
            {/* Enhanced reading guide line */}
            <div className="absolute w-full h-9 bg-gradient-to-r from-indigo-200/10 to-purple-200/10 pointer-events-none" 
                 style={{top: `calc(50% - 1rem)`, left: 0}}></div>
                 
            {lines.map((line, i) => (
              <p key={i} className={`mb-2 ${useDyslexicFont ? 'py-0.5' : ''}`}>{line}</p>
            ))}
          </div>
        </div>
        
        {/* DOWNLOAD BUTTON */}
        {processedAudioUrl && (
          <div className="flex justify-center">
            <motion.button
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => {
                const a = document.createElement('a');
                a.href = processedAudioUrl;
                const filename = processedAudioUrl.split('/').pop() || 
                              `audio-${selectedVoice?.language || 'en'}-${selectedVoice?.gender || 'female'}.mp3`;
                a.download = filename;
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
              }}
              className="flex items-center gap-3 px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl text-white font-semibold shadow-lg hover:shadow-xl transform transition-all"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
              {t.downloadAudio}
            </motion.button>
          </div>
        )}

        {audioError && (
          <div className="bg-red-50/80 backdrop-blur-sm border-l-4 border-red-500 p-4 mt-4 rounded-lg">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-red-800">
                  {t.audioError}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Processing Overlay */}
      <AnimatePresence>
        {isProcessing && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 backdrop-blur-md bg-white/60 flex flex-col items-center justify-center z-20 rounded-[24px]"
          >
            {/* Matrix Animation */}
            <div className="matrix-animation relative w-full h-40 mb-6">
              {matrixChars.map((c, i) => (
                <motion.span 
                  key={i} 
                  initial={{ opacity: 0 }} 
                  animate={{ opacity: c.opacity, y: [0, 10, 0], transition: { repeat: Infinity, duration: 1 + Math.random() * 2 } }}
                  className="matrix-char absolute font-mono font-bold z-10"
                  style={{ 
                    left: `${c.x}%`, 
                    top: `${c.y}%`,
                    fontSize: `${c.size}px`,
                    color: `rgba(79, 70, 229, ${c.opacity})`,
                    textShadow: '0 0 5px rgba(129, 140, 248, 0.8)'
                  }}
                >
                  {c.char}
                </motion.span>
              ))}
            </div>
            
            {/* Progress Bar & Text */}
            <div className="w-64 h-3 bg-indigo-100 rounded-full overflow-hidden mb-4 relative shadow-inner">
              <motion.div 
                className="h-full bg-gradient-to-r from-indigo-500 to-purple-600"
                animate={{ width: `${processingProgress}%` }}
                transition={{ duration: 0.3 }}
              />
            </div>
            
            <motion.div 
              className="text-indigo-700 font-bold text-xl"
              animate={{ scale: [0.98, 1.02, 0.98] }}
              transition={{ repeat: Infinity, duration: 2 }}
            >
              {`${t.processing} ${Math.round(processingProgress)}%`}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      
      <audio
        ref={audioRef}
        src={processedAudioUrl}
        preload="metadata"
        className="hidden"
        onLoadedMetadata={(e) => {
          // Fix for duration loading
          const audioDuration = e.target.duration;
          setDuration(audioDuration);
          
          // Update the duration in audio info
          const mins = Math.floor(audioDuration / 60);
          const secs = Math.floor(audioDuration % 60);
          const formattedDuration = `${mins}:${secs < 10 ? '0' + secs : secs}`;
          setAudioInfo(prev => ({ ...prev, duration: formattedDuration }));
          
          // Clear any error state since load succeeded
          setAudioError(false);
          console.log("Audio loaded successfully:", processedAudioUrl);
        }}
        onError={(e) => {
          console.error("Audio failed to load:", e.target.error, processedAudioUrl);
          setAudioError(true);
        }}
        onPlay={() => setShowWaveform(true)}
        onPause={() => console.log("Audio paused")}
        onEnded={() => {
          setIsPlaying(false);
          handleAudioEnded();
        }}
      />
      
      {/* Styles */}
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
        
        @keyframes float {
          0% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
          100% { transform: translateY(0); }
        }
        
        @keyframes gradient-shift {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }

        .audio-wave {
          position: relative;
          display: inline-block;
          vertical-align: bottom;
          height: 8px;
          opacity: 0.7;
        }
        
        .animate-ping-slow {
          animation: ping 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
        }

        .animate-gradient {
          animation: gradient-shift 15s ease infinite;
        }
        
        @keyframes ping {
          0% {
            transform: scale(1);
            opacity: 
        
        /* Add better font transition */
        .font-dyslexic, .font-sans {
          transition: all 0.3s ease;
        }
        
        /* Custom scrollbar styles */
        ::-webkit-scrollbar {
          width: 8px;
          height: 8px;
        }
        
        ::-webkit-scrollbar-thumb {
          border-radius: 4px;
          background: rgba(129, 140, 248, 0.6);
        }
        
        ::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.8);
        }
        
        /* Trapezoidal container for text */
        .trapezoidal-container {
          clip-path: polygon(0 0, 100% 0, 100% 100%, 0 85%);
        }
        
        /* Gradient background for audio waveform */
        .waveform-container {
          background: linear-gradient(to right, rgba(99, 102, 241, 0.7), rgba(129, 140, 248, 0.7));
        }
        
        /* Floating particles animation */
        @keyframes floatParticles {
          0% {
            transform: translateY(0) scale(1);
          }
          50% {
            transform: translateY(-10px) scale(1.1);
          }
          100% {
            transform: translateY(0) scale(1);
          }
        }
        
        .particles-container {
          pointer-events: none;
        }
        
        /* Responsive font sizes */
        @media (max-width: 640px) {
          .audio-pane {
            padding: 1.5rem;
          }
          
          .text-md {
            font-size: 0.875rem;
          }
          
          .text-lg {
            font-size: 1.125rem;
          }
        }
        
        @media (min-width: 640px) {
          .audio-pane {
            padding: 2rem;
          }
        }
        
        @media (min-width: 768px) {
          .audio-pane {
            padding: 2.5rem;
          }
        }
        
        @media (min-width: 1024px) {
          .audio-pane {
            padding: 3rem;
          }
        }

        .font-dyslexic {
          font-family: 'OpenDyslexic', sans-serif;
        }

        /* Enhance text readability */
        .font-dyslexic p {
          line-height: 1.6;
          letter-spacing: 0.01em;
        }
      `}</style>
      </div>
    </>
  );
}

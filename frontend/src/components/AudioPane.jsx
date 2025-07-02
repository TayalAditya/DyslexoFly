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
    interfaceLanguage: "भाषा बदलें",
    autoDetectedMsg: "Auto-detected language:",
    english: "English",
    hindi: "Hindi",
    mixed: "Mixed Content",
    speedLabel: "Speed",
    dyslexicFont: "Dyslexic Font",
    standardFont: "Standard Font",
    transcript: "Transcript",
    captions: "Captions",
    showCaptions: "Show Captions",
    hideCaptions: "Hide Captions"
  },
  hi: {
    selectVoice: "आवाज़ चुनें",
    format: "प्रारूप",
    size: "आकार",
    duration: "अवधि",
    downloadAudio: "ऑडियो डाउनलोड करें",
    audioError: "ऑडियो लोड नहीं हो सका। कृपया दूसरा विकल्प चुनें।",
    processing: "आवाज़ परिवर्तन प्रगति में...",
    interfaceLanguage: "Switch to English",
    autoDetectedMsg: "स्वतः पहचानी गई भाषा:",
    english: "अंग्रेज़ी",
    hindi: "हिंदी",
    mixed: "मिश्रित सामग्री",
    speedLabel: "गति",
    dyslexicFont: "डिस्लेक्सिक फ़ॉन्ट",
    standardFont: "मानक फ़ॉन्ट",
    transcript: "ट्रांसक्रिप्ट",
    captions: "कैप्शन",
    showCaptions: "कैप्शन दिखाएं",
    hideCaptions: "कैप्शन छुपाएं"
  }
};

export default function AudioPane({ audioUrl, onPlayingIndexChange, textContent, onVoiceChange, fileId }) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [selectedVoice, setSelectedVoice] = useState(globalAudioState.selectedVoices[fileId] || null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingProgress, setProcessingProgress] = useState(0);
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [audioInfo, setAudioInfo] = useState({ format: '—', size: '—', duration: '—' });
  const [matrixChars, setMatrixChars] = useState([]);
  const [audioError, setAudioError] = useState(false);
  const [showWaveform, setShowWaveform] = useState(true);
  const [uiLanguage, setUiLanguage] = useState('en');
  const [detectedContentLanguage, setDetectedContentLanguage] = useState(null);
  const [showLanguageSelector, setShowLanguageSelector] = useState(!globalAudioState.hasSelectedLanguage);
  const [hasSelectedLanguage, setHasSelectedLanguage] = useState(globalAudioState.hasSelectedLanguage);
  const [voiceSelected, setVoiceSelected] = useState(false);
  const [useDyslexicFont, setUseDyslexicFont] = useState(false);
  const [showCaptions, setShowCaptions] = useState(true);
  const [captionLines, setCaptionLines] = useState([]);

  const textScrollRef = useRef(null);
  const captionScrollRef = useRef(null);
  const audioRef = useRef(null);
  const progressInterval = useRef(null);
  const matrixInterval = useRef(null);
  const lastUpdateRef = useRef(Date.now());
  const wavesRef = useRef([]);

  const t = translations[uiLanguage];
  const fontClass = useDyslexicFont ? 'font-opendyslexic' : 'font-normal';

  const words = textContent
    ? textContent
        .trim()
        .split(/\s+/)
        .filter(Boolean)
    : [];

  // Process text into lines for better caption display
  useEffect(() => {
    if (textContent) {
      // Split into lines and then words
      const lines = textContent.split('\n').filter(Boolean);
      const processedLines = lines.map(line =>
        line.trim().split(/\s+/).filter(Boolean)
      );
      setCaptionLines(processedLines);
    }
  }, [textContent]);

  // Format time in MM:SS format
  const formatTime = (seconds) => {
    if (!seconds) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  // Handle audio time updates
  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);

      // Update waveform visualization
      if (wavesRef.current.length > 0 && audioRef.current.duration) {
        const progress = audioRef.current.currentTime / audioRef.current.duration;
        const newWaves = wavesRef.current.map(() => Math.random() * 30 + 10);
        wavesRef.current = newWaves;
      }

      // Calculate current word index based on playback position
      if (words.length > 0 && duration > 0) {
        const wordsPerSecond = words.length / duration;
        const currentWordIndex = Math.min(
          words.length - 1,
          Math.floor(audioRef.current.currentTime * wordsPerSecond)
        );
        setCurrentWordIndex(currentWordIndex);
      }
    }
  };

  // Find which line contains the current word
  const getCurrentLineIndex = () => {
    if (captionLines.length === 0) return 0;

    let wordCount = 0;
    for (let i = 0; i < captionLines.length; i++) {
      const lineWordCount = captionLines[i].length;
      if (wordCount + lineWordCount > currentWordIndex) {
        return i;
      }
      wordCount += lineWordCount;
    }
    return captionLines.length - 1; // last line if not found
  };

  // Handle when audio metadata is loaded
  const handleLoadedMetadata = () => {
    if (audioRef.current) {
      setDuration(audioRef.current.duration || 0);

      // Initialize waveform data - number of bars based on number of words
      const numBars = Math.min(50, Math.max(10, words.length / 5));
      wavesRef.current = Array(numBars).fill().map(() => Math.random() * 30 + 10);

      // Set audio info if available
      if (audioUrl) {
        const fileName = audioUrl.split('/').pop() || '';
        const format = fileName.split('.').pop() || '—';
        setAudioInfo({
          format: format.toUpperCase(),
          size: '1.2 MB', // Placeholder
          duration: formatTime(audioRef.current.duration)
        });
      }
    }
  };

  // Toggle play/pause
  const togglePlayPause = () => {
    if (!audioRef.current) return;

    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play().catch(e => {
        console.error("Playback failed:", e);
        setAudioError(true);
      });
    }
    setIsPlaying(!isPlaying);
    if (onPlayingIndexChange) {
      onPlayingIndexChange(isPlaying ? -1 : 0);
    }
  };

  // Handle progress bar change
  const handleProgressChange = (e) => {
    const newTime = parseFloat(e.target.value);
    setCurrentTime(newTime);
    if (audioRef.current) {
      audioRef.current.currentTime = newTime;
    }
  };

  // Handle when audio finishes playing
  const handlePlaybackEnd = () => {
    setIsPlaying(false);
    setCurrentTime(0);
    setCurrentWordIndex(0);
    if (captionScrollRef.current) {
      captionScrollRef.current.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  // Auto-detect text content language
  useEffect(() => {
    if (!textContent) return;

    const detectLanguage = (text) => {
      const hindiPattern = /[\u0900-\u097F]/;
      const englishPattern = /[A-Za-z]/;

      const hindiCharCount = (text.match(new RegExp(hindiPattern, 'g')) || []).length;
      const englishCharCount = (text.match(new RegExp(englishPattern, 'g')) || []).length;

      const totalChars = hindiCharCount + englishCharCount;

      if (totalChars === 0) return 'unknown';

      const hindiPercent = (hindiCharCount / totalChars) * 100;

      if (hindiPercent > 60) return 'hi';
      if (hindiPercent < 20) return 'en';
      return 'mixed';
    };

    const detectedLang = detectLanguage(textContent);
    setDetectedContentLanguage(detectedLang);

    if (!hasSelectedLanguage) {
      setHasSelectedLanguage(true);
      setShowLanguageSelector(true);
    }
  }, [textContent, selectedVoice]);

  // Processed audio URL for handling different environments
  const processedAudioUrl = useMemo(() => {
    if (!audioUrl) return null;
    if (audioUrl.startsWith('http')) return audioUrl;
    if (audioUrl.startsWith('/api/')) return `http://127.0.0.1:5000${audioUrl}`;
    if (!audioUrl.includes('://') && !audioUrl.startsWith('/api/')) {
      return `http://127.0.0.1:5000/api/audio/${audioUrl.split('/').pop()}`;
    }
    return audioUrl;
  }, [audioUrl]);

  // Detect voice from audioUrl
  useEffect(() => {
    if (processedAudioUrl) {
      console.log("Audio URL received:", processedAudioUrl);

      if (/^https?:\/\//.test(processedAudioUrl)) {
        try {
          new URL(processedAudioUrl);
          console.log("✅ Valid audio URL format");
        } catch {
          console.error("❌ Invalid audio URL format:", processedAudioUrl);
        }
      }

      fetch(processedAudioUrl, { method: 'HEAD' })
        .then(response => {
          if (!response.ok) console.error("❌ Audio URL returned error:", response.status);
        })
        .catch(error => console.error("❌ Failed to check audio URL:", error));

      let detectedLanguage = 'en-us';
      let detectedGender = 'female';

      if (processedAudioUrl.includes('_hi-in_')) detectedLanguage = 'hi-in';
      else if (processedAudioUrl.includes('_en-gb_')) detectedLanguage = 'en-gb';
      else if (processedAudioUrl.includes('_en-us_')) detectedLanguage = 'en-us';

      if (processedAudioUrl.includes('_child_')) detectedGender = 'child';
      else if (processedAudioUrl.includes('_male_')) detectedGender = 'male';
      else detectedGender = 'female';

      setTimeout(() => {
        if (!globalAudioState.selectedVoices[fileId]) {
          setSelectedVoice({ language: detectedLanguage, gender: detectedGender });
          console.log(`Auto-detected voice set to: ${detectedLanguage}-${detectedGender}`);
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

  // Voice options with child voice included
  const voiceOptions = [
    { label: uiLanguage === 'en' ? 'English (US) - Female' : 'अंग्रेज़ी (US) - स्त्री', language: 'en-us', gender: 'female', icon: '🇺🇸', color: 'from-blue-500 to-indigo-600' },
    { label: uiLanguage === 'en' ? 'English (US) - Male' : 'अंग्रेज़ी (US) - पुरुष', language: 'en-us', gender: 'male', icon: '🇺🇸', color: 'from-blue-600 to-indigo-700' },
    { label: uiLanguage === 'en' ? 'English (US) - Child' : 'अंग्रेज़ी (US) - बच्चा', language: 'en-us', gender: 'child', icon: '🇺🇸', color: 'from-blue-400 to-cyan-500' },
    { label: uiLanguage === 'en' ? 'Hindi - Female' : 'हिंदी - स्त्री', language: 'hi-in', gender: 'female', icon: '🇮🇳', color: 'from-orange-500 to-red-600' },
    { label: uiLanguage === 'en' ? 'Hindi - Male' : 'हिंदी - पुरुष', language: 'hi-in', gender: 'male', icon: '🇮🇳', color: 'from-orange-600 to-red-700' },
    { label: uiLanguage === 'en' ? 'English (UK) - Female' : 'अंग्रेज़ी (UK) - स्त्री', language: 'en-gb', gender: 'female', icon: '🇬🇧', color: 'from-red-500 to-purple-600' },
    { label: uiLanguage === 'en' ? 'English (UK) - Male' : 'अंग्रेज़ी (UK) - पुरुष', language: 'en-gb', gender: 'male', icon: '🇬🇧', color: 'from-red-600 to-purple-700' },
  ];

  const toggleUiLanguage = () => {
    setUiLanguage(prev => prev === 'en' ? 'hi' : 'en');
  };

  const toggleFont = () => {
    setUseDyslexicFont(prev => !prev);
  };

  const toggleCaptions = () => {
    setShowCaptions(prev => !prev);
  };

  const handleVoiceChange = (voice) => {
    const newVoice = {
      language: voice.language,
      gender: voice.gender
    };
    setSelectedVoice(newVoice);
    setVoiceSelected(true);
    setIsProcessing(true);
    setProcessingProgress(0);

    const estimatedTime = Math.max(5, Math.min(30, words.length * 0.1));
    const startTime = Date.now();

    progressInterval.current = setInterval(() => {
      setProcessingProgress(prev => {
        const elapsed = (Date.now() - startTime) / 1000;
        const timeBasedProgress = (elapsed / estimatedTime) * 100;

        if (timeBasedProgress >= 100) {
          clearInterval(progressInterval.current);
          setIsProcessing(false);
          setProcessingProgress(100);
          return 100;
        }
        return Math.min(100, timeBasedProgress);
      });
    }, 100);

    onVoiceChange(newVoice);
  };

  // Effect to apply playback rate when it changes
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.playbackRate = playbackRate;
    }
  }, [playbackRate]);

  // Effect to handle loading of new audio source
  useEffect(() => {
    if (audioRef.current && processedAudioUrl) {
      const audio = audioRef.current;
      const handleLoaded = () => {
        setAudioError(false);
        if (isPlaying) {
          audio.play().catch(e => {
            console.error("Playback failed:", e);
            setAudioError(true);
          });
        }
      };

      audio.src = processedAudioUrl;
      audio.load();
      audio.addEventListener('canplaythrough', handleLoaded);

      return () => {
        audio.removeEventListener('canplaythrough', handleLoaded);
      };
    }
  }, [processedAudioUrl]);

  // Effect to scroll to current line when it changes
  useEffect(() => {
    if (captionScrollRef.current && showCaptions) {
      const currentLineIndex = getCurrentLineIndex();
      if (currentLineIndex >= 0) {
        const lineElements = captionScrollRef.current.querySelectorAll('.caption-line');
        if (lineElements[currentLineIndex]) {
          lineElements[currentLineIndex].scrollIntoView({
            behavior: 'smooth',
            block: 'center'
          });
        }
      }
    }
  }, [currentWordIndex, showCaptions, captionLines]);

  return (
    <>
      <div className="audio-pane relative overflow-hidden rounded-[24px] border border-indigo-200/50 shadow-2xl backdrop-blur-sm p-6 md:p-10 max-w-4xl mx-auto my-8">
        {/* Animated background and particles */}
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

        {/* Content container */}
        <div className="relative z-10">
          {/* Header with language toggle and font toggle */}
          <div className="flex justify-between items-center mb-6">
            <div className="flex space-x-2">
              <button
                onClick={toggleUiLanguage}
                className="flex items-center space-x-1 px-3 py-1 bg-white/30 rounded-lg hover:bg-white/50 transition-colors"
              >
                <span className="text-sm">{t.interfaceLanguage}</span>
                <span className="text-lg">{uiLanguage === 'en' ? '🇮🇳' : '🇬🇧'}</span>
              </button>

              <button
                onClick={toggleFont}
                className="flex items-center space-x-1 px-3 py-1 bg-white/30 rounded-lg hover:bg-white/50 transition-colors"
              >
                <span className="text-sm">{useDyslexicFont ? t.standardFont : t.dyslexicFont}</span>
                <span className="text-lg">{useDyslexicFont ? 'A' : '🆎'}</span>
              </button>
            </div>

            {/* Caption toggle button */}
            {textContent && (
              <button
                onClick={toggleCaptions}
                className="flex items-center space-x-1 px-3 py-1 bg-white/30 rounded-lg hover:bg-white/50 transition-colors"
              >
                <span className="text-sm">{showCaptions ? t.hideCaptions : t.showCaptions}</span>
                <span className="text-lg">{showCaptions ? '👁️' : '👁️❌'}</span>
              </button>
            )}
          </div>

          {/* Auto-detected language notification */}
          {voiceSelected && detectedContentLanguage && (
            <div className="mb-4 text-center text-sm text-indigo-800/70 bg-white/50 py-1 px-3 rounded-full inline-block mx-auto">
              {t.autoDetectedMsg} {' '}
              <span className="font-semibold">
                {detectedContentLanguage === 'en' ? t.english :
                 detectedContentLanguage === 'hi' ? t.hindi : t.mixed}
              </span>
            </div>
          )}

          {/* Voice selection section */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-indigo-900 mb-4 text-center">{t.selectVoice}</h3>

            {/* Initially show only the select button */}
            {!voiceSelected ? (
              <div className="flex justify-center">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setVoiceSelected(true)}
                  className="px-6 py-4 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-medium shadow-lg hover:shadow-xl transition-all text-lg"
                >
                  {t.selectVoice}
                </motion.button>
              </div>
            ) : (
              // Voice selection grid
              <div className="grid grid-cols-2 md:grid-cols-7 gap-3">
                {voiceOptions.map((voice, index) => {
                  const isSelected =
                    selectedVoice?.language === voice.language &&
                    selectedVoice?.gender === voice.gender;

                  return (
                    <motion.button
                      key={index}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className={`relative overflow-hidden rounded-xl border-2 transition-all duration-300 shadow-md h-20 flex flex-col items-center justify-center p-2 text-xs ${isSelected ? 'ring-2 ring-offset-1 ring-indigo-500' : ''}`}
                      style={{
                        background: isSelected
                          ? `linear-gradient(to bottom right, var(--tw-gradient-from), var(--tw-gradient-to))`
                          : 'linear-gradient(to bottom right, #f3f4f6, #e5e7eb)',
                      }}
                      onClick={() => handleVoiceChange(voice)}
                      disabled={isProcessing}
                    >
                      <div className="text-xl mb-1">{voice.icon}</div>
                      <div className="text-center font-medium text-indigo-900">
                        {voice.label.split(' - ')[0].split('(')[0]}
                      </div>
                      <div className="text-center text-indigo-600 text-xs mt-1">
                        {voice.gender === 'female' ? '♀' : voice.gender === 'male' ? '♂' : '👧'}
                      </div>
                      {isSelected && (
                        <div className="absolute -top-1 -right-1 w-4 h-4 bg-indigo-500 rounded-full flex items-center justify-center">
                          <svg className="w-2 h-2 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                        </div>
                      )}
                    </motion.button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Processing state visualization */}
          {isProcessing && (
            <div className="processing-state my-6 relative h-32 overflow-hidden rounded-xl bg-indigo-900/5 border border-indigo-300">
              <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/10 via-purple-500/10 to-pink-500/10"></div>

              {/* Matrix-like animation */}
              <div className="absolute inset-0 overflow-hidden">
                {matrixChars.map((char, index) => (
                  <div
                    key={index}
                    className="absolute text-green-400 font-mono"
                    style={{
                      left: `${char.x}%`,
                      top: `${char.y}%`,
                      fontSize: `${char.size}px`,
                      opacity: char.opacity,
                      textShadow: '0 0 5px rgba(167, 139, 250, 0.5)'
                    }}
                  >
                    {char.char}
                  </div>
                ))}
              </div>

              {/* Progress bar */}
              <div className="absolute bottom-0 left-0 right-0 h-2 bg-indigo-800/30">
                <div
                  className="h-full bg-gradient-to-r from-indigo-400 to-purple-500"
                  style={{ width: `${processingProgress}%` }}
                ></div>
              </div>

              {/* Processing text */}
              <div className="relative z-10 flex flex-col items-center justify-center h-full">
                <div className="text-white text-lg font-medium mb-2">{t.processing}</div>
                <div className="text-indigo-200 text-sm">{Math.round(processingProgress)}%</div>
              </div>
            </div>
          )}

          {/* Captions display with scrolling */}
          {showCaptions && voiceSelected && !isProcessing && textContent && (
            <div className="captions-container mb-6">
              <h3 className="text-sm font-medium text-indigo-700 mb-2">
                {t.captions}
              </h3>
              <div
                ref={captionScrollRef}
                className="caption-scroll bg-white/30 p-4 rounded-lg overflow-y-auto max-h-64"
                style={{ scrollBehavior: 'smooth' }}
              >
                {captionLines.map((line, lineIndex) => {
                  // Calculate word indices for this line
                  let startWordIndex = 0;
                  for (let i = 0; i < lineIndex; i++) {
                    startWordIndex += captionLines[i].length;
                  }
                  const endWordIndex = startWordIndex + line.length - 1;

                  // Check if current word is in this line
                  const isCurrentLine = currentWordIndex >= startWordIndex &&
                                        currentWordIndex <= endWordIndex;

                  return (
                    <div
                      key={lineIndex}
                      className={`caption-line mb-3 p-1 rounded ${isCurrentLine ? 'bg-yellow-100' : ''}`}
                    >
                      {line.map((word, wordIndex) => {
                        const absoluteWordIndex = startWordIndex + wordIndex;
                        const isCurrentWord = absoluteWordIndex === currentWordIndex;
                        return (
                          <span
                            key={wordIndex}
                            className={`px-1 ${isCurrentWord ? 'bg-yellow-300 rounded font-bold' : ''} ${fontClass}`}
                          >
                            {word}
                            {wordIndex < line.length - 1 ? ' ' : ''}
                          </span>
                        );
                      })}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Audio visualization/waveform */}
          {voiceSelected && !isProcessing && (
            <>
              {/* Waveform visualization */}
              <div className="waveform-container h-20 w-full bg-white/20 rounded-lg overflow-hidden mb-4">
                {wavesRef.current.length > 0 && wavesRef.current.map((wave, index) => (
                  <div
                    key={index}
                    className="wave-bar inline-block h-full bg-gradient-to-b from-indigo-500 to-purple-600"
                    style={{
                      width: `${100 / wavesRef.current.length}%`,
                      height: `${wave}%`,
                      marginRight: '1px'
                    }}
                  ></div>
                ))}
              </div>

              {/* Audio controls */}
              <div className="audio-controls flex flex-col items-center space-y-4 mb-6">
                <div className="w-full flex items-center space-x-3">
                  <button
                    onClick={togglePlayPause}
                    disabled={audioError || !processedAudioUrl}
                    className="w-12 h-12 rounded-full bg-indigo-600 text-white flex items-center justify-center shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isPlaying ? (
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zM7 8a1 1 0 012 0v4a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v4a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                    ) : (
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-1" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                      </svg>
                    )}
                  </button>

                  <div className="flex-1 h-2 bg-white/30 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full"
                      style={{ width: `${duration ? (currentTime / duration) * 100 : 0}%` }}
                    ></div>
                  </div>

                  <span className="text-sm text-indigo-800 min-w-[80px] text-center">
                    {formatTime(currentTime)} / {formatTime(duration)}
                  </span>
                </div>

                {/* Speed control */}
                <div className="w-full">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-sm text-indigo-800">{t.speedLabel}:</span>
                    <span className="text-sm font-medium">{playbackRate.toFixed(1)}x</span>
                  </div>
                  <input
                    type="range"
                    min="0.5"
                    max="2"
                    step="0.1"
                    value={playbackRate}
                    onChange={(e) => setPlaybackRate(parseFloat(e.target.value))}
                    className="w-full h-2 bg-white/30 rounded-lg appearance-none cursor-pointer"
                  />
                  <div className="flex justify-between text-xs text-indigo-500 mt-1">
                    <span>0.5x</span>
                    <span>1x</span>
                    <span>1.5x</span>
                    <span>2x</span>
                  </div>
                </div>
              </div>

              {/* Audio info and download */}
              <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-6">
                <div className="audio-info grid grid-cols-3 gap-4 text-center w-full sm:w-auto">
                  <div>
                    <div className="text-xs text-indigo-600">{t.format}</div>
                    <div className="font-medium">{audioInfo.format}</div>
                  </div>
                  <div>
                    <div className="text-xs text-indigo-600">{t.size}</div>
                    <div className="font-medium">{audioInfo.size}</div>
                  </div>
                  <div>
                    <div className="text-xs text-indigo-600">{t.duration}</div>
                    <div className="font-medium">{audioInfo.duration}</div>
                  </div>
                </div>

                {processedAudioUrl && (
                  <a
                    href={processedAudioUrl}
                    download
                    className="download-button w-full sm:w-auto flex items-center justify-center bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white py-2 px-6 rounded-lg transition-all shadow-md hover:shadow-lg"
                  >
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                    </svg>
                    {t.downloadAudio}
                  </a>
                )}
              </div>

              {/* Error message if audio failed to load */}
              {audioError && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-800 text-center mb-4">
                  {t.audioError}
                </div>
              )}

              {/* Hidden audio element */}
              <audio
                ref={audioRef}
                src={processedAudioUrl}
                onTimeUpdate={handleTimeUpdate}
                onLoadedMetadata={handleLoadedMetadata}
                onEnded={handlePlaybackEnd}
                onError={() => setAudioError(true)}
                style={{ display: 'none' }}
                onPlay={() => setIsPlaying(true)}
                onPause={() => setIsPlaying(false)}
              />
            </>
          )}
        </div>
      </div>

      {/* Add some global styles for the animations */}
      <style jsx global>{`
        @keyframes float {
          0% {
            transform: translateY(0) rotate(0deg);
          }
          50% {
            transform: translateY(-10px) rotate(5deg);
          }
          100% {
            transform: translateY(0) rotate(0deg);
          }
        }

        @keyframes pulse {
          0%, 100% {
            opacity: 0.8;
            transform: scale(1);
          }
          50% {
            opacity: 1;
            transform: scale(1.05);
          }
        }

        .bg-grid-pattern {
          background-image: linear-gradient(to right, rgba(203, 213, 225, 0.1) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(203, 213, 225, 0.1) 1px, transparent 1px);
          background-size: 40px 40px;
        }

        .font-opendyslexic {
          font-family: 'OpenDyslexic', sans-serif;
        }
      `}</style>
    </>
  );
}

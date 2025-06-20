'use client'

import { useState, useRef, useEffect } from 'react'

export default function AudioPane({ audioUrl, onPlayingIndexChange, textContent }) {
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [playbackRate, setPlaybackRate] = useState(1)
  const audioRef = useRef(null)
  
  // Calculate which word is being spoken based on current time
  useEffect(() => {
    if (!textContent) return;
    
    // Simple approximation: assuming each word takes approx the same time
    const words = textContent.split(/\s+/);
    const wordDuration = duration / words.length;
    const currentWordIndex = Math.floor(currentTime / wordDuration);
    
    if (isPlaying && currentWordIndex >= 0 && currentWordIndex < words.length) {
      onPlayingIndexChange && onPlayingIndexChange(currentWordIndex);
    }
  }, [currentTime, duration, isPlaying, textContent, onPlayingIndexChange]);
  
  // Handle time update events
  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
    }
  };
  
  // Handle duration change
  const handleDurationChange = () => {
    if (audioRef.current) {
      setDuration(audioRef.current.duration);
    }
  };
  
  // Format time in MM:SS
  const formatTime = (time) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds < 10 ? '0' + seconds : seconds}`;
  };
  
  // Toggle play/pause
  const togglePlay = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };
  
  // Set playback rate
  const changePlaybackRate = (rate) => {
    if (audioRef.current) {
      audioRef.current.playbackRate = rate;
      setPlaybackRate(rate);
    }
  };
  
  if (!audioUrl) {
    return (
      <div className="bg-white rounded-lg shadow p-4 h-full">
        <div className="mb-4">
          <h2 className="font-bold text-lg text-gray-800">Audio Version</h2>
        </div>
        <div className="flex flex-col items-center justify-center h-48">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 11c0 3.517-1.009 6.799-2.753 9.571m-3.44-2.04l.054-.09A13.916 13.916 0 008 11a4 4 0 118 0c0 1.017-.07 2.019-.203 3m-2.118 6.844A21.88 21.88 0 0015.171 17m3.839 1.132c.645-2.266.99-4.659.99-7.132A8 8 0 008 4.07M3 15.364c.64-1.319 1-2.8 1-4.364 0-1.457.39-2.823 1.07-4" />
          </svg>
          <p className="text-gray-500 text-center">Audio is being generated or is not available for this document.</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="bg-white rounded-lg shadow p-4 h-full">
      <div className="mb-4">
        <h2 className="font-bold text-lg text-gray-800">Audio Version</h2>
      </div>
      
      <audio
        ref={audioRef}
        src={audioUrl}
        onTimeUpdate={handleTimeUpdate}
        onDurationChange={handleDurationChange}
        onEnded={() => setIsPlaying(false)}
        className="hidden"
      />
      
      <div className="mb-4">
        <div className="flex items-center space-x-2 mb-2">
          <button
            onClick={togglePlay}
            className="p-2 rounded-full bg-blue-600 text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {isPlaying ? (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 9v6m4-6v6m7-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            )}
          </button>
          
          <div className="flex-grow">
            <input
              type="range"
              min="0"
              max={duration || 0}
              value={currentTime}
              onChange={(e) => {
                const value = parseFloat(e.target.value);
                if (audioRef.current) {
                  audioRef.current.currentTime = value;
                  setCurrentTime(value);
                }
              }}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
            />
          </div>
          
          <span className="text-sm text-gray-500">
            {formatTime(currentTime)} / {formatTime(duration)}
          </span>
        </div>
      </div>
      
      <div className="mt-6">
        <h3 className="text-sm font-medium text-gray-700 mb-2">Playback Speed</h3>
        <div className="flex space-x-2">
          {[0.5, 0.75, 1, 1.25, 1.5, 2].map((rate) => (
            <button
              key={rate}
              onClick={() => changePlaybackRate(rate)}
              className={`px-2 py-1 text-xs rounded ${
                playbackRate === rate 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
              }`}
            >
              {rate}x
            </button>
          ))}
        </div>
      </div>
      
      <div className="mt-6">
        <button
          onClick={() => {
            const a = document.createElement('a')
            a.href = audioUrl
            a.download = 'audio_content.mp3'
            document.body.appendChild(a)
            a.click()
            document.body.removeChild(a)
          }}
          className="flex items-center justify-center w-full py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-md font-medium"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
          Download Audio
        </button>
      </div>
    </div>
  )
}
'use client'

import Link from 'next/link';
import Image from 'next/image';
import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function ProjectOverview() {
  const [activeSection, setActiveSection] = useState(0);
  const sectionRefs = [useRef(null), useRef(null), useRef(null), useRef(null), useRef(null), useRef(null)];
  const [isVisible, setIsVisible] = useState({
    projectInfo: false,
    team: false,
    implementation: false,
    analytics: false,
    impact: false,
    roadmap: false
  });

  // Real-time data states with persistence
  const [projectStats, setProjectStats] = useState(() => {
    // Try to load from localStorage first
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('dyslexofly-project-stats');
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch (e) {
          console.warn('Failed to parse saved project stats');
        }
      }
    }
    // Default values
    return {
      totalUploads: 0,
      uniqueFiles: 0,
      todayUploads: 0,
      processingTime: '0s',
      successRate: '0%',
      activeUsers: 0
    };
  });
  const [fileTrackingData, setFileTrackingData] = useState(null);
  const [loading, setLoading] = useState(true);

  // Load file tracking data
  useEffect(() => {
    loadFileTrackingData();
  }, []);

  const loadFileTrackingData = async () => {
    try {
      const response = await fetch('http://127.0.0.1:5000/api/file-tracking');
      if (response.ok) {
        const result = await response.json();
        const text = result.data || '';
        const lines = text.split('\n').filter(line => line.trim());
        const files = lines.map(line => {
          const [filename, path, timestamp] = line.split('|');
          return { filename, path, timestamp: new Date(timestamp) };
        });
        
        const uniqueFiles = new Set(files.map(f => f.filename)).size;
        const todayUploads = files.filter(f => 
          f.timestamp.toDateString() === new Date().toDateString()
        ).length;
        
        setFileTrackingData({
          totalFiles: files.length,
          uniqueFiles,
          recentFiles: files.slice(-10),
          todayUploads,
          weeklyUploads: files.filter(f => {
            const weekAgo = new Date();
            weekAgo.setDate(weekAgo.getDate() - 7);
            return f.timestamp >= weekAgo;
          }).length,
          monthlyUploads: files.filter(f => {
            const monthAgo = new Date();
            monthAgo.setMonth(monthAgo.getMonth() - 1);
            return f.timestamp >= monthAgo;
          }).length,
          fileTypes: getFileTypeStats(files),
          uploadTrends: getUploadTrends(files)
        });

        const newStats = {
          totalUploads: files.length,
          uniqueFiles,
          todayUploads,
          processingTime: calculateAvgProcessingTime(files),
          successRate: files.length > 0 ? '100%' : '0%',
          activeUsers: files.length > 0 ? Math.max(1, Math.floor(files.length / 10)) : 0
        };
        setProjectStats(newStats);
        
        // Save to localStorage for persistence
        if (typeof window !== 'undefined') {
          localStorage.setItem('dyslexofly-project-stats', JSON.stringify(newStats));
        }
      }
    } catch (error) {
      console.warn('Failed to load file tracking data:', error);
      // Only reset to zeros if there's no saved data
      if (typeof window !== 'undefined') {
        const saved = localStorage.getItem('dyslexofly-project-stats');
        if (!saved) {
          setProjectStats({
            totalUploads: 0,
            uniqueFiles: 0,
            todayUploads: 0,
            processingTime: '0s',
            successRate: '0%',
            activeUsers: 0
          });
        }
      }
    } finally {
      setLoading(false);
    }
  };

  const getFileTypeStats = (files) => {
    const types = {};
    files.forEach(file => {
      const ext = file.filename.split('.').pop()?.toLowerCase() || 'unknown';
      types[ext] = (types[ext] || 0) + 1;
    });
    return types;
  };

  const getUploadTrends = (files) => {
    const last7Days = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dayFiles = files.filter(f => 
        f.timestamp.toDateString() === date.toDateString()
      ).length;
      last7Days.push({
        date: date.toLocaleDateString('en-US', { weekday: 'short' }),
        uploads: dayFiles
      });
    }
    return last7Days;
  };

  const calculateAvgProcessingTime = (files) => {
    // Simulate processing time based on file count
    const avgTime = Math.max(5, Math.min(30, files.length * 0.1));
    return `${avgTime.toFixed(1)}s`;
  };

  // Function to check if element is in viewport
  const isInViewport = (element) => {
    if (!element) return false;
    const rect = element.getBoundingClientRect();
    return (
      rect.top >= 0 &&
      rect.left >= 0 &&
      rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
      rect.right <= (window.innerWidth || document.documentElement.clientWidth)
    );
  };

  // Scroll event listener to reveal sections
  useEffect(() => {
    const handleScroll = () => {
      setIsVisible({
        projectInfo: isInViewport(sectionRefs[0].current),
        team: isInViewport(sectionRefs[1].current),
        implementation: isInViewport(sectionRefs[2].current),
        analytics: isInViewport(sectionRefs[3].current),
        impact: isInViewport(sectionRefs[4].current),
        roadmap: isInViewport(sectionRefs[5].current)
      });

      // Update active section based on which one is most visible
      for (let i = 0; i < sectionRefs.length; i++) {
        if (isInViewport(sectionRefs[i].current)) {
          setActiveSection(i);
          break;
        }
      }
    };

    // Initial check
    handleScroll();

    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  // Team member card flip state
  const [flippedCard, setFlippedCard] = useState(null);

  return (
    <div className="min-h-screen pattern-bg py-12">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header section with animation */}
        <motion.div 
          className="text-center mb-8"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h1 className="text-4xl font-bold text-indigo-900 mb-4">DyslexoFly Project Overview</h1>
          <p className="text-indigo-700 max-w-3xl mx-auto text-lg">
            Making reading accessible for everyone through innovative technology and AI-powered solutions
          </p>
          {!loading && (
            <motion.div 
              className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4 max-w-2xl mx-auto"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3, duration: 0.5 }}
            >
              <div className="bg-white/80 backdrop-blur-sm rounded-lg p-3 shadow-md">
                <div className="text-2xl font-bold text-indigo-600">{projectStats.totalUploads}</div>
                <div className="text-xs text-gray-600">Total Uploads</div>
              </div>
              <div className="bg-white/80 backdrop-blur-sm rounded-lg p-3 shadow-md">
                <div className="text-2xl font-bold text-green-600">{projectStats.successRate}</div>
                <div className="text-xs text-gray-600">Success Rate</div>
              </div>
              <div className="bg-white/80 backdrop-blur-sm rounded-lg p-3 shadow-md">
                <div className="text-2xl font-bold text-purple-600">{projectStats.activeUsers}</div>
                <div className="text-xs text-gray-600">Active Users</div>
              </div>
              <div className="bg-white/80 backdrop-blur-sm rounded-lg p-3 shadow-md">
                <div className="text-2xl font-bold text-orange-600">{projectStats.processingTime}</div>
                <div className="text-xs text-gray-600">Avg Processing</div>
              </div>
            </motion.div>
          )}
        </motion.div>

        {/* Navigation dots */}
        <div className="fixed right-8 top-1/2 transform -translate-y-1/2 hidden md:flex flex-col gap-3 z-10">
          {[0, 1, 2, 3, 4, 5].map((index) => (
            <button 
              key={index}
              onClick={() => {
                sectionRefs[index].current?.scrollIntoView({ behavior: 'smooth' });
              }}
              className={`w-3 h-3 rounded-full transition-all duration-300 ${
                activeSection === index ? 'bg-indigo-600 w-4 h-4' : 'bg-indigo-300 hover:bg-indigo-400'
              }`}
              aria-label={`Scroll to section ${index + 1}`}
            />
          ))}
        </div>

        <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl overflow-hidden border border-indigo-100">
          <div className="p-6 md:p-8">
            {/* Project Info Section */}
            <section 
              ref={sectionRefs[0]} 
              className={`mb-12 transition-all duration-1000 transform ${
                isVisible.projectInfo ? 'translate-x-0 opacity-100' : 'translate-x-8 opacity-0'
              }`}
            >
              <div className="flex items-center mb-4">
                <div className="bg-indigo-100 p-2 rounded-full mr-3">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-indigo-600" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 1.944A11.954 11.954 0 012.166 5C2.056 5.649 2 6.319 2 7c0 5.225 3.34 9.67 8 11.317C14.66 16.67 18 12.225 18 7c0-.682-.057-1.35-.166-2.001A11.954 11.954 0 0110 1.944zM11 14a1 1 0 11-2 0 1 1 0 012 0zm0-7a1 1 0 10-2 0v3a1 1 0 102 0V7z" clipRule="evenodd" />
                  </svg>
                </div>
                <h2 className="text-2xl font-semibold text-indigo-900">Hackathon Project</h2>
              </div>
              <div className="flex flex-wrap items-center gap-2 mb-4">
                <span className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white px-3 py-1 rounded-full text-sm font-medium">
                  🎯 EdTech Solutions
                </span>
              </div>
              <p className="text-indigo-800 mb-4 leading-relaxed">
                DyslexoFly was built for the <strong className="text-indigo-900">Code for Bharat Season 2 Hackathon</strong> by Tech Masters India 
                with the goal of empowering the 70 million+ dyslexic learners in India. Our solution transforms any educational 
                document into an accessible, engaging format—instantly.
              </p>
              <div className="bg-gradient-to-r from-indigo-50 to-purple-50 p-6 rounded-lg border border-indigo-100 shadow-inner hover:shadow-md transition-all duration-300 cursor-pointer transform hover:scale-[1.01]">
                <p className="text-indigo-700 text-sm italic">
                  &ldquo;Our vision is to create a tool that helps bridge the gap between conventional 
                  educational materials and the unique learning needs of individuals with dyslexia.&rdquo;
                </p>
              </div>
            </section>

            {/* Team section with interactive cards */}
            <section 
              ref={sectionRefs[1]} 
              className={`mb-12 transition-all duration-1000 transform ${
                isVisible.team ? 'translate-y-0 opacity-100' : 'translate-y-16 opacity-0'
              }`}
            >
              <div className="flex items-center mb-4">
                <div className="bg-indigo-100 p-2 rounded-full mr-3">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-indigo-600" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3 3 0 013.75-2.906z" />
                  </svg>
                </div>
                <h2 className="text-2xl font-semibold text-indigo-900">Our Team: The Kamand Krew</h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
                {/* Aditya's card with flip effect */}
                <div 
                  className={`bg-white rounded-lg border border-indigo-100 shadow-sm h-40 perspective relative transition-transform duration-500 ${
                    flippedCard === 'aditya' ? 'team-card-flipped' : ''
                  }`}
                  onClick={() => setFlippedCard(flippedCard === 'aditya' ? null : 'aditya')}
                >
                  <div className="absolute w-full h-full backface-hidden team-card-front p-5">
                    <div className="flex items-start">
                      <div className="mr-4 flex-shrink-0">
                        <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-indigo-100">
                          <img 
                            src="frontend/public/images/at.jpg" 
                            alt="Aditya Tayal"
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              e.target.style.display = 'none';
                              e.target.nextSibling.style.display = 'flex';
                            }}
                          />
                          <div className="w-full h-full bg-gradient-to-br from-indigo-400 to-purple-600 flex items-center justify-center text-white font-bold text-xl" style={{display: 'none'}}>
                            AT
                          </div>
                        </div>
                      </div>
                      <div>
                        <h3 className="font-semibold text-indigo-900">Aditya Tayal</h3>
                        <p className="text-indigo-700 text-sm">Full-stack & AI Integration</p>
                        <p className="mt-2 text-sm text-indigo-600">IIT Mandi, 3rd Year CSE</p>
                        <div className="mt-2">
                          <span className="text-xs bg-indigo-100 text-indigo-700 px-2 py-1 rounded-full inline-flex items-center">
                            Click to see more
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="absolute w-full h-full backface-hidden team-card-back p-5 bg-indigo-50">
                    <h3 className="font-semibold text-indigo-900 mb-2">About Aditya</h3>
                    <p className="text-sm text-indigo-700">
                      Passionate about AI and accessible technology. Works with React, Python, and 
                      various AI frameworks to build inclusive solutions.
                    </p>
                    <div className="absolute bottom-4 right-4">
                      <a href="https://github.com/TayalAditya" target="_blank" rel="noopener noreferrer" 
                         className="text-xs bg-indigo-600 text-white px-2 py-1 rounded-full inline-flex items-center">
                        <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                          <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
                        </svg>
                        GitHub
                      </a>
                    </div>
                  </div>
                </div>

                {/* Siddhi's card with flip effect */}
                <div 
                  className={`bg-white rounded-lg border border-indigo-100 shadow-sm h-40 perspective relative transition-transform duration-500 ${
                    flippedCard === 'siddhi' ? 'team-card-flipped' : ''
                  }`}
                  onClick={() => setFlippedCard(flippedCard === 'siddhi' ? null : 'siddhi')}
                >
                  <div className="absolute w-full h-full backface-hidden team-card-front p-5">
                    <div className="flex items-start">
                      <div className="mr-4 flex-shrink-0">
                        <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-indigo-100">
                          <img 
                            src="frontend\public\images\ssp.jpg" 
                            alt="Siddhi Pogakwar"
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              e.target.style.display = 'none';
                              e.target.nextSibling.style.display = 'flex';
                            }}
                          />
                          <div className="w-full h-full bg-gradient-to-br from-pink-400 to-red-600 flex items-center justify-center text-white font-bold text-xl" style={{display: 'none'}}>
                            SP
                          </div>
                        </div>
                      </div>
                      <div>
                        <h3 className="font-semibold text-indigo-900">Siddhi Pogakwar</h3>
                        <p className="text-indigo-700 text-sm">TTS Training & Text Analyser</p>
                        <p className="mt-2 text-sm text-indigo-600">IIT Mandi, 3rd Year MnC</p>
                        <div className="mt-2">
                          <span className="text-xs bg-indigo-100 text-indigo-700 px-2 py-1 rounded-full inline-flex items-center">
                            Click to see more
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="absolute w-full h-full backface-hidden team-card-back p-5 bg-indigo-50">
                    <h3 className="font-semibold text-indigo-900 mb-2">About Siddhi</h3>
                    <p className="text-sm text-indigo-700">
                      Specializes in computational linguistics and text analysis. Experienced in 
                      training text-to-speech models and natural language processing.
                    </p>
                    <div className="absolute bottom-4 right-4">
                      <a href="https://github.com/SiddhiPogakwar123" target="_blank" rel="noopener noreferrer" 
                         className="text-xs bg-indigo-600 text-white px-2 py-1 rounded-full inline-flex items-center">
                        <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                          <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
                        </svg>
                        GitHub
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* Implementation section with animated list */}
            <section 
              ref={sectionRefs[2]} 
              className={`mb-12 transition-all duration-1000 transform ${
                isVisible.implementation ? 'translate-x-0 opacity-100' : '-translate-x-8 opacity-0'
              }`}
            >
              <div className="flex items-center mb-4">
                <div className="bg-indigo-100 p-2 rounded-full mr-3">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-indigo-600" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M3 3a1 1 0 000 2v8a2 2 0 002 2h2.586l-1.293 1.293a1 1 0 101.414 1.414L10 15.414l2.293 2.293a1 1 0 001.414-1.414L12.414 15H15a2 2 0 002-2V5a1 1 0 100-2H3zm11.707 4.707a1 1 0 00-1.414-1.414L10 9.586 8.707 8.293a1 1 0 00-1.414 0l-2 2a1 1 0 101.414 1.414L8 10.414l1.293 1.293a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                </div>
                <h2 className="text-2xl font-semibold text-indigo-900">Project Implementation</h2>
              </div>

              <p className="text-indigo-800 mb-4">
                Our solution leverages modern web technologies and AI to create a seamless experience:
              </p>

              <ul className="space-y-3 mb-4">
                {['Frontend', 'Backend', 'AI Features', 'Language Support'].map((item, index) => (
                  <li 
                    key={item} 
                    className={`flex items-start transition-all duration-700 transform ${
                      isVisible.implementation 
                        ? 'translate-x-0 opacity-100' 
                        : 'translate-x-8 opacity-0'
                    }`}
                    style={{ transitionDelay: `${index * 200}ms` }}
                  >
                    <svg className="h-5 w-5 text-indigo-600 mt-0.5 mr-2 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    {item === 'Frontend' ? (
                      <span className="text-indigo-800"><strong className="text-indigo-900">Frontend:</strong> Next.js with Tailwind CSS for a responsive, accessible interface</span>
                    ) : item === 'Backend' ? (
                      <span className="text-indigo-800"><strong className="text-indigo-900">Backend:</strong> Python with Flask for text processing and AI integration</span>
                    ) : item === 'AI Features' ? (
                      <span className="text-indigo-800"><strong className="text-indigo-900">AI Features:</strong> Text extraction, summarization, and text-to-speech conversion</span>
                    ) : (
                      <span className="text-indigo-800"><strong className="text-indigo-900">Language Support:</strong> Currently Focused on English, Hindi with potential for more</span>
                    )}
                  </li>
                ))}
              </ul>

              <div className="bg-white p-6 rounded-lg border border-indigo-100 shadow-sm mt-6 transform transition-all hover:shadow-md cursor-pointer hover:scale-[1.01] duration-300">
                <h3 className="font-medium text-indigo-900 mb-2">GitHub Repository</h3>
                <p className="text-sm text-indigo-700 mb-3">
                  Our project code is available on GitHub. Feel free to explore, contribute, or use it as inspiration!
                </p>
                <a 
                  href="https://github.com/TayalAditya/DyslexoFly" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="inline-flex items-center text-sm bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 transition-colors transform hover:translate-y-[-2px]"
                >
                  <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
                  </svg>
                  View on GitHub
                </a>
              </div>
            </section>

            {/* Analytics Section - NEW */}
            <section 
              ref={sectionRefs[3]} 
              className={`mb-12 transition-all duration-1000 transform ${
                isVisible.analytics ? 'translate-y-0 opacity-100' : 'translate-y-16 opacity-0'
              }`}
            >
              <div className="flex items-center mb-4">
                <div className="bg-green-100 p-2 rounded-full mr-3">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-green-600" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zM8 7a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zM14 4a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z" />
                  </svg>
                </div>
                <h2 className="text-2xl font-semibold text-indigo-900">Platform Analytics</h2>
              </div>

              {loading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500"></div>
                  <span className="ml-3 text-indigo-600">Loading analytics...</span>
                </div>
              ) : (
                <>
                  {/* Real-time Stats Grid */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                    <motion.div 
                      className="bg-gradient-to-br from-blue-50 to-indigo-100 p-4 rounded-lg border border-blue-200"
                      whileHover={{ scale: 1.05 }}
                      transition={{ type: "spring", stiffness: 300 }}
                    >
                      <div className="text-2xl font-bold text-blue-600">{projectStats.totalUploads}</div>
                      <div className="text-sm text-blue-700">Total Documents</div>
                      <div className="text-xs text-blue-500 mt-1">All time</div>
                    </motion.div>
                    
                    <motion.div 
                      className="bg-gradient-to-br from-green-50 to-emerald-100 p-4 rounded-lg border border-green-200"
                      whileHover={{ scale: 1.05 }}
                      transition={{ type: "spring", stiffness: 300 }}
                    >
                      <div className="text-2xl font-bold text-green-600">{projectStats.uniqueFiles}</div>
                      <div className="text-sm text-green-700">Unique Files</div>
                      <div className="text-xs text-green-500 mt-1">Processed</div>
                    </motion.div>
                    
                    <motion.div 
                      className="bg-gradient-to-br from-purple-50 to-pink-100 p-4 rounded-lg border border-purple-200"
                      whileHover={{ scale: 1.05 }}
                      transition={{ type: "spring", stiffness: 300 }}
                    >
                      <div className="text-2xl font-bold text-purple-600">{projectStats.todayUploads}</div>
                      <div className="text-sm text-purple-700">Today's Uploads</div>
                      <div className="text-xs text-purple-500 mt-1">Last 24h</div>
                    </motion.div>
                    
                    <motion.div 
                      className="bg-gradient-to-br from-orange-50 to-red-100 p-4 rounded-lg border border-orange-200"
                      whileHover={{ scale: 1.05 }}
                      transition={{ type: "spring", stiffness: 300 }}
                    >
                      <div className="text-2xl font-bold text-orange-600">{projectStats.processingTime}</div>
                      <div className="text-sm text-orange-700">Avg Processing</div>
                      <div className="text-xs text-orange-500 mt-1">Per document</div>
                    </motion.div>
                  </div>

                  {/* File Types Distribution */}
                  {fileTrackingData?.fileTypes && (
                    <div className="bg-gray-50 p-4 rounded-lg mb-6">
                      <h4 className="font-semibold text-gray-800 mb-3">File Types Distribution</h4>
                      <div className="grid grid-cols-3 md:grid-cols-6 gap-2">
                        {Object.entries(fileTrackingData.fileTypes).map(([type, count]) => (
                          <div key={type} className="text-center p-2 bg-white rounded border">
                            <div className="text-lg font-bold text-indigo-600">{count}</div>
                            <div className="text-xs text-gray-600 uppercase">{type}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Upload Trends */}
                  {fileTrackingData?.uploadTrends && (
                    <div className="bg-indigo-50 p-4 rounded-lg">
                      <h4 className="font-semibold text-indigo-800 mb-3">7-Day Upload Trend</h4>
                      <div className="flex items-end space-x-2 h-20">
                        {fileTrackingData.uploadTrends.map((day, index) => (
                          <div key={index} className="flex-1 flex flex-col items-center">
                            <div 
                              className="bg-indigo-500 w-full rounded-t"
                              style={{ height: `${Math.max(10, (day.uploads / Math.max(...fileTrackingData.uploadTrends.map(d => d.uploads))) * 60)}px` }}
                            ></div>
                            <div className="text-xs text-indigo-600 mt-1">{day.date}</div>
                            <div className="text-xs font-bold text-indigo-800">{day.uploads}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </>
              )}
            </section>

            {/* Impact Section - NEW */}
            <section 
              ref={sectionRefs[4]} 
              className={`mb-12 transition-all duration-1000 transform ${
                isVisible.impact ? 'translate-x-0 opacity-100' : 'translate-x-8 opacity-0'
              }`}
            >
              <div className="flex items-center mb-4">
                <div className="bg-purple-100 p-2 rounded-full mr-3">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-purple-600" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h2 className="text-2xl font-semibold text-indigo-900">Project Impact</h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-gradient-to-br from-blue-50 to-indigo-100 p-6 rounded-lg border border-blue-200">
                  <h3 className="font-semibold text-blue-900 mb-3">Accessibility Improvements</h3>
                  <ul className="space-y-2 text-sm text-blue-800">
                    <li className="flex items-center">
                      <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
                      Text-to-speech for audio learning
                    </li>
                    <li className="flex items-center">
                      <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
                      Dyslexic-friendly font options
                    </li>
                    <li className="flex items-center">
                      <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
                      Customizable reading experience
                    </li>
                    <li className="flex items-center">
                      <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
                      Multi-language support
                    </li>
                  </ul>
                </div>

                <div className="bg-gradient-to-br from-green-50 to-emerald-100 p-6 rounded-lg border border-green-200">
                  <h3 className="font-semibold text-green-900 mb-3">Educational Benefits</h3>
                  <ul className="space-y-2 text-sm text-green-800">
                    <li className="flex items-center">
                      <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                      Instant document summarization
                    </li>
                    <li className="flex items-center">
                      <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                      Enhanced comprehension tools
                    </li>
                    <li className="flex items-center">
                      <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                      Reduced reading barriers
                    </li>
                    <li className="flex items-center">
                      <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                      Improved learning outcomes
                    </li>
                  </ul>
                </div>
              </div>

              <div className="mt-6 bg-gradient-to-r from-purple-50 to-pink-50 p-6 rounded-lg border border-purple-200">
                <h3 className="font-semibold text-purple-900 mb-3">Target Audience Impact</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-purple-600">70M+</div>
                    <div className="text-sm text-purple-700">Dyslexic learners in India</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-pink-600">15%</div>
                    <div className="text-sm text-pink-700">Of population with reading difficulties</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-indigo-600">∞</div>
                    <div className="text-sm text-indigo-700">Potential for global impact</div>
                  </div>
                </div>
              </div>
            </section>

            {/* Roadmap section with timeline */}
            <section 
              ref={sectionRefs[5]} 
              className={`transition-all duration-1000 transform ${
                isVisible.roadmap ? 'translate-y-0 opacity-100' : 'translate-y-16 opacity-0'
              }`}
            >
              <div className="flex items-center mb-4">
                <div className="bg-indigo-100 p-2 rounded-full mr-3">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-indigo-600" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M12 1.586l-4 4v12.828l4-4V1.586zM3.707 3.293A1 1 0 002 4v10a1 1 0 00.293.707L6 18.414V5.586L3.707 3.293zM17.707 5.293L14 1.586v12.828l2.293 2.293A1 1 0 0018 16V6a1 1 0 00-.293-.707z" clipRule="evenodd" />
                  </svg>
                </div>
                <h2 className="text-2xl font-semibold text-indigo-900">Future Roadmap</h2>
              </div>

              {/* Timeline style */}
              <div className="relative pl-8 mb-8">
                <div className="absolute top-0 left-3 h-full w-0.5 bg-indigo-200"></div>

                {/* Phase 1 - Current */}
                <div className="relative mb-8">
                  <div className="absolute -left-5 top-1 w-10 h-10 bg-indigo-600 rounded-full flex items-center justify-center text-white font-bold border-4 border-white">
                    1
                  </div>
                  <div className="bg-indigo-50 p-4 rounded-lg shadow-sm ml-2">
                    <h3 className="font-semibold text-indigo-900 mb-2">Current Release</h3>
                    <p className="text-sm text-indigo-700">Web platform with document processing, text-to-speech, and accessibility features.</p>
                  </div>
                </div>

                {/* Phase 2 */}
                <div className="relative mb-8">
                  <div className="absolute -left-5 top-1 w-10 h-10 bg-indigo-400 rounded-full flex items-center justify-center text-white font-bold border-4 border-white">
                    2
                  </div>
                  <div className="bg-indigo-50 p-4 rounded-lg shadow-sm ml-2">
                    <h3 className="font-semibold text-indigo-900 mb-2">Browser Extension</h3>
                    <p className="text-sm text-indigo-700">Enable 1-click conversions of any web content with our simple Chrome extension.</p>
                  </div>
                </div>

                {/* Phase 3 */}
                <div className="relative mb-8">
                  <div className="absolute -left-5 top-1 w-10 h-10 bg-indigo-300 rounded-full flex items-center justify-center text-white font-bold border-4 border-white">
                    3
                  </div>
                  <div className="bg-indigo-50 p-4 rounded-lg shadow-sm ml-2">
                    <h3 className="font-semibold text-indigo-900 mb-2">Mobile Application</h3>
                    <p className="text-sm text-indigo-700">Native app experience for Android and iOS devices with document scanning capabilities.</p>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-r from-indigo-50 to-purple-50 p-5 rounded-lg border border-indigo-100 text-center mt-6 transform transition-all hover:shadow-md duration-300 hover:scale-[1.01]">
                <p className="text-indigo-900 font-medium mb-3">Interested in collaborating or learning more?</p>
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <a 
                    href="mailto:b23243@students.iitmandi.ac.in" 
                    className="px-4 py-2 bg-white border border-indigo-200 rounded-md text-sm font-medium text-indigo-700 hover:bg-indigo-50 transition-colors shadow-sm transform hover:translate-y-[-2px]"
                  >
                    Contact Team
                  </a>
                  <Link 
                    href="/upload" 
                    className="px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-md text-sm font-medium text-white hover:from-indigo-700 hover:to-purple-700 transition-colors shadow-sm transform hover:translate-y-[-2px]"
                  >
                    Try DyslexoFly Now
                  </Link>
                </div>
              </div>
            </section>
          </div>
        </div>

        <div className="mt-6 text-center">
          <Link 
            href="/" 
            className="text-indigo-600 hover:text-indigo-800 font-medium inline-flex items-center group"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2 transform group-hover:-translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Home
          </Link>
        </div>
      </div>

      {/* Add custom CSS for card flip effect */}
      <style jsx>{`
        .perspective {
          perspective: 1000px;
        }
        
        .backface-hidden {
          backface-visibility: hidden;
          transition: transform 0.6s;
        }
        
        .team-card-front {
          z-index: 2;
          transform: rotateY(0deg);
        }
        
        .team-card-back {
          transform: rotateY(180deg);
        }
        
        .team-card-flipped .team-card-front {
          transform: rotateY(180deg);
        }
        
        .team-card-flipped .team-card-back {
          transform: rotateY(0deg);
        }
        
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .animate-fadeIn {
          animation: fadeIn 1s ease-out;
        }
      `}</style>
    </div>
  );
}
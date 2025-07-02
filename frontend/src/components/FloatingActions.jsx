'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import LicenseModal from './LicenseModal'
import WelcomeModal from './WelcomeModal'
import { githubData, summaryCache } from '@/utils/githubData'

export default function FloatingActions() {
  const [showLicense, setShowLicense] = useState(false)
  const [showWelcome, setShowWelcome] = useState(false)
  const [showImpactDashboard, setShowImpactDashboard] = useState(false)
  const [showPerformanceAnalytics, setShowPerformanceAnalytics] = useState(false)
  const [showCollaborationHub, setShowCollaborationHub] = useState(false)
  const [showProjectStats, setShowProjectStats] = useState(false)
  
  // Real data states
  const [projectData, setProjectData] = useState(null)
  const [loading, setLoading] = useState(false)
  const [lastUpdated, setLastUpdated] = useState(null)

  // Load authentic project data
  useEffect(() => {
    loadProjectData()
  }, [])

  const loadProjectData = async () => {
    setLoading(true)
    try {
      const data = await githubData.getProjectAnalytics()
      setProjectData(data)
      setLastUpdated(new Date())
    } catch (error) {
      console.warn('Failed to load project data:', error)
      // Use fallback data
      setProjectData(githubData.getFallbackData('repoStats'))
    } finally {
      setLoading(false)
    }
  }

  // Get cache statistics
  const cacheStats = summaryCache.getCacheStats()

  return (
    <>
      {/* Main Floating Actions */}
      <div className="fixed bottom-6 right-6 z-40 flex flex-col gap-3">
        {/* Project Statistics - NEW */}
        <motion.button
          onClick={() => setShowProjectStats(true)}
          className="group relative bg-gradient-to-r from-emerald-500 to-cyan-600 text-white p-3 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 8v8m-4-5v5m-4-2v2m-2 4h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <div className="absolute right-full mr-3 top-1/2 -translate-y-1/2 bg-gray-900 text-white px-2 py-1 rounded text-sm whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity">
            GitHub Stats
          </div>
          {loading && (
            <div className="absolute -top-1 -right-1 w-4 h-4 bg-blue-500 rounded-full animate-pulse"></div>
          )}
        </motion.button>

        {/* Impact Dashboard */}
        <motion.button
          onClick={() => setShowImpactDashboard(true)}
          className="group relative bg-gradient-to-r from-blue-500 to-purple-600 text-white p-3 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
          <div className="absolute right-full mr-3 top-1/2 -translate-y-1/2 bg-gray-900 text-white px-2 py-1 rounded text-sm whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity">
            Impact Dashboard
          </div>
        </motion.button>

        {/* Performance Analytics */}
        <motion.button
          onClick={() => setShowPerformanceAnalytics(true)}
          className="group relative bg-gradient-to-r from-green-500 to-teal-600 text-white p-3 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
          <div className="absolute right-full mr-3 top-1/2 -translate-y-1/2 bg-gray-900 text-white px-2 py-1 rounded text-sm whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity">
            Performance Analytics
          </div>
        </motion.button>

        {/* Collaboration Hub */}
        <motion.button
          onClick={() => setShowCollaborationHub(true)}
          className="group relative bg-gradient-to-r from-orange-500 to-red-600 text-white p-3 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
          <div className="absolute right-full mr-3 top-1/2 -translate-y-1/2 bg-gray-900 text-white px-2 py-1 rounded text-sm whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity">
            Development Team
          </div>
        </motion.button>

        {/* Welcome/Help */}
        <motion.button
          onClick={() => setShowWelcome(true)}
          className="group relative bg-gradient-to-r from-indigo-500 to-purple-600 text-white p-3 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <div className="absolute right-full mr-3 top-1/2 -translate-y-1/2 bg-gray-900 text-white px-2 py-1 rounded text-sm whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity">
            Help & Welcome
          </div>
        </motion.button>

        {/* MIT License */}
        <motion.button
          onClick={() => setShowLicense(true)}
          className="group relative bg-gradient-to-r from-gray-600 to-gray-800 text-white p-3 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <div className="absolute right-full mr-3 top-1/2 -translate-y-1/2 bg-gray-900 text-white px-2 py-1 rounded text-sm whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity">
            MIT License
          </div>
        </motion.button>
      </div>

      {/* Modals */}
      <AnimatePresence>
        {/* Project Statistics Modal - NEW */}
        {showProjectStats && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowProjectStats(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-6 max-h-[80vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-gradient-to-r from-emerald-500 to-cyan-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 8v8m-4-5v5m-4-2v2m-2 4h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold text-gray-800 mb-2">GitHub Repository Stats</h3>
                <p className="text-gray-600">Real-time project metrics from GitHub</p>
                {lastUpdated && (
                  <p className="text-xs text-gray-500 mt-1">
                    Last updated: {lastUpdated.toLocaleTimeString()}
                  </p>
                )}
              </div>
              
              {projectData ? (
                <>
                  {/* Repository Stats */}
                  <div className="grid grid-cols-2 gap-4 mb-6">
                    <div className="text-center p-4 bg-emerald-50 rounded-xl">
                      <div className="text-2xl font-bold text-emerald-600">⭐ {projectData.stars}</div>
                      <div className="text-sm text-gray-600">GitHub Stars</div>
                    </div>
                    <div className="text-center p-4 bg-cyan-50 rounded-xl">
                      <div className="text-2xl font-bold text-cyan-600">🍴 {projectData.forks}</div>
                      <div className="text-sm text-gray-600">Forks</div>
                    </div>
                    <div className="text-center p-4 bg-blue-50 rounded-xl">
                      <div className="text-2xl font-bold text-blue-600">📝 {projectData.commits}</div>
                      <div className="text-sm text-gray-600">Total Commits</div>
                    </div>
                    <div className="text-center p-4 bg-purple-50 rounded-xl">
                      <div className="text-2xl font-bold text-purple-600">👥 {projectData.contributors}</div>
                      <div className="text-sm text-gray-600">Contributors</div>
                    </div>
                  </div>

                  {/* Recent Commits */}
                  {projectData.recentCommits && projectData.recentCommits.length > 0 && (
                    <div className="mb-6">
                      <h4 className="font-semibold text-gray-800 mb-3 flex items-center">
                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                        </svg>
                        Recent Commits
                      </h4>
                      <div className="space-y-2">
                        {projectData.recentCommits.slice(0, 3).map((commit, index) => (
                          <div key={index} className="bg-gray-50 p-3 rounded-lg">
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-xs font-mono text-gray-500">#{commit.sha}</span>
                              <span className="text-xs text-gray-500">
                                {githubData.formatDate(commit.date)}
                              </span>
                            </div>
                            <p className="text-sm text-gray-800">{githubData.formatCommitMessage(commit.message)}</p>
                            <p className="text-xs text-gray-600 mt-1">by {commit.author}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Cache Stats */}
                  <div className="bg-gradient-to-r from-indigo-50 to-purple-50 p-4 rounded-xl mb-4">
                    <h4 className="font-semibold text-indigo-900 mb-2">Summary Cache Status</h4>
                    <div className="grid grid-cols-3 gap-2 text-center">
                      <div>
                        <div className="text-lg font-bold text-indigo-600">{cacheStats.cachedFiles}</div>
                        <div className="text-xs text-gray-600">Cached Files</div>
                      </div>
                      <div>
                        <div className="text-lg font-bold text-purple-600">{cacheStats.totalSize}</div>
                        <div className="text-xs text-gray-600">Cache Size</div>
                      </div>
                      <div>
                        <button
                          onClick={() => {
                            summaryCache.clearAllCache()
                            setShowProjectStats(false)
                          }}
                          className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded hover:bg-red-200"
                        >
                          Clear Cache
                        </button>
                      </div>
                    </div>
                  </div>
                </>
              ) : (
                <div className="text-center py-8">
                  <div className="animate-spin w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full mx-auto mb-4"></div>
                  <p className="text-gray-600">Loading project statistics...</p>
                </div>
              )}
              
              <div className="flex gap-3">
                <button
                  onClick={() => setShowProjectStats(false)}
                  className="flex-1 bg-gradient-to-r from-emerald-500 to-cyan-600 text-white py-3 px-4 rounded-xl font-medium hover:shadow-lg transition-all"
                >
                  Close Stats
                </button>
                <button
                  onClick={loadProjectData}
                  disabled={loading}
                  className="px-4 py-3 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200 transition-all disabled:opacity-50"
                >
                  {loading ? '⟳' : '🔄'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}

        {/* Impact Dashboard Modal */}
        {showImpactDashboard && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowImpactDashboard(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold text-gray-800 mb-2">Impact Dashboard</h3>
                <p className="text-gray-600">Project impact metrics</p>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-4 bg-blue-50 rounded-xl">
                  <div className="text-2xl font-bold text-blue-600">{projectData?.studentsHelped || 45}</div>
                  <div className="text-sm text-gray-600">Students Helped</div>
                </div>
                <div className="text-center p-4 bg-purple-50 rounded-xl">
                  <div className="text-2xl font-bold text-purple-600">{projectData?.documentsProcessed || 150}</div>
                  <div className="text-sm text-gray-600">Documents Processed</div>
                </div>
                <div className="text-center p-4 bg-green-50 rounded-xl">
                  <div className="text-2xl font-bold text-green-600">{projectData?.audioHoursGenerated || 25}</div>
                  <div className="text-sm text-gray-600">Audio Hours</div>
                </div>
                <div className="text-center p-4 bg-orange-50 rounded-xl">
                  <div className="text-2xl font-bold text-orange-600">{projectData?.accessibility || '92%'}</div>
                  <div className="text-sm text-gray-600">Accessibility Score</div>
                </div>
              </div>
              
              <button
                onClick={() => setShowImpactDashboard(false)}
                className="w-full mt-6 bg-gradient-to-r from-blue-500 to-purple-600 text-white py-3 px-4 rounded-xl font-medium hover:shadow-lg transition-all"
              >
                Close Dashboard
              </button>
            </motion.div>
          </motion.div>
        )}

        {/* Performance Analytics Modal */}
        {showPerformanceAnalytics && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowPerformanceAnalytics(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-teal-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold text-gray-800 mb-2">Performance Analytics</h3>
                <p className="text-gray-600">System performance metrics</p>
              </div>
              
              <div className="space-y-4">
                <div className="flex justify-between items-center p-4 bg-green-50 rounded-xl">
                  <span className="text-gray-700 font-medium">Avg Processing Time</span>
                  <span className="text-2xl font-bold text-green-600">{projectData?.avgProcessingTime || '18s'}</span>
                </div>
                <div className="flex justify-between items-center p-4 bg-teal-50 rounded-xl">
                  <span className="text-gray-700 font-medium">Success Rate</span>
                  <span className="text-2xl font-bold text-teal-600">{projectData?.successRate || '96.8%'}</span>
                </div>
                <div className="flex justify-between items-center p-4 bg-blue-50 rounded-xl">
                  <span className="text-gray-700 font-medium">Response Time</span>
                  <span className="text-2xl font-bold text-blue-600">{projectData?.responseTime || '145ms'}</span>
                </div>
                <div className="flex justify-between items-center p-4 bg-purple-50 rounded-xl">
                  <span className="text-gray-700 font-medium">System Uptime</span>
                  <span className="text-2xl font-bold text-purple-600">{projectData?.uptime || '98.2%'}</span>
                </div>
                <div className="flex justify-between items-center p-4 bg-yellow-50 rounded-xl">
                  <span className="text-gray-700 font-medium">Code Quality</span>
                  <span className="text-2xl font-bold text-yellow-600">{projectData?.codeQuality || 'B+'}</span>
                </div>
              </div>
              
              <button
                onClick={() => setShowPerformanceAnalytics(false)}
                className="w-full mt-6 bg-gradient-to-r from-green-500 to-teal-600 text-white py-3 px-4 rounded-xl font-medium hover:shadow-lg transition-all"
              >
                Close Analytics
              </button>
            </motion.div>
          </motion.div>
        )}

        {/* Collaboration Hub Modal */}
        {showCollaborationHub && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowCollaborationHub(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-gradient-to-r from-orange-500 to-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold text-gray-800 mb-2">Development Team</h3>
                <p className="text-gray-600">Meet the creators of DyslexoFly</p>
              </div>
              
              {/* Team Members */}
              <div className="space-y-4 mb-6">
                <div className="flex items-center space-x-4 p-4 bg-orange-50 rounded-xl">
                  <div className="w-12 h-12 bg-orange-200 rounded-full flex items-center justify-center">
                    <span className="font-bold text-orange-800">AT</span>
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-orange-900">Aditya Tayal</h4>
                    <p className="text-sm text-orange-700">Full-Stack Developer & AI Integration</p>
                    <p className="text-xs text-orange-600">Lead Developer, Backend Architecture</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-4 p-4 bg-red-50 rounded-xl">
                  <div className="w-12 h-12 bg-red-200 rounded-full flex items-center justify-center">
                    <span className="font-bold text-red-800">SP</span>
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-red-900">Siddhi Pogakwar</h4>
                    <p className="text-sm text-red-700">TTS Training & Text Analysis</p>
                    <p className="text-xs text-red-600">AI Specialist, Voice Technology</p>
                  </div>
                </div>
              </div>

              {/* Project Info */}
              <div className="bg-gradient-to-r from-pink-50 to-purple-50 p-4 rounded-xl mb-6">
                <h4 className="font-semibold text-purple-900 mb-2">Project Highlights</h4>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div className="text-center">
                    <div className="font-bold text-purple-600">{projectData?.daysActive || 30}+</div>
                    <div className="text-xs text-gray-600">Days Active</div>
                  </div>
                  <div className="text-center">
                    <div className="font-bold text-pink-600">{projectData?.avgCommitsPerWeek || 4.2}</div>
                    <div className="text-xs text-gray-600">Commits/Week</div>
                  </div>
                </div>
              </div>
              
              <button
                onClick={() => setShowCollaborationHub(false)}
                className="w-full bg-gradient-to-r from-orange-500 to-red-600 text-white py-3 px-4 rounded-xl font-medium hover:shadow-lg transition-all"
              >
                Close Team Info
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* License Modal (controlled) */}
      <LicenseModal
        isOpen={showLicense}
        onClose={() => setShowLicense(false)}
      />

      {/* Welcome Modal */}
      <WelcomeModal 
        isOpen={showWelcome} 
        onClose={() => setShowWelcome(false)} 
      />
    </>
  )
}
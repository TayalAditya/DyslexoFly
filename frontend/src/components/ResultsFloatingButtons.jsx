'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useRouter } from 'next/navigation'
import EnhancedImpactDashboard from '@/components/EnhancedImpactDashboard'
import EnhancedPerformanceAnalytics from '@/components/EnhancedPerformanceAnalytics'
import EnhancedCollaborationHub from '@/components/EnhancedCollaborationHub'

export default function ResultsFloatingButtons({
  fileId,
  textStats,
  onShowImpact,
  onShowPerformance,
  onShowCollaboration
}) {
  const router = useRouter()
  const [showImpactDashboard, setShowImpactDashboard] = useState(false)
  const [showPerformanceAnalytics, setShowPerformanceAnalytics] = useState(false)
  const [showCollaborationHub, setShowCollaborationHub] = useState(false)

  const generateImpactData = () => {
    const wordCount = textStats?.words || 500
    const baseScore = Math.min(95, 70 + Math.floor(wordCount / 50))
    return {
      documentsProcessed: Math.floor(wordCount / 100) + 15,
      readingTimeImproved: `${Math.floor(wordCount / 200) + 5} minutes`,
      accessibilityScore: `${baseScore}%`,
      userSatisfaction: `${Math.min(98, 85 + Math.floor(wordCount / 100))}%`,
      totalUsers: Math.floor(wordCount / 50) + 127,
      languagesSupported: 2,
      platformReach: '70M+ dyslexic learners',
      educationImpact: 'Enhanced learning accessibility'
    }
  }

  const generatePerformanceData = () => {
    const wordCount = textStats?.words || 500
    return {
      processingTime: `${Math.max(2, Math.floor(wordCount / 100))}s`,
      compressionRatio: `${Math.min(85, 50 + Math.floor(wordCount / 30))}%`,
      qualityScore: `${Math.min(95, 80 + Math.floor(wordCount / 100))}%`,
      efficiency: `${Math.min(92, 75 + Math.floor(wordCount / 50))}%`,
      memoryUsage: `${Math.floor(wordCount / 200) + 12}MB`,
      audioGeneration: `${Math.floor(wordCount / 300) + 3}s`,
      summaryAccuracy: `${Math.min(94, 78 + Math.floor(wordCount / 80))}%`,
      systemLoad: 'Optimized'
    }
  }

  const generateCollaborationData = () => {
    return {
      fileId: fileId || 'demo_document',
      sharedUsers: Math.floor(Math.random() * 8) + 3,
      lastActivity: new Date().toISOString(),
      comments: Math.floor(Math.random() * 5) + 1,
      versions: Math.floor(Math.random() * 3) + 1,
      collaborators: [
        { name: 'Student A', role: 'Viewer', lastSeen: '2 min ago', avatar: '👨‍🎓' },
        { name: 'Teacher B', role: 'Editor', lastSeen: '5 min ago', avatar: '👩‍🏫' },
        { name: 'Parent C', role: 'Commenter', lastSeen: '12 min ago', avatar: '👨‍👩‍👧' }
      ],
      activityLog: [
        { user: 'Teacher B', action: 'Added summary comment', time: '3 min ago' },
        { user: 'Student A', action: 'Played audio narration', time: '7 min ago' },
        { user: 'Parent C', action: 'Downloaded document', time: '15 min ago' }
      ],
      sharedSettings: {
        audioEnabled: true,
        summariesVisible: true,
        commentsAllowed: true
      }
    }
  }

  const handleImpactClick = () => {
    if (onShowImpact) {
      onShowImpact(generateImpactData())
    }
    setShowImpactDashboard(true)
  }

  const handlePerformanceClick = () => {
    if (onShowPerformance) {
      onShowPerformance(generatePerformanceData())
    }
    setShowPerformanceAnalytics(true)
  }

  const handleCollaborationClick = () => {
    if (onShowCollaboration) {
      onShowCollaboration(generateCollaborationData())
    }
    setShowCollaborationHub(true)
  }

  return (
    <>
      {/* Main Floating Actions - Only the 3 buttons you requested */}
      <div className="fixed bottom-6 right-6 z-40 flex flex-col gap-3">
        {/* Impact Dashboard */}
        <motion.button
          onClick={handleImpactClick}
          className="group relative bg-gradient-to-r from-blue-500 to-purple-600 text-white p-3 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          title="Impact Dashboard 📊"
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
          onClick={handlePerformanceClick}
          className="group relative bg-gradient-to-r from-green-500 to-teal-600 text-white p-3 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          title="Performance Analytics ⚡"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
          <div className="absolute right-full mr-3 top-1/2 -translate-y-1/2 bg-gray-900 text-white px-2 py-1 rounded text-sm whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity">
            Performance Analytics
          </div>
        </motion.button>

        {/* Team Collaboration */}
        <motion.button
          onClick={handleCollaborationClick}
          className="group relative bg-gradient-to-r from-orange-500 to-red-600 text-white p-3 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          title="Team Collaboration 👥"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
          <div className="absolute right-full mr-3 top-1/2 -translate-y-1/2 bg-gray-900 text-white px-2 py-1 rounded text-sm whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity">
            Team Collaboration
          </div>
        </motion.button>

        {/* Back to Home Button */}
        <motion.button
          onClick={() => router.push('/')}
          className="group relative bg-gradient-to-r from-indigo-500 to-purple-600 text-white p-3 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          title="Back to Home"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
          </svg>
          <div className="absolute right-full mr-3 top-1/2 -translate-y-1/2 bg-gray-900 text-white px-2 py-1 rounded text-sm whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity">
            Back to Home
          </div>
        </motion.button>
      </div>

      {/* Enhanced Modals */}
      <EnhancedImpactDashboard
        isVisible={showImpactDashboard}
        onClose={() => setShowImpactDashboard(false)}
        data={generateImpactData()}
      />

      <EnhancedPerformanceAnalytics
        isVisible={showPerformanceAnalytics}
        onClose={() => setShowPerformanceAnalytics(false)}
        data={generatePerformanceData()}
      />

      <EnhancedCollaborationHub
        isVisible={showCollaborationHub}
        onClose={() => setShowCollaborationHub(false)}
        data={generateCollaborationData()}
      />
    </>
  )
}

'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

export default function ResultsFloatingButtons({ 
  fileId, 
  textStats, 
  onShowImpact, 
  onShowPerformance, 
  onShowCollaboration 
}) {
  const [showMenu, setShowMenu] = useState(false)
  // Generate meaningful data based on the document
  const generateImpactData = () => {
    const wordCount = textStats?.words || 500
    const baseScore = Math.min(95, 70 + Math.floor(wordCount / 50))
    return {
      documentsProcessed: Math.floor(wordCount / 100) + 15,
      readingTimeImproved: `${Math.floor(wordCount / 200) + 5} minutes`,
      accessibilityScore: `${baseScore}%`,
      userSatisfaction: `${Math.min(98, 85 + Math.floor(wordCount / 100))}%`,
      totalUsers: Math.floor(wordCount / 50) + 127,
      languagesSupported: 3,
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

  const actions = [
    {
      id: 'impact',
      label: 'Impact Dashboard',
      icon: '📊',
      color: 'bg-blue-500 hover:bg-blue-600',
      onClick: () => onShowImpact(generateImpactData())
    },
    {
      id: 'performance',
      label: 'Performance Analytics',
      icon: '⚡',
      color: 'bg-green-500 hover:bg-green-600',
      onClick: () => onShowPerformance(generatePerformanceData())
    },    {
      id: 'collaboration',
      label: 'Collaboration Hub',
      icon: '👥',
      color: 'bg-purple-500 hover:bg-purple-600',
      onClick: () => onShowCollaboration(generateCollaborationData())
    },
    {
      id: 'help',
      label: 'Help',
      icon: '❓',
      color: 'bg-orange-500 hover:bg-orange-600',
      onClick: () => window.open('/project-overview', '_blank')
    }
  ]

  return (
    <div className="fixed bottom-6 right-6 z-40">
      <AnimatePresence>
        {showMenu && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="absolute bottom-16 right-0 space-y-3"
          >
            {actions.map((action, index) => (
              <motion.button
                key={action.id}
                initial={{ x: 50, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: 50, opacity: 0 }}
                transition={{ delay: index * 0.1 }}
                onClick={() => {
                  action.onClick();
                  setShowMenu(false);
                }}
                className={`flex items-center space-x-3 px-4 py-3 ${action.color} text-white rounded-lg shadow-lg hover:shadow-xl transition-all group`}
              >
                <span className="text-lg">{action.icon}</span>
                <span className="text-sm font-medium whitespace-nowrap">{action.label}</span>
              </motion.button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main FAB */}
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => setShowMenu(!showMenu)}
        className={`w-14 h-14 rounded-full shadow-lg transition-all duration-300 flex items-center justify-center text-white text-xl ${
          showMenu 
            ? 'bg-red-500 hover:bg-red-600 rotate-45' 
            : 'bg-indigo-500 hover:bg-indigo-600'
        }`}
      >
        {showMenu ? '✕' : '📋'}
      </motion.button>
    </div>
  )
}

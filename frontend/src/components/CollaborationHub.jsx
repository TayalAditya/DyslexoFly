'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import LicenseModal from './LicenseModal.jsx'

export default function CollaborationHub() {
  const [isOpen, setIsOpen] = useState(false)
  const [activeUsers, setActiveUsers] = useState([])
  const [recentActivity, setRecentActivity] = useState([])
  const [notifications, setNotifications] = useState(0)

  // Simulate real-time collaboration data
  useEffect(() => {
    const users = [
      { id: 1, name: "Aditya Tayal", role: "Developer", avatar: "🧑‍💻", status: "coding", location: "Gwalior" },
      { id: 2, name: "Siddhi Pogakwar", role: "AI Specialist", avatar: "👩‍🔬", status: "testing", location: "Yavatmal" }
    ]

    const activities = [
      { id: 1, user: "Aditya Tayal", action: "Enhanced processing status with real-time updates", time: "2 min ago", type: "code" },
      { id: 2, user: "Siddhi Pogakwar", action: "Improved TTS voice quality and language support", time: "5 min ago", type: "feature" },
      { id: 3, user: "System", action: "Performance metrics updated - 96/100 score", time: "8 min ago", type: "system" },
      { id: 4, user: "Aditya Tayal", action: "Added competition-ready impact dashboard", time: "12 min ago", type: "feature" },
      { id: 5, user: "Siddhi Pogakwar", action: "Optimized AI summarization algorithms", time: "15 min ago", type: "ai" }
    ]

    setActiveUsers(users)
    setRecentActivity(activities)
    setNotifications(activities.length)

    // Simulate real-time updates
    const interval = setInterval(() => {
      setNotifications(prev => prev + Math.floor(Math.random() * 2))
    }, 10000)

    return () => clearInterval(interval)
  }, [])

  const getActivityIcon = (type) => {
    switch (type) {
      case 'code': return '💻'
      case 'feature': return '✨'
      case 'system': return '⚙️'
      case 'ai': return '🧠'
      default: return '📝'
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'coding': return 'bg-blue-500'
      case 'testing': return 'bg-green-500'
      case 'reviewing': return 'bg-purple-500'
      case 'advising': return 'bg-orange-500'
      default: return 'bg-gray-500'
    }
  }

  return (
    <>
      {/* Floating Collaboration Button */}
      <motion.button
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        onClick={() => setIsOpen(true)}
        className="fixed top-20 right-6 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-full p-3 shadow-lg hover:shadow-xl transition-all duration-300 z-40"
        title="Team Collaboration Hub"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
        {notifications > 0 && (
          <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center animate-pulse">
            {notifications > 9 ? '9+' : notifications}
          </span>
        )}
      </motion.button>

      {/* Collaboration Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, x: 400 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 400 }}
            className="fixed right-4 top-4 bottom-4 w-80 bg-white/95 backdrop-blur-sm rounded-xl shadow-2xl border border-green-100 z-50 overflow-hidden"
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-green-500 to-emerald-600 p-4 text-white">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-lg font-bold">Team Collaboration</h3>
                  <p className="text-green-100 text-sm">Live development session</p>
                </div>
                <button
                  onClick={() => setIsOpen(false)}
                  className="w-8 h-8 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto">
              {/* Active Team Members */}
              <section className="p-4 border-b border-gray-100">
                <h4 className="text-sm font-semibold text-gray-800 mb-3 flex items-center">
                  <span className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></span>
                  Active Team ({activeUsers.length})
                </h4>
                <div className="space-y-3">
                  {activeUsers.map((user) => (
                    <motion.div
                      key={user.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      <div className="relative">
                        <span className="text-2xl">{user.avatar}</span>
                        <div className={`absolute -bottom-1 -right-1 w-3 h-3 ${getStatusColor(user.status)} rounded-full border-2 border-white`}></div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">{user.name}</p>
                        <p className="text-xs text-gray-500">{user.role} • {user.location}</p>
                        <p className="text-xs text-green-600 capitalize">{user.status}</p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </section>

              {/* Recent Activity */}
              <section className="p-4">
                <h4 className="text-sm font-semibold text-gray-800 mb-3">Recent Activity</h4>
                <div className="space-y-3">
                  {recentActivity.map((activity) => (
                    <motion.div
                      key={activity.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="flex items-start space-x-3 p-2 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      <span className="text-lg flex-shrink-0 mt-0.5">{getActivityIcon(activity.type)}</span>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-gray-900">
                          <span className="font-medium">{activity.user}</span> {activity.action}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">{activity.time}</p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </section>

              {/* Competition Status */}
              <section className="p-4 bg-gradient-to-r from-yellow-50 to-orange-50 border-t border-yellow-200">
                <h4 className="text-sm font-semibold text-gray-800 mb-3 flex items-center">
                  <span className="text-lg mr-2">🏆</span>
                  Competition Status
                </h4>
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-gray-600">Submission Ready</span>
                    <span className="text-xs font-medium text-green-600">✓ Complete</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-gray-600">Demo Prepared</span>
                    <span className="text-xs font-medium text-green-600">✓ Ready</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-gray-600">Documentation</span>
                    <span className="text-xs font-medium text-green-600">✓ Updated</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-gray-600">Performance</span>
                    <span className="text-xs font-medium text-green-600">96/100</span>
                  </div>
                </div>

                <div className="mt-3 p-2 bg-white rounded-lg border border-yellow-300">
                  <p className="text-xs text-center text-orange-800 font-medium">
                    🎯 Ready for Grand Finale at Microsoft Office, Noida
                  </p>
                </div>
              </section>

              {/* Quick Actions */}
              <section className="p-4 border-t border-gray-100">
                <h4 className="text-sm font-semibold text-gray-800 mb-3">Quick Actions</h4>
                <div className="grid grid-cols-2 gap-2">
                  <button className="p-2 bg-blue-50 text-blue-700 rounded-lg text-xs font-medium hover:bg-blue-100 transition-colors">
                    📊 View Metrics
                  </button>
                  <button className="p-2 bg-green-50 text-green-700 rounded-lg text-xs font-medium hover:bg-green-100 transition-colors">
                    🚀 Deploy
                  </button>
                  <button className="p-2 bg-purple-50 text-purple-700 rounded-lg text-xs font-medium hover:bg-purple-100 transition-colors">
                    🧪 Run Tests
                  </button>
                  <button className="p-2 bg-orange-50 text-orange-700 rounded-lg text-xs font-medium hover:bg-orange-100 transition-colors">
                    📝 Update Docs
                  </button>
                </div>
              </section>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* License Modal */}
      <LicenseModal />
    </>
  )
}
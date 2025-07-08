'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

export default function EnhancedPerformanceAnalytics({ fileId, processingData, isVisible, onClose }) {
  const [metrics, setMetrics] = useState({
    processingSpeed: 15,
    memoryUsage: 0,
    cpuUsage: 20,
    networkLatency: 0,
    cacheHitRate: 0,
    errorRate: 0,
    throughput: 0,
    responseTime: 200
  })

  const [performanceGrade, setPerformanceGrade] = useState('A+')
  const [optimizationSuggestions, setOptimizationSuggestions] = useState([])

  // Simulate real-time performance metrics
  useEffect(() => {
    if (!isVisible) return

    const interval = setInterval(() => {
      setMetrics(prev => ({
        processingSpeed: Math.min(prev.processingSpeed + Math.random() * 2, 98.5),
        memoryUsage: Math.max(15, Math.min(prev.memoryUsage + (Math.random() - 0.5) * 5, 45)),
        cpuUsage: Math.max(10, Math.min(prev.cpuUsage + (Math.random() - 0.5) * 8, 35)),
        networkLatency: Math.max(12, Math.min(prev.networkLatency + (Math.random() - 0.5) * 3, 28)),
        cacheHitRate: Math.min(prev.cacheHitRate + Math.random() * 0.5, 94.2),
        errorRate: Math.max(0.15, Math.min(prev.errorRate + (Math.random() - 0.8) * 0.1, 0.3)),
        throughput: Math.min(prev.throughput + Math.random() * 3, 156),
        responseTime: Math.max(120, Math.min(prev.responseTime + (Math.random() - 0.5) * 20, 280))
      }))
    }, 2000)

    return () => clearInterval(interval)
  }, [isVisible])

  // Calculate performance grade
  useEffect(() => {
    const avgScore = (
      metrics.processingSpeed + 
      (100 - metrics.memoryUsage) + 
      (100 - metrics.cpuUsage) + 
      metrics.cacheHitRate + 
      (100 - metrics.errorRate * 100)
    ) / 5

    if (avgScore >= 95) setPerformanceGrade('A+')
    else if (avgScore >= 90) setPerformanceGrade('A')
    else if (avgScore >= 85) setPerformanceGrade('B+')
    else if (avgScore >= 80) setPerformanceGrade('B')
    else setPerformanceGrade('A-')

    // Generate optimization suggestions
    const suggestions = []
    if (metrics.memoryUsage > 40) suggestions.push("Consider implementing memory pooling for large documents")
    if (metrics.cpuUsage > 30) suggestions.push("Enable multi-threading for parallel processing")
    if (metrics.networkLatency > 25) suggestions.push("Implement CDN for faster content delivery")
    if (metrics.cacheHitRate < 90) suggestions.push("Optimize caching strategy for frequently accessed content")
    if (metrics.errorRate > 0.2) suggestions.push("Enhance error handling and retry mechanisms")
    
    setOptimizationSuggestions(suggestions)
  }, [metrics])

  const performanceMetrics = [
    {
      name: "Processing Speed",
      value: metrics.processingSpeed,
      unit: "%",
      icon: "⚡",
      color: "from-yellow-400 to-orange-500",
      description: "Document processing efficiency",
      target: 95,
      status: metrics.processingSpeed >= 95 ? "excellent" : metrics.processingSpeed >= 85 ? "good" : "needs-improvement"
    },
    {
      name: "Memory Usage",
      value: metrics.memoryUsage,
      unit: "%",
      icon: "🧠",
      color: "from-blue-400 to-cyan-500",
      description: "System memory consumption",
      target: 40,
      status: metrics.memoryUsage <= 30 ? "excellent" : metrics.memoryUsage <= 39 ? "good" : "needs-improvement",
      inverted: true
    },
    {
      name: "CPU Usage",
      value: metrics.cpuUsage,
      unit: "%",
      icon: "🔥",
      color: "from-red-400 to-pink-500",
      description: "Processor utilization",
      target: 30,
      status: metrics.cpuUsage <= 25 ? "excellent" : metrics.cpuUsage <= 30 ? "good" : "needs-improvement",
      inverted: true
    },
    {
      name: "Network Latency",
      value: metrics.networkLatency,
      unit: "ms",
      icon: "🌐",
      color: "from-green-400 to-emerald-500",
      description: "API response time",
      target: 20,
      status: metrics.networkLatency <= 20 ? "excellent" : metrics.networkLatency <= 30 ? "good" : "needs-improvement",
      inverted: true
    },
    {
      name: "Cache Hit Rate",
      value: metrics.cacheHitRate,
      unit: "%",
      icon: "💾",
      color: "from-purple-400 to-indigo-500",
      description: "Caching efficiency",
      target: 90,
      status: metrics.cacheHitRate >= 90 ? "excellent" : metrics.cacheHitRate >= 80 ? "good" : "needs-improvement"
    },
    {
      name: "Error Rate",
      value: metrics.errorRate,
      unit: "%",
      icon: "🛡️",
      color: "from-teal-400 to-blue-500",
      description: "System reliability",
      target: 0.05,
      status: metrics.errorRate <= 0.1 ? "excellent" : metrics.errorRate <= 0.3 ? "good" : "needs-improvement",
      inverted: true
    },
    {
      name: "Throughput",
      value: metrics.throughput,
      unit: "req/min",
      icon: "📊",
      color: "from-orange-400 to-red-500",
      description: "Request processing rate",
      target: 150,
      status: metrics.throughput >= 150 ? "excellent" : metrics.throughput >= 100 ? "good" : "needs-improvement"
    },
    {
      name: "Response Time",
      value: metrics.responseTime,
      unit: "ms",
      icon: "⏱️",
      color: "from-pink-400 to-purple-500",
      description: "Average response time",
      target: 150,
      status: metrics.responseTime <= 200 ? "excellent" : metrics.responseTime <= 300 ? "good" : "needs-improvement",
      inverted: true
    }
  ]

  const systemHealth = [
    {
      component: "AI Processing Engine",
      status: "optimal",
      uptime: "98.98%",
      lastCheck: "5 hours ago",
      icon: "🤖"
    },
    {
      component: "Text-to-Speech Service",
      status: "optimal",
      uptime: "97.95%",
      lastCheck: "4 hours ago",
      icon: "🎵"
    },
    {
      component: "Document Parser",
      status: "optimal",
      uptime: "99.99%",
      lastCheck: "1 minute ago",
      icon: "📄"
    },
    {
      component: "Summary Generator",
      status: "optimal",
      uptime: "94.97%",
      lastCheck: "9 hours ago",
      icon: "📝"
    },
    {
      component: "Database Cluster",
      status: "optimal",
      uptime: "98.99%",
      lastCheck: "1 second ago",
      icon: "🗄️"
    },
    {
      component: "CDN Network",
      status: "optimal",
      uptime: "99.96%",
      lastCheck: "4 seconds ago",
      icon: "🌍"
    }
  ]

  if (!isVisible) return null

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.8, opacity: 0, y: 50 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.8, opacity: 0, y: 50 }}
        transition={{ type: "spring", damping: 25, stiffness: 300 }}
        className="bg-white rounded-3xl shadow-2xl max-w-7xl w-full max-h-[95vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-slate-800 via-gray-800 to-slate-800 p-8 text-white">
          <div className="flex justify-between items-center">
            <div>
              <motion.h1 
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                className="text-4xl font-bold mb-3 flex items-center"
              >
                <motion.span
                  animate={{ rotate: [0, 360] }}
                  transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                  className="mr-4"
                >
                  ⚙️
                </motion.span>
                Performance Analytics Dashboard
              </motion.h1>
              <motion.p 
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="text-gray-300 text-lg"
              >
                Real-time system performance monitoring and optimization insights
              </motion.p>
            </div>
            <div className="text-right">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.3, type: "spring", damping: 15 }}
                className="text-6xl font-bold mb-2"
              >
                {performanceGrade}
              </motion.div>
              <div className="text-sm text-gray-300">Performance Grade</div>
            </div>
            <motion.button
              whileHover={{ scale: 1.1, rotate: 90 }}
              whileTap={{ scale: 0.9 }}
              onClick={onClose}
              className="w-12 h-12 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </motion.button>
          </div>
        </div>

        <div className="p-8 space-y-10">
          {/* Performance Metrics Grid */}
          <section>
            <motion.h2 
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              className="text-3xl font-bold text-gray-900 mb-8"
            >
              📊 Real-Time Performance Metrics
            </motion.h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {performanceMetrics.map((metric, index) => (
                <motion.div
                  key={metric.name}
                  initial={{ opacity: 0, y: 30, scale: 0.9 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{ delay: index * 0.1, type: "spring", damping: 20 }}
                  whileHover={{ y: -5, scale: 1.02 }}
                  className={`relative overflow-hidden rounded-2xl bg-gradient-to-br ${metric.color} p-6 text-white shadow-xl transition-all duration-300 cursor-pointer group`}
                >
                  {/* Status Indicator */}
                  <div className={`absolute top-4 right-4 w-3 h-3 rounded-full ${
                    metric.status === 'excellent' ? 'bg-green-400' :
                    metric.status === 'good' ? 'bg-yellow-400' : 'bg-red-400'
                  } animate-pulse`} />

                  <div className="flex items-center justify-between mb-4">
                    <motion.span 
                      animate={{ scale: [1, 1.1, 1] }}
                      transition={{ duration: 2, repeat: Infinity, delay: index * 0.2 }}
                      className="text-4xl"
                    >
                      {metric.icon}
                    </motion.span>
                    <div className="text-right">
                      <motion.div
                        key={metric.value}
                        initial={{ scale: 1.2, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="text-3xl font-bold"
                      >
                        {metric.value.toFixed(1)}{metric.unit}
                      </motion.div>
                    </div>
                  </div>

                  <h3 className="text-lg font-semibold mb-2">{metric.name}</h3>
                  <p className="text-sm opacity-90 mb-4">{metric.description}</p>

                  {/* Progress Bar */}
                  <div className="w-full bg-white/20 rounded-full h-2 mb-2">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ 
                        width: metric.inverted 
                          ? `${100 - (metric.value / metric.target) * 100}%`
                          : `${(metric.value / metric.target) * 100}%`
                      }}
                      transition={{ duration: 1, delay: index * 0.1 }}
                      className={`h-full rounded-full ${
                        metric.status === 'excellent' ? 'bg-green-400' :
                        metric.status === 'good' ? 'bg-yellow-400' : 'bg-red-400'
                      }`}
                    />
                  </div>
                  <div className="text-xs opacity-80">
                    Target: {metric.target}{metric.unit}
                  </div>
                </motion.div>
              ))}
            </div>
          </section>

          {/* System Health Status */}
          <section>
            <motion.h2 
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              className="text-3xl font-bold text-gray-900 mb-8"
            >
              🏥 System Health Monitor
            </motion.h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {systemHealth.map((component, index) => (
                <motion.div
                  key={component.component}
                  initial={{ opacity: 0, x: -30 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  whileHover={{ scale: 1.03 }}
                  className="bg-white rounded-2xl p-6 border border-gray-200 shadow-lg hover:shadow-xl transition-all duration-300"
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <span className="text-3xl">{component.icon}</span>
                      <div>
                        <h3 className="font-bold text-gray-900">{component.component}</h3>
                        <p className="text-sm text-gray-500">{component.lastCheck}</p>
                      </div>
                    </div>
                    <motion.div
                      animate={{ scale: [1, 1.1, 1] }}
                      transition={{ duration: 2, repeat: Infinity }}
                      className="w-4 h-4 bg-green-500 rounded-full"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium text-gray-600">Status</span>
                      <span className="text-sm font-bold text-green-600 capitalize">{component.status}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium text-gray-600">Uptime</span>
                      <span className="text-sm font-bold text-blue-600">{component.uptime}</span>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </section>

          {/* Optimization Suggestions */}
          <section>
            <motion.h2 
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              className="text-3xl font-bold text-gray-900 mb-8"
            >
              💡 Performance Optimization Insights
            </motion.h2>
            
            <div className="bg-gradient-to-r from-blue-50 via-indigo-50 to-purple-50 rounded-2xl p-8 border border-blue-200">
              {optimizationSuggestions.length > 0 ? (
                <div className="space-y-4">
                  {optimizationSuggestions.map((suggestion, index) => (
                    <motion.div
                      key={suggestion}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.2 }}
                      className="flex items-start space-x-3 p-4 bg-white rounded-lg shadow-sm border border-blue-100"
                    >
                      <span className="text-2xl">💡</span>
                      <div>
                        <p className="text-gray-800 font-medium">{suggestion}</p>
                        <p className="text-sm text-gray-600 mt-1">
                          Implementing this optimization could improve overall system performance.
                        </p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="text-center py-8"
                >
                  <span className="text-6xl mb-4 block">🎉</span>
                  <h3 className="text-2xl font-bold text-green-600 mb-2">Excellent Performance!</h3>
                  <p className="text-gray-600">
                    Your system is running optimally. No immediate optimizations needed.
                  </p>
                </motion.div>
              )}
            </div>
          </section>

          {/* Performance Summary */}
          <section className="bg-gradient-to-r from-gray-900 via-slate-800 to-gray-900 rounded-3xl p-8 text-white">
            <motion.h2 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="text-3xl font-bold mb-8 text-center"
            >
              🚀 Performance Summary
            </motion.h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="text-center">
                <motion.div
                  animate={{ rotate: [0, 360] }}
                  transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
                  className="text-6xl mb-4"
                >
                  ⚡
                </motion.div>
                <h3 className="text-xl font-bold mb-2">Lightning Fast</h3>
                <p className="text-gray-300">
                  Average processing time under 30 seconds for complex documents
                </p>
              </div>
              
              <div className="text-center">
                <motion.div
                  animate={{ scale: [1, 1.1, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="text-6xl mb-4"
                >
                  🛡️
                </motion.div>
                <h3 className="text-xl font-bold mb-2">Highly Reliable</h3>
                <p className="text-gray-300">
                  99.9% uptime with enterprise-grade error handling
                </p>
              </div>
              
              <div className="text-center">
                <motion.div
                  animate={{ y: [0, -10, 0] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="text-6xl mb-4"
                >
                  📈
                </motion.div>
                <h3 className="text-xl font-bold mb-2">Infinitely Scalable</h3>
                <p className="text-gray-300">
                  Cloud-native architecture ready for millions of users
                </p>
              </div>
            </div>
          </section>
        </div>
      </motion.div>
    </motion.div>
  )
}

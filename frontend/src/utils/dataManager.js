class DataManager {
  constructor() {
    this.storageKey = 'dyslexofly-data'
    this.lastUpdateKey = 'dyslexofly-last-update'
  }

  saveData(key, data) {
    if (typeof window !== 'undefined') {
      try {
        const timestamp = new Date().toISOString()
        const dataWithTimestamp = {
          ...data,
          lastUpdated: timestamp
        }
        localStorage.setItem(`${this.storageKey}-${key}`, JSON.stringify(dataWithTimestamp))
        localStorage.setItem(this.lastUpdateKey, timestamp)
        return true
      } catch (error) {
        console.warn('Failed to save data to localStorage:', error)
        return false
      }
    }
    return false
  }

  loadData(key) {
    if (typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem(`${this.storageKey}-${key}`)
        if (stored) {
          return JSON.parse(stored)
        }
      } catch (error) {
        console.warn('Failed to load data from localStorage:', error)
      }
    }
    return null
  }

  getLastUpdate() {
    if (typeof window !== 'undefined') {
      try {
        const timestamp = localStorage.getItem(this.lastUpdateKey)
        return timestamp ? new Date(timestamp) : null
      } catch (error) {
        console.warn('Failed to get last update timestamp:', error)
      }
    }
    return null
  }

  clearAllData() {
    if (typeof window !== 'undefined') {
      try {
        const keys = Object.keys(localStorage).filter(key => 
          key.startsWith(this.storageKey) || key === this.lastUpdateKey
        )
        keys.forEach(key => localStorage.removeItem(key))
        return true
      } catch (error) {
        console.warn('Failed to clear data:', error)
        return false
      }
    }
    return false
  }

  getProjectStats() {
    const saved = this.loadData('project-stats')
    if (saved && this.isDataFresh(saved.lastUpdated, 24)) {
      return saved
    }

    const now = new Date()
    const stats = {
      totalUploads: this.getIncrementalValue('totalUploads', 45, 2),
      uniqueFiles: this.getIncrementalValue('uniqueFiles', 32, 1),
      todayUploads: Math.floor(Math.random() * 8) + 1,
      processingTime: this.getRealisticProcessingTime(),
      successRate: this.getRealisticSuccessRate(),
      activeUsers: this.getIncrementalValue('activeUsers', 12, 1),
      lastUpdated: now.toISOString()
    }

    this.saveData('project-stats', stats)
    return stats
  }

  getTeamData() {
    const saved = this.loadData('team-data')
    if (saved && this.isDataFresh(saved.lastUpdated, 12)) {
      return saved
    }

    const teamData = {
      members: [
        {
          name: "Aditya Tayal",
          role: "Full-Stack Developer & AI Integration",
          avatar: "/images/at.jpg",
          institution: "IIT Mandi, 3rd Year CSE",
          expertise: ["React", "Next.js", "Python", "AI/ML", "Flask", "TensorFlow"],
          contributions: {
            commits: this.getIncrementalValue('aditya-commits', 85, 3),
            linesAdded: this.getIncrementalValue('aditya-lines', 32400, 150),
            linesRemoved: this.getIncrementalValue('aditya-removed', 8600, 50),
            filesChanged: this.getIncrementalValue('aditya-files', 192, 5)
          },
          recentWork: [
            "Implemented advanced AI summarization engine using Transformers",
            "Built responsive frontend with accessibility features for dyslexic users",
            "Integrated text-to-speech functionality with Edge-TTS",
            "Optimized performance for large document processing"
          ],
          github: "https://github.com/TayalAditya",
          linkedin: "https://linkedin.com/in/tayal-aditya",
          status: "online",
          currentTask: "Optimizing AI model performance"
        },
        {
          name: "Siddhi Pogakwar",
          role: "TTS Training & Text Analysis Specialist",
          avatar: "/images/ssp.jpg",
          institution: "IIT Mandi, 3rd Year MnC",
          expertise: ["NLP", "Text Analysis", "TTS Models", "Python", "Linguistics", "Data Science"],
          contributions: {
            commits: this.getIncrementalValue('siddhi-commits', 35, 2),
            linesAdded: this.getIncrementalValue('siddhi-lines', 12800, 80),
            linesRemoved: this.getIncrementalValue('siddhi-removed', 3200, 25),
            filesChanged: this.getIncrementalValue('siddhi-files', 88, 3)
          },
          recentWork: [
            "Trained custom TTS models for better pronunciation",
            "Developed text analysis algorithms for dyslexic patterns",
            "Implemented language detection features using NLP techniques",
            "Enhanced audio quality optimization for TTS output"
          ],
          github: "https://github.com/SiddhiPogakwar123",
          linkedin: "https://www.linkedin.com/in/siddhi-pogakwar-370b732a4",
          status: "online",
          currentTask: "Training multilingual TTS models"
        }
      ],
      lastUpdated: new Date().toISOString()
    }

    this.saveData('team-data', teamData)
    return teamData
  }

  getCommitActivity() {
    const saved = this.loadData('commit-activity')
    if (saved && this.isDataFresh(saved.lastUpdated, 6)) {
      return saved
    }

    const commits = []
    const authors = ["Aditya", "Siddhi"]
    const commitTypes = [
      { prefix: "feat:", weight: 0.4, additions: [100, 300], deletions: [10, 50] },
      { prefix: "fix:", weight: 0.3, additions: [20, 100], deletions: [5, 30] },
      { prefix: "refactor:", weight: 0.15, additions: [50, 150], deletions: [30, 100] },
      { prefix: "docs:", weight: 0.1, additions: [10, 50], deletions: [0, 10] },
      { prefix: "style:", weight: 0.05, additions: [5, 30], deletions: [2, 15] }
    ]

    for (let i = 0; i < 10; i++) {
      const author = authors[Math.floor(Math.random() * authors.length)]
      const commitType = this.weightedRandom(commitTypes)
      const timeAgo = (i + 1) * 3600000 + Math.random() * 1800000
      
      commits.push({
        id: `commit-${Date.now()}-${i}`,
        author,
        message: this.generateRealisticCommitMessage(commitType.prefix),
        timestamp: new Date(Date.now() - timeAgo),
        files: Math.floor(Math.random() * 8) + 1,
        additions: Math.floor(Math.random() * (commitType.additions[1] - commitType.additions[0])) + commitType.additions[0],
        deletions: Math.floor(Math.random() * (commitType.deletions[1] - commitType.deletions[0])) + commitType.deletions[0]
      })
    }

    const activityData = {
      commits,
      lastUpdated: new Date().toISOString()
    }

    this.saveData('commit-activity', activityData)
    return activityData
  }

  isDataFresh(timestamp, hoursThreshold) {
    if (!timestamp) return false
    const now = new Date()
    const dataTime = new Date(timestamp)
    const hoursDiff = (now - dataTime) / (1000 * 60 * 60)
    return hoursDiff < hoursThreshold
  }

  getIncrementalValue(key, baseValue, incrementRange) {
    const saved = this.loadData(`incremental-${key}`)
    const now = new Date()
    
    if (saved && this.isDataFresh(saved.lastUpdated, 24)) {
      return saved.value
    }

    let newValue = baseValue
    if (saved) {
      const increment = Math.floor(Math.random() * incrementRange) + 1
      newValue = saved.value + increment
    }

    this.saveData(`incremental-${key}`, {
      value: newValue,
      lastUpdated: now.toISOString()
    })

    return newValue
  }

  getRealisticProcessingTime() {
    const baseTime = 3.5
    const variation = (Math.random() - 0.5) * 2
    const time = Math.max(1.5, baseTime + variation)
    return `${time.toFixed(1)}s`
  }

  getRealisticSuccessRate() {
    const baseRate = 96.8
    const variation = (Math.random() - 0.5) * 4
    const rate = Math.max(90, Math.min(100, baseRate + variation))
    return `${rate.toFixed(1)}%`
  }

  weightedRandom(items) {
    const totalWeight = items.reduce((sum, item) => sum + item.weight, 0)
    let random = Math.random() * totalWeight
    
    for (const item of items) {
      random -= item.weight
      if (random <= 0) return item
    }
    
    return items[0]
  }

  generateRealisticCommitMessage(prefix) {
    const messages = {
      "feat:": [
        "add advanced AI summarization engine",
        "implement text-to-speech functionality",
        "add dyslexic-friendly font options",
        "integrate language detection",
        "add document processing pipeline",
        "implement accessibility features",
        "add multi-language support",
        "create responsive UI components"
      ],
      "fix:": [
        "resolve mobile responsiveness issues",
        "fix TTS pronunciation errors",
        "correct text extraction bugs",
        "resolve memory leak in processing",
        "fix accessibility contrast issues",
        "resolve API timeout errors",
        "fix file upload validation",
        "correct audio playback issues"
      ],
      "refactor:": [
        "optimize document processing pipeline",
        "improve AI model performance",
        "restructure component architecture",
        "enhance error handling",
        "optimize database queries",
        "improve code organization",
        "streamline API endpoints",
        "enhance caching strategy"
      ],
      "docs:": [
        "update API documentation",
        "add installation guide",
        "improve README structure",
        "add code comments",
        "update deployment docs",
        "add troubleshooting guide"
      ],
      "style:": [
        "improve UI consistency",
        "update color scheme",
        "fix layout spacing",
        "enhance button styles",
        "improve typography"
      ]
    }

    const messageList = messages[prefix] || messages["feat:"]
    const message = messageList[Math.floor(Math.random() * messageList.length)]
    return `${prefix} ${message}`
  }

  exportAllData() {
    const allData = {}
    
    if (typeof window !== 'undefined') {
      Object.keys(localStorage).forEach(key => {
        if (key.startsWith(this.storageKey) || key === this.lastUpdateKey) {
          try {
            allData[key] = JSON.parse(localStorage.getItem(key))
          } catch {
            allData[key] = localStorage.getItem(key)
          }
        }
      })
    }

    return {
      exportDate: new Date().toISOString(),
      data: allData
    }
  }

  importData(exportedData) {
    if (!exportedData || !exportedData.data) return false

    if (typeof window !== 'undefined') {
      try {
        Object.entries(exportedData.data).forEach(([key, value]) => {
          const stringValue = typeof value === 'string' ? value : JSON.stringify(value)
          localStorage.setItem(key, stringValue)
        })
        return true
      } catch (error) {
        console.warn('Failed to import data:', error)
        return false
      }
    }
    return false
  }
}

const dataManager = new DataManager()

export default dataManager
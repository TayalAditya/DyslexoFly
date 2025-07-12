export class DocumentStateManager {
  static storageKey = 'dyslexofly-documents'
  static audioStorageKey = 'dyslexofly-audio'

  static saveDocument(fileId, documentData) {
    try {
      const documents = this.getStoredDocuments()
      documents[fileId] = {
        ...documentData,
        lastAccessed: Date.now(),
        savedAt: Date.now()
      }
      localStorage.setItem(this.storageKey, JSON.stringify(documents))
      return true
    } catch (error) {
      console.warn('Failed to save document:', error)
      return false
    }
  }

  static getStoredDocuments() {
    try {
      const stored = localStorage.getItem(this.storageKey)
      return stored ? JSON.parse(stored) : {}
    } catch (error) {
      console.warn('Failed to get stored documents:', error)
      return {}
    }
  }

  static getDocument(fileId) {
    const documents = this.getStoredDocuments()
    if (documents[fileId]) {
      documents[fileId].lastAccessed = Date.now()
      localStorage.setItem(this.storageKey, JSON.stringify(documents))
      return documents[fileId]
    }
    return null
  }

  static saveAudioFiles(fileId, audioData) {
    try {
      const audioFiles = this.getStoredAudioFiles()
      audioFiles[fileId] = {
        ...audioData,
        savedAt: Date.now()
      }
      localStorage.setItem(this.audioStorageKey, JSON.stringify(audioFiles))
      return true
    } catch (error) {
      console.warn('Failed to save audio files:', error)
      return false
    }
  }

  static getStoredAudioFiles() {
    try {
      const stored = localStorage.getItem(this.audioStorageKey)
      return stored ? JSON.parse(stored) : {}
    } catch (error) {
      console.warn('Failed to get stored audio files:', error)
      return {}
    }
  }

  static getAudioFiles(fileId) {
    const audioFiles = this.getStoredAudioFiles()
    return audioFiles[fileId] || null
  }

  static cleanOldDocuments() {
    try {
      const sevenDaysAgo = Date.now() - (7 * 24 * 60 * 60 * 1000)
      const documents = this.getStoredDocuments()
      const audioFiles = this.getStoredAudioFiles()

      let cleaned = false

      Object.keys(documents).forEach(fileId => {
        if (documents[fileId].savedAt < sevenDaysAgo) {
          delete documents[fileId]
          cleaned = true
        }
      })

      Object.keys(audioFiles).forEach(fileId => {
        if (audioFiles[fileId].savedAt < sevenDaysAgo) {
          delete audioFiles[fileId]
          cleaned = true
        }
      })

      if (cleaned) {
        localStorage.setItem(this.storageKey, JSON.stringify(documents))
        localStorage.setItem(this.audioStorageKey, JSON.stringify(audioFiles))
      }

      return cleaned
    } catch (error) {
      console.warn('Failed to clean old documents:', error)
      return false
    }
  }

  static updateSummaries(fileId, summaries) {
    const document = this.getDocument(fileId)
    if (document) {
      document.summaries = summaries
      document.lastAccessed = Date.now()
      return this.saveDocument(fileId, document)
    }
    return false
  }

  static updateAudio(fileId, audioData) {
    const document = this.getDocument(fileId)
    if (document) {
      document.audioUrls = audioData
      document.lastAccessed = Date.now()
      return this.saveDocument(fileId, document)
    }
    return false
  }

  static getAllDocuments() {
    return Object.entries(this.getStoredDocuments()).map(([fileId, data]) => ({
      fileId,
      ...data
    }))
  }

  static deleteDocument(fileId) {
    try {
      const documents = this.getStoredDocuments()
      const audioFiles = this.getStoredAudioFiles()
      
      delete documents[fileId]
      delete audioFiles[fileId]
      
      localStorage.setItem(this.storageKey, JSON.stringify(documents))
      localStorage.setItem(this.audioStorageKey, JSON.stringify(audioFiles))
      
      return true
    } catch (error) {
      console.warn('Failed to delete document:', error)
      return false
    }
  }

  static clearAllDocuments() {
    try {
      localStorage.removeItem(this.storageKey)
      localStorage.removeItem(this.audioStorageKey)
      return true
    } catch (error) {
      console.warn('Failed to clear all documents:', error)
      return false
    }
  }
}
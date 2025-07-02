// Document state management utility
export class DocumentStateManager {
  static STORAGE_KEY = 'dyslexofly_documents'
  static AUDIO_STORAGE_KEY = 'dyslexofly_audio_files'

  // Save document with summaries and audio URLs
  static saveDocument(fileId, documentData) {
    try {
      const existing = this.getStoredDocuments()
      existing[fileId] = {
        ...documentData,
        timestamp: Date.now(),
        lastAccessed: Date.now()
      }
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(existing))
      console.log(`Document ${fileId} saved to localStorage`)
    } catch (error) {
      console.error('Failed to save document:', error)
    }
  }

  // Get stored documents
  static getStoredDocuments() {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY)
      return stored ? JSON.parse(stored) : {}
    } catch (error) {
      console.error('Failed to get stored documents:', error)
      return {}
    }
  }

  // Get specific document
  static getDocument(fileId) {
    const documents = this.getStoredDocuments()
    if (documents[fileId]) {
      // Update last accessed
      documents[fileId].lastAccessed = Date.now()
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(documents))
      return documents[fileId]
    }
    return null
  }

  // Save audio files for a document
  static saveAudioFiles(fileId, audioData) {
    try {
      const existing = this.getStoredAudioFiles()
      existing[fileId] = {
        ...audioData,
        timestamp: Date.now()
      }
      localStorage.setItem(this.AUDIO_STORAGE_KEY, JSON.stringify(existing))
      console.log(`Audio files for ${fileId} saved to localStorage`)
    } catch (error) {
      console.error('Failed to save audio files:', error)
    }
  }

  // Get stored audio files
  static getStoredAudioFiles() {
    try {
      const stored = localStorage.getItem(this.AUDIO_STORAGE_KEY)
      return stored ? JSON.parse(stored) : {}
    } catch (error) {
      console.error('Failed to get stored audio files:', error)
      return {}
    }
  }

  // Get audio files for specific document
  static getAudioFiles(fileId) {
    const audioFiles = this.getStoredAudioFiles()
    return audioFiles[fileId] || null
  }

  // Clean old documents (older than 7 days)
  static cleanOldDocuments() {
    try {
      const documents = this.getStoredDocuments()
      const audioFiles = this.getStoredAudioFiles()
      const now = Date.now()
      const weekInMs = 7 * 24 * 60 * 60 * 1000

      // Clean documents
      let cleaned = false
      Object.keys(documents).forEach(fileId => {
        if (now - documents[fileId].timestamp > weekInMs) {
          delete documents[fileId]
          cleaned = true
        }
      })

      // Clean audio files
      Object.keys(audioFiles).forEach(fileId => {
        if (now - audioFiles[fileId].timestamp > weekInMs) {
          delete audioFiles[fileId]
          cleaned = true
        }
      })

      if (cleaned) {
        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(documents))
        localStorage.setItem(this.AUDIO_STORAGE_KEY, JSON.stringify(audioFiles))
        console.log('Cleaned old documents and audio files')
      }
    } catch (error) {
      console.error('Failed to clean old documents:', error)
    }
  }

  // Check if document has summaries
  static documentHasSummaries(fileId) {
    const doc = this.getDocument(fileId)
    return doc && doc.summaries && Object.keys(doc.summaries).length > 0
  }

  // Check if document has audio
  static documentHasAudio(fileId) {
    const audio = this.getAudioFiles(fileId)
    return audio && Object.keys(audio).length > 0
  }

  // Update document summaries
  static updateSummaries(fileId, summaries) {
    const doc = this.getDocument(fileId)
    if (doc) {
      doc.summaries = { ...doc.summaries, ...summaries }
      this.saveDocument(fileId, doc)
    }
  }

  // Update document audio
  static updateAudio(fileId, audioData) {
    const existing = this.getAudioFiles(fileId) || {}
    const updated = { ...existing, ...audioData }
    this.saveAudioFiles(fileId, updated)
  }
}

// Auto-cleanup on page load
if (typeof window !== 'undefined') {
  DocumentStateManager.cleanOldDocuments()
}

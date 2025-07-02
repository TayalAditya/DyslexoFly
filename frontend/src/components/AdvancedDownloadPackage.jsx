'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import JSZip from 'jszip'
import { saveAs } from 'file-saver'

// Access the global summary state from SummaryPane
const getGlobalSummaryState = () => {
  if (typeof window !== 'undefined') {
    return window.globalSummaryState || {};
  }
  return {};
};

export default function AdvancedDownloadPackage({ 
  fileId, 
  textContent, 
  summaries: propSummaries, 
  audioUrls, 
  className = '' 
}) {
  const [isGenerating, setIsGenerating] = useState(false)
  const [downloadProgress, setDownloadProgress] = useState(0)
  const [downloadStatus, setDownloadStatus] = useState('')
  
  // Get summaries from multiple sources with proper fallback
  const globalState = getGlobalSummaryState();
  const actualSummaries = propSummaries || globalState.summaries?.[fileId] || {};
  const summaries = actualSummaries; // Use this for the component
  const generateCompletePackage = async () => {
    setIsGenerating(true)
    setDownloadProgress(0)
    setDownloadStatus('Preparing package...')

    try {
      const zip = new JSZip()
        // Get summaries from multiple sources
      const globalState = getGlobalSummaryState();
      const actualSummaries = propSummaries || globalState.summaries?.[fileId] || {};
      
      console.log('Download summaries check:', {
        propSummaries,
        globalSummaries: globalState.summaries?.[fileId],
        actualSummaries,
        fileId
      });
      
      // 1. Add text content
      if (textContent) {
        setDownloadStatus('Adding text content...')
        setDownloadProgress(20)
        zip.file(`${fileId}_original_text.txt`, textContent)
      }

      // 2. Add summaries with better checking
      if (actualSummaries && Object.keys(actualSummaries).length > 0) {
        setDownloadStatus('Adding AI summaries...')
        setDownloadProgress(40)
        
        const summaryFolder = zip.folder('summaries')
        
        if (actualSummaries.tldr) {
          summaryFolder.file(`${fileId}_tldr_summary.txt`, actualSummaries.tldr)
          console.log('Added TL;DR summary to ZIP');
        }
        if (actualSummaries.standard) {
          summaryFolder.file(`${fileId}_standard_summary.txt`, actualSummaries.standard)
          console.log('Added Standard summary to ZIP');
        }
        if (actualSummaries.detailed) {
          summaryFolder.file(`${fileId}_detailed_summary.txt`, actualSummaries.detailed)
          console.log('Added Detailed summary to ZIP');
        }

        // Create a combined summaries file
        const combinedSummaries = [
          actualSummaries.tldr && `TL;DR SUMMARY:\n${actualSummaries.tldr}`,
          actualSummaries.standard && `STANDARD SUMMARY:\n${actualSummaries.standard}`,
          actualSummaries.detailed && `DETAILED SUMMARY:\n${actualSummaries.detailed}`
        ].filter(Boolean).join('\n\n' + '='.repeat(50) + '\n\n')
        
        if (combinedSummaries) {
          summaryFolder.file(`${fileId}_all_summaries.txt`, combinedSummaries)
          console.log('Added combined summaries to ZIP');
        }
      } else {
        console.log('No summaries found for ZIP download');
        setDownloadStatus('No summaries available...')
      }

      // 3. Add audio files
      if (audioUrls && Object.keys(audioUrls).length > 0) {
        setDownloadStatus('Downloading audio files...')
        setDownloadProgress(60)
        
        const audioFolder = zip.folder('audio')
        
        for (const [type, url] of Object.entries(audioUrls)) {
          if (url) {
            try {
              const response = await fetch(url)
              if (response.ok) {
                const audioBlob = await response.blob()
                const fileName = url.split('/').pop() || `${fileId}_${type}_audio.mp3`
                audioFolder.file(fileName, audioBlob)
              }
            } catch (audioError) {
              console.warn(`Failed to download audio for ${type}:`, audioError)
            }
          }
        }
      }

      // 4. Add metadata and instructions
      setDownloadStatus('Adding metadata...')
      setDownloadProgress(80)
      
      const metadata = {
        document_name: fileId,
        generated_date: new Date().toISOString(),
        dyslexofly_version: "1.0.0",
        package_contents: {
          text_content: !!textContent,
          summaries: {
            tldr: !!(summaries?.tldr),
            standard: !!(summaries?.standard),
            detailed: !!(summaries?.detailed)
          },
          audio_files: Object.keys(audioUrls || {}).length,
          total_files: 0 // Will be calculated
        },
        usage_instructions: [
          "1. Extract all files to a folder",
          "2. Read the original text in 'original_text.txt'",
          "3. Check summaries in the 'summaries' folder",
          "4. Listen to audio files in the 'audio' folder",
          "5. To restore in DyslexoFly: upload the original document again"
        ],
        platform_info: {
          website: "https://dyslexofly.vercel.app",
          github: "https://github.com/TayalAditya/DyslexoFly",
          license: "MIT License",
          developers: ["Aditya Tayal", "Siddhi Pogakwar"],
          institution: "IIT Mandi"
        }
      }

      // Calculate total files
      metadata.package_contents.total_files = 
        (textContent ? 1 : 0) + 
        Object.keys(summaries || {}).length + 
        Object.keys(audioUrls || {}).length + 
        2 // metadata + instructions

      zip.file('metadata.json', JSON.stringify(metadata, null, 2))
      
      // Add usage instructions
      const instructions = `
DyslexoFly Complete Package
===========================

This package contains all the accessible content generated from your document: ${fileId}

Contents:
- Original text content
- AI-generated summaries (TL;DR, Standard, Detailed)
- Audio narration files
- Metadata and usage instructions

How to use:
1. Extract all files to your computer
2. Read text files with any text editor
3. Play audio files with any media player
4. Import back to DyslexoFly by uploading the original document

For more information:
- Website: https://dyslexofly.vercel.app
- GitHub: https://github.com/TayalAditya/DyslexoFly

Generated on: ${new Date().toLocaleString()}
Platform: DyslexoFly - Making Education Accessible
Developers: Aditya Tayal & Siddhi Pogakwar (IIT Mandi)
License: MIT License (Free & Open Source)
      `.trim()
      
      zip.file('README.txt', instructions)

      // 5. Generate and download ZIP
      setDownloadStatus('Generating ZIP file...')
      setDownloadProgress(90)
      
      const zipBlob = await zip.generateAsync({ 
        type: 'blob',
        compression: 'DEFLATE',
        compressionOptions: { level: 6 }
      })
        setDownloadStatus('Download ready!')
      setDownloadProgress(100)
      
      // Save the file with shorter name - more concise
      const shortFileId = fileId.length > 12 ? fileId.substring(0, 12) : fileId;
      const fileName = `${shortFileId}_DF.zip`
      saveAs(zipBlob, fileName)
      
      // Reset after a short delay
      setTimeout(() => {
        setIsGenerating(false)
        setDownloadProgress(0)
        setDownloadStatus('')
      }, 2000)

    } catch (error) {
      console.error('Error generating package:', error)
      setDownloadStatus('Error generating package')
      setTimeout(() => {
        setIsGenerating(false)
        setDownloadProgress(0)
        setDownloadStatus('')
      }, 3000)
    }
  }

  const hasContent = textContent || (summaries && Object.values(summaries).some(Boolean)) || (audioUrls && Object.values(audioUrls).some(Boolean))

  if (!hasContent) {
    return null
  }

  return (
    <div className={`bg-gradient-to-br from-emerald-50 to-green-50 rounded-2xl p-6 border border-emerald-200 ${className}`}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 bg-gradient-to-r from-emerald-500 to-green-600 rounded-xl flex items-center justify-center">
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3M3 17V7a2 2 0 012-2h6l2 2h6a2 2 0 012 2v10a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
            </svg>
          </div>
          <div>
            <h3 className="text-lg font-bold text-emerald-900">Complete Package Download</h3>
            <p className="text-sm text-emerald-700">Text, summaries, and audio in one ZIP file</p>
          </div>
        </div>
      </div>

      {/* Package Contents Preview */}
      <div className="mb-6 grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white/60 rounded-lg p-3 text-center">
          <div className="text-2xl mb-1">📄</div>
          <div className="text-sm font-medium text-gray-700">Original Text</div>
          <div className="text-xs text-gray-500">{textContent ? 'Included' : 'Not available'}</div>
        </div>
        <div className="bg-white/60 rounded-lg p-3 text-center">
          <div className="text-2xl mb-1">🧠</div>
          <div className="text-sm font-medium text-gray-700">AI Summaries</div>
          <div className="text-xs text-gray-500">
            {summaries ? `${Object.values(summaries).filter(Boolean).length} types` : 'Not available'}
          </div>
        </div>
        <div className="bg-white/60 rounded-lg p-3 text-center">
          <div className="text-2xl mb-1">🎵</div>
          <div className="text-sm font-medium text-gray-700">Audio Files</div>
          <div className="text-xs text-gray-500">
            {audioUrls ? `${Object.values(audioUrls).filter(Boolean).length} files` : 'Not available'}
          </div>
        </div>
      </div>

      {/* Download Progress */}
      {isGenerating && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-4 bg-white/80 rounded-lg p-4"
        >
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium text-gray-700">{downloadStatus}</span>
            <span className="text-sm font-bold text-emerald-600">{downloadProgress}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <motion.div
              className="bg-gradient-to-r from-emerald-500 to-green-600 h-2 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${downloadProgress}%` }}
              transition={{ duration: 0.5, ease: "easeOut" }}
            />
          </div>
        </motion.div>
      )}

      {/* Download Button */}
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={generateCompletePackage}
        disabled={isGenerating}
        className={`w-full py-3 px-6 rounded-xl font-semibold text-white shadow-lg transition-all duration-300 ${
          isGenerating
            ? 'bg-gray-400 cursor-not-allowed'
            : 'bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 hover:shadow-xl'
        }`}
      >
        {isGenerating ? (
          <div className="flex items-center justify-center space-x-2">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              className="w-5 h-5 border-2 border-white border-t-transparent rounded-full"
            />
            <span>Generating Package...</span>
          </div>
        ) : (
          <div className="flex items-center justify-center space-x-2">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3M3 17V7a2 2 0 012-2h6l2 2h6a2 2 0 012 2v10a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
            </svg>
            <span>Download Complete Package</span>
          </div>
        )}
      </motion.button>

      <div className="mt-4 text-center">
        <p className="text-xs text-gray-500">
          Package includes all generated content for offline use and future restoration
        </p>
      </div>
    </div>
  )
}

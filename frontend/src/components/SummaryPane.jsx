'use client'

import React from 'react';
import { useAccessibility } from './AccessibilityProvider'

const SummaryPane = ({ summary }) => {
  const { fontFamily } = useAccessibility()
  
  if (!summary) {
    return (
      <div className="h-full flex items-center justify-center">
        <p className="text-gray-500">No summary available</p>
      </div>
    )
  }
  
  return (
    <div className="accessible-content" style={{ fontFamily }}>
      <p className="text-gray-800">{summary}</p>
    </div>
  )
}

export default SummaryPane;
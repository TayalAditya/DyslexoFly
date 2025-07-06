'use client'

import { usePathname } from 'next/navigation'
import ImprovedFloatingActions from './ImprovedFloatingActions'

export default function ConditionalFloatingActions() {
  const pathname = usePathname()
  
  // Don't show floating actions on results page since it has its own ResultsFloatingButtons
  if (pathname === '/results') {
    return null
  }
  
  return <ImprovedFloatingActions />
}
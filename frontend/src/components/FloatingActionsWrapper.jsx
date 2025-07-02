'use client'
import { usePathname } from 'next/navigation'
import FloatingActions from './FloatingActions'

export default function FloatingActionsWrapper() {
  const pathname = usePathname()
  if (pathname.startsWith('/results')) {
    return null
  }
  return <FloatingActions />
}

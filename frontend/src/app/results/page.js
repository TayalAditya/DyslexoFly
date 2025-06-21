import { Suspense } from 'react'
import ResultsPageClient from './ResultsPageClient'

export const dynamic = 'force-dynamic' // optional but ensures this page is not statically generated

export default function ResultsPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-indigo-700">Loading results...</div>}>
      <ResultsPageClient />
    </Suspense>
  )
}

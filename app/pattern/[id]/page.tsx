import { Suspense } from 'react'
import PatternContent from './PatternContent'

export default function PatternPage() {
  return (
    <Suspense fallback={<div className="p-8 text-[#8B8FA8]">Loading…</div>}>
      <PatternContent />
    </Suspense>
  )
}
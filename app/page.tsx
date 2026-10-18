// app/page.tsx
import Link from 'next/link'
import { supabase } from '@/lib/supabase'

type Category = {
  id: number
  name: string
  sort_order: number
}

async function getCategories(): Promise<Category[]> {
  'use cache'
  const { data } = await supabase.from('categories').select('*').order('sort_order')
  return data || []
}

async function getPatterns(): Promise<{ id: number; category_id: number }[]> {
  'use cache'
  const { data } = await supabase.from('patterns').select('id, category_id')
  return data || []
}

export default async function HomePage() {
  const categories = await getCategories()
  const patterns = await getPatterns()

  const countByCategory = patterns.reduce<Record<number, number>>((acc, p) => {
    acc[p.category_id] = (acc[p.category_id] || 0) + 1
    return acc
  }, {})

  return (
    <div className="max-w-lg mx-auto px-4 pb-24">
      <div className="pt-12 pb-8">
        <p className="text-[#8B8FA8] text-sm tracking-widest uppercase mb-1">JLPT</p>
        <h1 className="font-jp text-3xl font-semibold text-white">N2 文法</h1>
        <p className="text-[#8B8FA8] text-sm mt-1">Grammar Drill</p>
      </div>

      <div className="space-y-3">
        {categories.map((cat) => (
          <Link
            key={cat.id}
            href={`/category/${cat.id}`}
            className="flex items-center justify-between bg-[#1A1D27] rounded-2xl px-5 py-4 active:opacity-70 transition-opacity"
          >
            <div>
              <p className="text-white font-medium">{cat.name}</p>
              <p className="text-[#8B8FA8] text-sm mt-0.5">{countByCategory[cat.id] || 0} patterns</p>
            </div>
            <span className="text-[#7C6AF7] text-xl">›</span>
          </Link>
        ))}
      </div>

      <nav className="fixed bottom-0 left-0 right-0 bg-[#0F1117] border-t border-[#1A1D27] flex justify-around py-3">
        <Link href="/" className="flex flex-col items-center gap-1 text-[#7C6AF7]">
          <span className="text-lg">⊞</span>
          <span className="text-xs">Study</span>
        </Link>
        <Link href="/exam" className="flex flex-col items-center gap-1 text-[#8B8FA8]">
          <span className="text-lg">✎</span>
          <span className="text-xs">Exam</span>
        </Link>
        <Link href="/progress" className="flex flex-col items-center gap-1 text-[#8B8FA8]">
          <span className="text-lg">◎</span>
          <span className="text-xs">Progress</span>
        </Link>
      </nav>
    </div>
  )
}
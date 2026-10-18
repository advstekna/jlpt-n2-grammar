// app/category/[id]/page.tsx

export const instant = false
import Link from 'next/link'
import { supabase } from '@/lib/supabase'

type Pattern = {
  id: number
  pattern_number: number
  grammar_pattern: string
  category_id: number
}

type Category = {
  id: number
  name: string
}

async function getCategory(id: string): Promise<Category | null> {
  'use cache'
  const { data } = await supabase.from('categories').select('*').eq('id', id).single()
  return data
}

async function getPatterns(categoryId: string): Promise<Pattern[]> {
  'use cache'
  const { data } = await supabase
    .from('patterns')
    .select('id, pattern_number, grammar_pattern, category_id')
    .eq('category_id', categoryId)
    .order('sort_order')
  return data || []
}

export default async function CategoryPage({ params }: { params: { id: string } }) {
  const { id } = await params
  const category = await getCategory(id)
  const patterns = await getPatterns(id)

  return (
    <div className="max-w-lg mx-auto px-4 pb-24">
      {/* Header */}
      <div className="pt-12 pb-6 flex items-center gap-3">
        <Link href="/" className="text-[#8B8FA8] text-2xl leading-none">‹</Link>
        <div>
          <p className="text-[#8B8FA8] text-xs uppercase tracking-widest">Category</p>
          <h1 className="text-white font-semibold text-lg">{category?.name}</h1>
        </div>
      </div>

      {/* Pattern list */}
      <div className="space-y-2">
        {patterns.map((p, i) => (
          <Link
            key={p.id}
            href={`/pattern/${p.id}`}
            className="flex items-center gap-4 bg-[#1A1D27] rounded-2xl px-5 py-4 active:opacity-70 transition-opacity"
          >
            <span className="text-[#8B8FA8] text-sm w-6 shrink-0">{i + 1}</span>
            <p className="font-jp text-white text-lg flex-1">{p.grammar_pattern}</p>
            <span className="text-[#7C6AF7] text-xl">›</span>
          </Link>
        ))}
      </div>

      {/* Test button */}
      <div className="mt-8">
        <Link
          href={`/category/${id}/test`}
          className="block w-full bg-[#7C6AF7] text-white text-center font-semibold py-4 rounded-2xl active:opacity-80 transition-opacity"
        >
          Test this category
        </Link>
      </div>

      {/* Bottom nav */}
      <nav className="fixed bottom-0 left-0 right-0 bg-[#0F1117] border-t border-[#1A1D27] flex justify-around py-3">
        <Link href="/" className="flex flex-col items-center gap-1 text-[#8B8FA8]">
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
'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { supabase } from '@/lib/supabase'

type Pattern = {
  id: number
  grammar_pattern: string
  grammar_formats: string
  detailed_explanation: string
  similar_patterns: string
  register: string
  common_mistakes: string
  how_to_read: string
  jlpt_strategy: string
  category_id: number
}

type Example = {
  id: number
  example_number: number
  format_used: string
  japanese: string
  english: string
  explanation: string
}

type Question = {
  id: number
  question_type: number
  question: string
  choice_1: string
  choice_2: string
  choice_3: string
  choice_4: string
  correct_choice: number
  correct_answer: string
}

function InfoBlock({ label, text }: { label: string; text: string }) {
  if (!text) return null
  return (
    <div className="bg-[#1A1D27] rounded-2xl px-5 py-4">
      <p className="text-[#7C6AF7] text-xs font-semibold uppercase tracking-wider mb-2">{label}</p>
      <p className="text-[#F1F1F3] text-sm leading-relaxed">{text}</p>
    </div>
  )
}

export default function PatternContent() {
  const { id } = useParams()
  const [tab, setTab] = useState<'explain' | 'examples' | 'quiz'>('explain')
  const [pattern, setPattern] = useState<Pattern | null>(null)
  const [examples, setExamples] = useState<Example[]>([])
  const [questions, setQuestions] = useState<Question[]>([])
  const [answers, setAnswers] = useState<Record<number, number>>({})

  useEffect(() => {
    async function load() {
      const [{ data: p }, { data: ex }, { data: q }] = await Promise.all([
        supabase.from('patterns').select('*').eq('id', id).single(),
        supabase.from('examples').select('*').eq('pattern_id', id).order('example_number'),
        supabase.from('questions').select('*').eq('pattern_id', id),
      ])
      setPattern(p)
      setExamples(ex || [])
      setQuestions(q || [])
    }
    load()
  }, [id])

  if (!pattern) return <div className="p-8 text-[#8B8FA8]">Loading…</div>

  return (
    <div className="max-w-lg mx-auto px-4 pb-24">
      {/* Header */}
      <div className="pt-12 pb-4 flex items-center gap-3">
        <Link href={`/category/${pattern.category_id}`} className="text-[#8B8FA8] text-2xl leading-none">‹</Link>
        <h1 className="font-jp text-xl font-semibold text-white">{pattern.grammar_pattern}</h1>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-[#1A1D27] rounded-xl p-1 mb-6">
        {(['explain', 'examples', 'quiz'] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${
              tab === t ? 'bg-[#7C6AF7] text-white' : 'text-[#8B8FA8]'
            }`}
          >
            {t === 'explain' ? 'Explanation' : t === 'examples' ? 'Examples' : 'Quiz'}
          </button>
        ))}
      </div>

      {/* EXPLANATION TAB */}
      {tab === 'explain' && (
        <div className="space-y-4">
          {pattern.grammar_formats && (
            <div className="bg-[#1A1D27] rounded-2xl px-5 py-4">
              <p className="text-[#7C6AF7] text-xs font-semibold uppercase tracking-wider mb-2">Formation</p>
              <p className="font-jp text-white text-base">{pattern.grammar_formats}</p>
            </div>
          )}
          {pattern.detailed_explanation &&
            pattern.detailed_explanation
              .split(/(?=CORE MEANING|SENTENCE LOGIC|FORMATION|REGISTER|HOW TO DISTINGUISH|JLPT TRAP|COMMON ERROR|NUANCE)/)
              .map((chunk, i) => {
                const match = chunk.match(/^([A-Z][A-Z /]+)\s/)
                if (!match) return <InfoBlock key={i} label="Overview" text={chunk.trim()} />
                const heading = match[1]
                const body = chunk.slice(match[0].length).trim()
                return <InfoBlock key={i} label={heading} text={body} />
              })}
          <InfoBlock label="How to read" text={pattern.how_to_read} />
          <InfoBlock label="Register" text={pattern.register} />
          <InfoBlock label="Similar patterns" text={pattern.similar_patterns} />
          <InfoBlock label="Common mistakes" text={pattern.common_mistakes} />
          <InfoBlock label="JLPT strategy" text={pattern.jlpt_strategy} />
        </div>
      )}

      {/* EXAMPLES TAB */}
      {tab === 'examples' && (
        <div className="space-y-4">
          {examples.length === 0 && (
            <p className="text-[#8B8FA8] text-center py-8">No examples yet</p>
          )}
          {examples.map((ex, i) => (
            <div key={ex.id} className="bg-[#1A1D27] rounded-2xl overflow-hidden">
              {/* Top: sentence number + format tag */}
              <div className="flex items-center justify-between px-5 pt-4 pb-2">
                <span className="text-[#7C6AF7] text-xs font-semibold">#{i + 1}</span>
                {ex.format_used && (
                  <span className="text-[#7C6AF7] text-xs bg-[#7C6AF7]/10 px-2 py-0.5 rounded-full">
                    {ex.format_used}
                  </span>
                )}
              </div>

              {/* Japanese sentence — large and clear */}
              <div className="px-5 pb-3">
                <p className="font-jp text-white text-lg leading-loose">{ex.japanese}</p>
              </div>

              {/* English translation */}
              <div className="px-5 pb-4">
                <p className="text-[#C4C7D6] text-sm leading-relaxed">{ex.english}</p>
              </div>

              {/* Explanation — separated by divider, muted */}
  {/* Explanation — separated by divider, muted */}
{ex.explanation && (
  <div className="border-t border-[#2A2D3A] px-5 py-3 space-y-2">
    {ex.explanation
      .split(/(?=FORMATION USED|WHY IT FITS|NUANCE HERE|READING OF THIS EXAMPLE|EXAM POINT|COMPARE|HOW TO READ|COMMON ERROR|JLPT TRAP)/)
      .map((chunk, ci) => {
        const match = chunk.match(/^([A-Z][A-Z /]+(?:OF THIS EXAMPLE)?):?\s/)
        if (!match) return (
          <p key={ci} className="text-[#8B8FA8] text-xs leading-relaxed">{chunk.trim()}</p>
        )
        const heading = match[1]
        const body = chunk.slice(match[0].length).trim()
        return (
          <div key={ci}>
            <p className="text-[#7C6AF7] text-[10px] font-semibold uppercase tracking-wider mb-0.5">{heading}</p>
            <p className="text-[#8B8FA8] text-xs leading-relaxed">{body}</p>
          </div>
        )
      })}
  </div>
)}
            </div>
          ))}
        </div>
      )}

      {/* QUIZ TAB */}
      {tab === 'quiz' && (
        <div className="space-y-6">
          {questions.length === 0 && (
            <p className="text-[#8B8FA8] text-center py-8">No questions yet</p>
          )}
          {questions.map((q) => {
            const chosen = answers[q.id]
            const answered = chosen !== undefined
            return (
              <div key={q.id} className="bg-[#1A1D27] rounded-2xl px-5 py-5">
                <p className="text-xs text-[#7C6AF7] mb-3">
                  {q.question_type === 7
                    ? 'Grammar Selection'
                    : q.question_type === 8
                    ? 'Sentence Composition'
                    : 'Text Grammar'}
                </p>
                <p className="font-jp text-white leading-relaxed mb-4">{q.question}</p>
                <div className="space-y-2">
                  {[q.choice_1, q.choice_2, q.choice_3, q.choice_4].map((choice, ci) => {
                    const num = ci + 1
                    const isCorrect = num === q.correct_choice
                    const isChosen = chosen === num
                    let cls = 'bg-[#2A2D3A] hover:bg-[#32364A]'
                    if (answered) {
                      if (isCorrect) cls = 'bg-[#4ADE80]/15 border border-[#4ADE80]'
                      else if (isChosen) cls = 'bg-[#F87171]/15 border border-[#F87171]'
                      else cls = 'bg-[#2A2D3A] opacity-50'
                    }
                    return (
                      <button
                        key={num}
                        disabled={answered}
                        onClick={() => setAnswers((a) => ({ ...a, [q.id]: num }))}
                        className={`w-full text-left px-4 py-3 rounded-xl font-jp text-white text-sm transition-all ${cls}`}
                      >
                        <span className="text-[#7C6AF7] font-semibold mr-2">{num}.</span>
                        {choice}
                      </button>
                    )
                  })}
                </div>
                {answered && (
                  <div className="mt-3 pt-3 border-t border-[#2A2D3A]">
                    <p className="text-[#8B8FA8] text-xs leading-relaxed">✓ {q.correct_answer}</p>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}

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
'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { supabase } from '@/lib/supabase'

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
  pattern_id: number
  grammar_pattern?: string
}

type Screen = 'loading' | 'intro' | 'quiz' | 'results'

export default function CategoryTestPage() {
  const { id } = useParams()
  const [categoryName, setCategoryName] = useState('')
  const [questions, setQuestions] = useState<Question[]>([])
  const [screen, setScreen] = useState<Screen>('loading')
  const [current, setCurrent] = useState(0)
  const [answers, setAnswers] = useState<Record<number, number>>({})
  const [chosen, setChosen] = useState<number | null>(null)
  const [showFeedback, setShowFeedback] = useState(false)

  useEffect(() => {
    async function load() {
      const { data: cat } = await supabase
        .from('categories')
        .select('name')
        .eq('id', id)
        .single()
      setCategoryName(cat?.name || '')

      const { data: patterns } = await supabase
        .from('patterns')
        .select('id, grammar_pattern')
        .eq('category_id', id)

      if (!patterns?.length) { setScreen('intro'); return }

      const patternIds = patterns.map((p) => p.id)
      const { data: qs } = await supabase
        .from('questions')
        .select('*')
        .in('pattern_id', patternIds)

      // attach grammar_pattern label, shuffle
      const enriched = (qs || []).map((q) => ({
        ...q,
        grammar_pattern: patterns.find((p) => p.id === q.pattern_id)?.grammar_pattern,
      }))
      const shuffled = enriched.sort(() => Math.random() - 0.5).slice(0, 20)
      setQuestions(shuffled)
      setScreen('intro')
    }
    load()
  }, [id])

  function handleAnswer(num: number) {
    if (chosen !== null) return
    setChosen(num)
    setShowFeedback(true)
    setAnswers((a) => ({ ...a, [questions[current].id]: num }))
  }

  function next() {
    setChosen(null)
    setShowFeedback(false)
    if (current + 1 >= questions.length) {
      setScreen('results')
    } else {
      setCurrent((c) => c + 1)
    }
  }

  const score = questions.filter((q) => answers[q.id] === q.correct_choice).length

  // LOADING
  if (screen === 'loading') {
    return <div className="p-8 text-[#8B8FA8]">Loading…</div>
  }

  // INTRO
  if (screen === 'intro') {
    return (
      <div className="max-w-lg mx-auto px-4 pt-20 pb-24 flex flex-col items-center text-center">
        <div className="w-16 h-16 rounded-2xl bg-[#7C6AF7]/20 flex items-center justify-center text-3xl mb-6">✎</div>
        <h1 className="text-white text-2xl font-bold mb-2">{categoryName}</h1>
        <p className="text-[#8B8FA8] text-sm mb-1">Category Test</p>
        <p className="text-[#8B8FA8] text-sm mb-10">
          {questions.length} questions · all grammar patterns
        </p>
        <button
          onClick={() => setScreen('quiz')}
          className="bg-[#7C6AF7] text-white px-10 py-3 rounded-xl font-semibold text-base"
        >
          Start Test
        </button>
        <Link href={`/category/${id}`} className="mt-4 text-[#8B8FA8] text-sm">
          ← Back to patterns
        </Link>
      </div>
    )
  }

  // RESULTS
  if (screen === 'results') {
    const pct = Math.round((score / questions.length) * 100)
    const passed = pct >= 70
    return (
      <div className="max-w-lg mx-auto px-4 pt-20 pb-24 flex flex-col items-center text-center">
        <div className={`w-20 h-20 rounded-full flex items-center justify-center text-4xl mb-6 ${passed ? 'bg-[#4ADE80]/20' : 'bg-[#F87171]/20'}`}>
          {passed ? '🎉' : '📚'}
        </div>
        <h2 className="text-white text-3xl font-bold mb-1">{pct}%</h2>
        <p className="text-[#8B8FA8] mb-1">{score} / {questions.length} correct</p>
        <p className={`text-sm font-semibold mb-10 ${passed ? 'text-[#4ADE80]' : 'text-[#F87171]'}`}>
          {passed ? 'Great work!' : 'Keep studying!'}
        </p>

        <div className="w-full space-y-3 text-left mb-10">
          {questions.map((q) => {
            const correct = answers[q.id] === q.correct_choice
            return (
              <div key={q.id} className={`bg-[#1A1D27] rounded-xl px-4 py-3 border ${correct ? 'border-[#4ADE80]/30' : 'border-[#F87171]/30'}`}>
                <p className="text-[#7C6AF7] text-xs mb-1">{q.grammar_pattern}</p>
                <p className="font-jp text-white text-sm leading-relaxed">{q.question}</p>
                {!correct && (
                  <p className="text-[#8B8FA8] text-xs mt-1">✓ {[q.choice_1, q.choice_2, q.choice_3, q.choice_4][q.correct_choice - 1]}</p>
                )}
              </div>
            )
          })}
        </div>

        <div className="flex gap-3">
          <button
            onClick={() => { setCurrent(0); setAnswers({}); setChosen(null); setShowFeedback(false); setScreen('quiz') }}
            className="bg-[#7C6AF7] text-white px-6 py-3 rounded-xl font-semibold"
          >
            Retry
          </button>
          <Link href={`/category/${id}`} className="bg-[#1A1D27] text-[#8B8FA8] px-6 py-3 rounded-xl font-semibold">
            Back
          </Link>
        </div>
      </div>
    )
  }

  // QUIZ
  const q = questions[current]
  const progress = ((current + 1) / questions.length) * 100

  return (
    <div className="max-w-lg mx-auto px-4 pb-24">
      {/* Header */}
      <div className="pt-10 pb-4 flex items-center justify-between">
        <button onClick={() => setScreen('intro')} className="text-[#8B8FA8] text-2xl leading-none">✕</button>
        <p className="text-[#8B8FA8] text-sm">{current + 1} / {questions.length}</p>
      </div>

      {/* Progress bar */}
      <div className="h-1.5 bg-[#1A1D27] rounded-full mb-6">
        <div
          className="h-1.5 bg-[#7C6AF7] rounded-full transition-all duration-300"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Pattern label */}
      <p className="text-[#7C6AF7] text-xs font-semibold mb-3">{q.grammar_pattern}</p>

      {/* Question */}
      <div className="bg-[#1A1D27] rounded-2xl px-5 py-5 mb-5">
        <p className="text-xs text-[#8B8FA8] mb-3">
          {q.question_type === 7 ? 'Grammar Selection' : q.question_type === 8 ? 'Sentence Composition' : 'Text Grammar'}
        </p>
        <p className="font-jp text-white leading-relaxed">{q.question}</p>
      </div>

      {/* Choices */}
      <div className="space-y-2 mb-6">
        {[q.choice_1, q.choice_2, q.choice_3, q.choice_4].map((choice, ci) => {
          const num = ci + 1
          const isCorrect = num === q.correct_choice
          const isChosen = chosen === num
          let cls = 'bg-[#1A1D27] hover:bg-[#22253A]'
          if (showFeedback) {
            if (isCorrect) cls = 'bg-[#4ADE80]/15 border border-[#4ADE80]'
            else if (isChosen) cls = 'bg-[#F87171]/15 border border-[#F87171]'
            else cls = 'bg-[#1A1D27] opacity-40'
          }
          return (
            <button
              key={num}
              disabled={showFeedback}
              onClick={() => handleAnswer(num)}
              className={`w-full text-left px-4 py-3 rounded-xl font-jp text-white text-sm transition-all ${cls}`}
            >
              <span className="text-[#7C6AF7] font-semibold mr-2">{num}.</span>
              {choice}
            </button>
          )
        })}
      </div>

      {/* Feedback + Next */}
      {showFeedback && (
        <div className="bg-[#1A1D27] rounded-2xl px-5 py-4 mb-4">
          <p className={`text-sm font-semibold mb-1 ${chosen === q.correct_choice ? 'text-[#4ADE80]' : 'text-[#F87171]'}`}>
            {chosen === q.correct_choice ? '✓ Correct!' : '✗ Incorrect'}
          </p>
          <p className="text-[#8B8FA8] text-xs leading-relaxed">{q.correct_answer}</p>
        </div>
      )}

      {showFeedback && (
        <button
          onClick={next}
          className="w-full bg-[#7C6AF7] text-white py-3 rounded-xl font-semibold"
        >
          {current + 1 >= questions.length ? 'See Results' : 'Next →'}
        </button>
      )}
    </div>
  )
}
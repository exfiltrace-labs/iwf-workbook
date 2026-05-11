import type { ReactNode } from 'react'
import { ChevronLeft, RotateCcw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import type { CaseData, QuestionId, Tag } from '../types'

interface DebriefProps {
  caseData: CaseData
  tagsByArtifact: Record<string, Tag[]>
  conclusions: Record<QuestionId, string | null>
  onReplay: () => void
  onExit: () => void
}

interface ArtifactResult {
  artifactId: string
  status: 'correct' | 'missed' | 'herring' | 'set-aside-correct'
}

/**
 * Post-submit feedback view. Renders inside the SPA's main area in place
 * of the rail+worksheet split.
 */
export function Debrief({
  caseData,
  tagsByArtifact,
  conclusions,
  onReplay,
  onExit,
}: DebriefProps) {
  const artifactResults: ArtifactResult[] = caseData.artifacts.map((a) => {
    const tags = tagsByArtifact[a.id] ?? []
    const tagged = tags.filter((t) => t !== 'not-relevant') as QuestionId[]

    // Red herrings, plus any artifact that supports zero HR questions, are
    // expected to be set aside. Tagging them counts as a herring.
    if (a.relevance === 'red-herring' || a.supportsQuestionIds.length === 0) {
      if (tagged.length === 0) return { artifactId: a.id, status: 'set-aside-correct' }
      return { artifactId: a.id, status: 'herring' }
    }

    // corroborating or context with non-empty supportsQuestionIds: at least
    // one supported question should be tagged.
    const overlap = tagged.some((t) => a.supportsQuestionIds.includes(t))
    if (overlap) return { artifactId: a.id, status: 'correct' }
    return { artifactId: a.id, status: 'missed' }
  })

  const correctCount = artifactResults.filter(
    (r) => r.status === 'correct' || r.status === 'set-aside-correct',
  ).length

  // Pass criteria: every HR question has a correct conclusion AND at
  // least one correctly-tagged finding. Mirrors `isLabPassed` in
  // `useInvestigationState.ts`.
  const passed = caseData.hrQuestions.every((q) => {
    const choiceId = conclusions[q.id]
    if (!choiceId) return false
    const choice = caseData.conclusionChoices[q.id].find((c) => c.id === choiceId)
    if (!choice?.correct) return false
    const correctlyTagged = caseData.artifacts.filter(
      (a) =>
        a.supportsQuestionIds.includes(q.id) &&
        (tagsByArtifact[a.id] ?? []).includes(q.id),
    )
    return correctlyTagged.length >= 1
  })

  return (
    <div className="flex h-full min-h-0 flex-col overflow-y-auto bg-forensic-bg">
      <div className="mx-auto w-full max-w-4xl px-6 py-8">
        <div className="mb-6 flex flex-wrap items-start justify-between gap-3">
          <div>
            <h1 className="text-[24px] font-bold leading-tight tracking-tight text-forensic-text">
              Investigation review
            </h1>
            <p className="mt-1 text-[14px] text-forensic-textMuted">
              {correctCount} of {caseData.artifacts.length} artifacts handled correctly.
            </p>
          </div>
          <div className="flex flex-none items-center gap-2">
            <Button variant="outline" size="sm" onClick={onExit}>
              <ChevronLeft className="h-4 w-4" />
              Back to brief
            </Button>
            <Button variant="default" size="sm" onClick={onReplay}>
              <RotateCcw className="h-4 w-4" />
              Replay
            </Button>
          </div>
        </div>

        {/* Pass / not-yet banner */}
        <section
          className={cn(
            'mb-6 rounded-xl border px-5 py-4 shadow-lab-sm',
            passed
              ? 'border-emerald-300 bg-emerald-50'
              : 'border-amber-300 bg-amber-50',
          )}
        >
          <h2
            className={cn(
              'text-[16px] font-semibold leading-snug',
              passed ? 'text-emerald-800' : 'text-amber-900',
            )}
          >
            {passed ? '✓ Lab complete' : 'Not yet'}
          </h2>
          <p
            className={cn(
              'pt-1 text-[13.5px] leading-relaxed',
              passed ? 'text-emerald-900/85' : 'text-amber-900/85',
            )}
          >
            {passed
              ? 'You answered every question correctly with at least one corroborating witness. You can replay to chase the artifacts you missed without losing your completion, or click Start over to wipe everything and run the case fresh.'
              : 'To complete the lab, every question needs a correct conclusion and at least one correctly-tagged finding. Review the notes below and replay when you are ready.'}
          </p>
        </section>

        {/* Per-question summary */}
        <section className="space-y-4">
          {caseData.hrQuestions.map((q) => {
            const expected = caseData.artifacts.filter((a) =>
              a.supportsQuestionIds.includes(q.id),
            )
            const tagged = caseData.artifacts.filter((a) =>
              (tagsByArtifact[a.id] ?? []).includes(q.id),
            )
            const correctlyTagged = tagged.filter((a) =>
              a.supportsQuestionIds.includes(q.id),
            )
            const missed = expected.filter((a) => !tagged.some((t) => t.id === a.id))
            const taggedHerrings = tagged.filter((a) => a.relevance === 'red-herring')

            const choiceId = conclusions[q.id]
            const choice = caseData.conclusionChoices[q.id].find((c) => c.id === choiceId)
            const correctChoice = caseData.conclusionChoices[q.id].find((c) => c.correct)

            return (
              <article
                key={q.id}
                className="rounded-xl border border-forensic-border bg-forensic-surface px-6 py-5 shadow-lab-sm"
              >
                <header className="flex items-center gap-3 pb-3">
                  <span
                    aria-hidden="true"
                    className={cn(
                      'flex h-6 w-6 flex-none items-center justify-center rounded-full text-[13px] font-bold text-white',
                      choice?.correct ? 'bg-emerald-600' : 'bg-rose-600',
                    )}
                  >
                    {choice?.correct ? '✓' : '✗'}
                  </span>
                  <h2 className="min-w-0 flex-1 text-[17px] font-semibold leading-snug text-forensic-text">
                    {q.text}
                  </h2>
                </header>

                <ConclusionResult
                  picked={choice?.label ?? '(no conclusion picked)'}
                  correct={choice?.correct ?? false}
                  truth={correctChoice?.label ?? ''}
                />

                <p className="border-t border-forensic-border/60 py-3 text-[13.5px] leading-relaxed text-forensic-text/85">
                  {q.reinforcement}
                </p>

                <ScoreLine
                  label="Artifacts tagged"
                  value={`${correctlyTagged.length} of ${expected.length} expected`}
                  warn={correctlyTagged.length < 2}
                  warnNote={null}
                />

                {missed.length > 0 && (
                  <ResultBlock
                    tone="amber"
                    title={`Expected findings you missed (${missed.length})`}
                  >
                    <ul className="list-disc space-y-1 pl-5">
                      {missed.map((a) => (
                        <li key={a.id} className="font-medium">
                          {a.name}
                        </li>
                      ))}
                    </ul>
                  </ResultBlock>
                )}

                {taggedHerrings.length > 0 && (
                  <ResultBlock
                    tone="rose"
                    title={`Red herrings you tagged (${taggedHerrings.length})`}
                  >
                    <ul className="list-disc space-y-1 pl-5">
                      {taggedHerrings.map((a) => (
                        <li key={a.id} className="font-medium">
                          {a.name}
                        </li>
                      ))}
                    </ul>
                  </ResultBlock>
                )}
              </article>
            )
          })}
        </section>

        {/* Narrative reveal */}
        <section className="mt-8 rounded-xl border border-forensic-primary/30 bg-forensic-primarySoft/40 px-6 py-5">
          <h2 className="pb-2 text-[16px] font-semibold text-forensic-primary">
            What really happened
          </h2>
          <div className="space-y-3 text-[15px] leading-relaxed text-forensic-text/90">
            {caseData.debriefNarrative.map((p, i) => (
              <p key={i}>{renderInline(p)}</p>
            ))}
          </div>
        </section>

<div className="mt-8 flex justify-end gap-2">
          <Button variant="outline" size="sm" onClick={onExit}>
            <ChevronLeft className="h-4 w-4" />
            Back to brief
          </Button>
          <Button variant="default" size="sm" onClick={onReplay}>
            <RotateCcw className="h-4 w-4" />
            Replay this investigation
          </Button>
        </div>
      </div>
    </div>
  )
}

function ConclusionResult({
  picked,
  correct,
  truth,
}: {
  picked: string
  correct: boolean
  truth: string
}) {
  return (
    <div className="space-y-3 pb-3">
      <div className="flex items-center gap-2.5">
        <span
          aria-hidden="true"
          className={cn(
            'flex h-5 w-5 flex-none items-center justify-center rounded-full text-[11px] font-bold text-white',
            correct ? 'bg-emerald-600' : 'bg-rose-600',
          )}
        >
          {correct ? '✓' : '✗'}
        </span>
        <p className="min-w-0 flex-1 text-[14px] font-medium leading-snug text-forensic-text">
          <span className="text-forensic-textMuted">You picked: </span>
          {picked}
        </p>
      </div>
      {!correct && (
        <div className="flex items-center gap-2.5">
          <span
            aria-hidden="true"
            className="flex h-5 w-5 flex-none items-center justify-center rounded-full bg-emerald-600 text-[11px] font-bold text-white"
          >
            ✓
          </span>
          <p className="min-w-0 flex-1 text-[14px] leading-snug text-forensic-text">
            <span className="text-emerald-700 font-medium">Expected: </span>
            {truth}
          </p>
        </div>
      )}
    </div>
  )
}

function ScoreLine({
  label,
  value,
  warn,
  warnNote,
}: {
  label: string
  value: string
  warn: boolean
  warnNote: string | null
}) {
  return (
    <div className="border-t border-forensic-border/60 pt-3">
      <div className="flex items-baseline gap-2 text-[13.5px]">
        <span className="text-forensic-textMuted">{label}:</span>
        <span className={cn('font-semibold', warn ? 'text-forensic-herring' : 'text-forensic-corroborated')}>
          {value}
        </span>
      </div>
      {warn && warnNote && (
        <p className="pt-1 text-[13px] italic leading-snug text-forensic-herring">{warnNote}</p>
      )}
    </div>
  )
}

function ResultBlock({
  tone,
  title,
  children,
}: {
  tone: 'amber' | 'rose'
  title: string
  children: ReactNode
}) {
  const styles =
    tone === 'amber'
      ? 'border-amber-200 bg-amber-50 text-amber-900'
      : 'border-rose-200 bg-rose-50 text-rose-900'
  return (
    <div className={cn('mt-3 rounded-lg border px-4 py-3 text-[13.5px] leading-snug', styles)}>
      <div className="pb-1.5 font-semibold">{title}</div>
      {children}
    </div>
  )
}

/**
 * Tiny inline-markdown renderer. Splits text on `code spans` and **bold**
 * markers and returns React nodes. Used by the narrative reveal so the
 * case data can highlight timestamps, paths, account names, and search
 * queries without committing to a full markdown processor.
 */
function renderInline(text: string): ReactNode[] {
  const out: ReactNode[] = []
  const codeSplit = text.split(/`([^`]+)`/g)
  codeSplit.forEach((part, i) => {
    if (i % 2 === 1) {
      out.push(
        <code
          key={`c-${i}`}
          className="rounded bg-forensic-surfaceAlt px-1 py-0.5 font-mono text-[0.875em] text-forensic-primary"
        >
          {part}
        </code>,
      )
      return
    }
    const boldSplit = part.split(/\*\*([^*]+)\*\*/g)
    boldSplit.forEach((p, j) => {
      if (!p) return
      if (j % 2 === 1) {
        out.push(
          <strong key={`b-${i}-${j}`} className="font-semibold text-forensic-text">
            {p}
          </strong>,
        )
      } else {
        out.push(<span key={`t-${i}-${j}`}>{p}</span>)
      }
    })
  })
  return out
}


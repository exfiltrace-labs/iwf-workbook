import { useEffect, type ReactNode } from 'react'
import { Check, X } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { Artifact, HrQuestion, QuestionId, Tag } from '../types'

interface ArtifactSheetProps {
  artifact: Artifact | null
  hrQuestions: HrQuestion[]
  tags: Tag[]
  onChangeTags: (tags: Tag[]) => void
  onClose: () => void
}

/**
 * Slide-in panel that opens when the student clicks an artifact card.
 *
 * Three sections:
 *   1. What this artifact is - plain-English explanation
 *   2. The data - the simplified rows
 *   3. Questions to ask - prompts to evaluate relevance
 *
 * Then the tagging row at the bottom: multi-select Q1/Q2/Q3 plus a
 * mutually-exclusive "Not relevant" toggle that clears the others.
 *
 * We render a custom right-side overlay rather than reuse the shared Sheet
 * primitive so the panel sits over the SPA workspace without any portal
 * coordination, and so we can press it against the right edge of the
 * lab page area instead of the viewport.
 */
export function ArtifactSheet({
  artifact,
  hrQuestions,
  tags,
  onChangeTags,
  onClose,
}: ArtifactSheetProps) {
  useEffect(() => {
    if (!artifact) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [artifact, onClose])

  if (!artifact) return null

  const setAside = tags.includes('not-relevant')

  const toggleQuestion = (qid: QuestionId) => {
    const next = tags.filter((t) => t !== 'not-relevant')
    if (next.includes(qid)) {
      onChangeTags(next.filter((t) => t !== qid))
    } else {
      onChangeTags([...next, qid])
    }
  }

  const toggleSetAside = () => {
    if (setAside) {
      onChangeTags([])
    } else {
      onChangeTags(['not-relevant'])
    }
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={`Artifact: ${artifact.name}`}
      className="absolute inset-0 z-30 flex"
      onClick={onClose}
    >
      <div className="hidden flex-1 bg-stone-900/30 backdrop-blur-sm sm:block" />
      <div
        onClick={(e) => e.stopPropagation()}
        className="flex h-full w-full flex-col border-l border-forensic-border bg-forensic-surface shadow-lab-md animate-in slide-in-from-right sm:max-w-[38rem]"
      >
        {/* Header */}
        <div className="flex items-start justify-between gap-3 border-b border-forensic-border px-6 py-4">
          <div className="min-w-0 flex-1">
            <h2 className="text-[17px] font-semibold leading-tight text-forensic-text">
              {artifact.name}
            </h2>
            <p className="mt-1 text-[13px] text-forensic-textMuted">
              {artifact.technicalName}
              {artifact.timestamp && (
                <>
                  <span aria-hidden="true" className="px-2 text-forensic-border">·</span>
                  <span className="font-mono">{artifact.timestamp}</span>
                </>
              )}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-md p-1.5 text-forensic-textMuted transition-colors hover:bg-forensic-surfaceAlt hover:text-forensic-text focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-forensic-primary/30"
            aria-label="Close artifact"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Scrollable body. Wrapped in a relative container so the bottom
            fade overlay can sit just above the tag-controls panel and
            subtly hint that there's more content to scroll. */}
        <div className="relative min-h-0 flex-1">
          <div className="h-full overflow-y-auto">
            <Section label="What this artifact is">
              <p className="text-[14.5px] leading-relaxed text-forensic-text/90">
                {artifact.whatIsThis}
              </p>
            </Section>

            <Section label="Why it matters">
              <p className="text-[14.5px] leading-relaxed text-forensic-text/90">
                {artifact.whyItMatters}
              </p>
            </Section>

            <Section label="The data">
              <dl className="space-y-2.5 sm:grid sm:grid-cols-[8.5rem_minmax(0,1fr)] sm:gap-x-5 sm:gap-y-2 sm:space-y-0">
                {artifact.data.map((row) => (
                  <div key={row.label} className="sm:contents">
                    <dt className="text-[13px] text-forensic-textMuted">{row.label}</dt>
                    <dd
                      className={cn(
                        'break-words text-[14px] text-forensic-text',
                        row.mono && 'font-mono text-[13.5px]',
                      )}
                    >
                      {row.value}
                    </dd>
                  </div>
                ))}
              </dl>
            </Section>

            <Section label="Questions to ask">
              <ul className="list-disc space-y-2 pl-5 text-[14.5px] leading-relaxed text-forensic-text/90 marker:text-forensic-textDim">
                {artifact.promptQuestions.map((q, i) => (
                  <li key={i}>{q}</li>
                ))}
              </ul>
            </Section>
          </div>
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-x-0 bottom-0 h-3 bg-gradient-to-t from-forensic-surface to-transparent"
          />
        </div>

        {/* Tag controls. The whole section sits on a slightly darker
            surface than the artifact body above so it reads as its own
            "input" panel rather than a continuation of the read-only data. */}
        <div className="border-t border-forensic-border bg-forensic-surfaceAlt px-6 py-4">
          <h3 className="text-[14px] font-semibold text-forensic-text">
            Mark this artifact
          </h3>
          <p className="pb-3 pt-0.5 text-[12.5px] text-forensic-textMuted">
            Tag the question(s) this artifact helps answer.
          </p>
          <div className="space-y-1.5">
            {hrQuestions.map((q) => {
              const active = tags.includes(q.id)
              return (
                <button
                  key={q.id}
                  type="button"
                  onClick={() => toggleQuestion(q.id)}
                  className={cn(
                    'flex w-full items-center gap-3 rounded-md border px-3 py-2.5 text-left transition-colors',
                    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-forensic-primary/30',
                    active
                      ? 'border-forensic-primary bg-forensic-primarySoft/60'
                      : 'border-forensic-border bg-forensic-surface hover:border-forensic-primary/40 hover:bg-forensic-primarySoft/30',
                  )}
                >
                  <span
                    aria-hidden="true"
                    className={cn(
                      'flex h-4 w-4 flex-none items-center justify-center rounded border',
                      active
                        ? 'border-forensic-primary bg-forensic-primary text-white'
                        : 'border-forensic-borderBright bg-forensic-surface',
                    )}
                  >
                    {active && <Check className="h-3 w-3" strokeWidth={3} />}
                  </span>
                  <span className="min-w-0 flex-1 text-[13px] leading-snug text-forensic-text">
                    <span className="font-semibold text-forensic-primary">{q.shortLabel}.</span>{' '}
                    {q.text}
                  </span>
                </button>
              )
            })}
            <button
              type="button"
              onClick={toggleSetAside}
              className={cn(
                'flex w-full items-center gap-3 rounded-md border px-3 py-2.5 text-left transition-colors',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-forensic-primary/30',
                setAside
                  ? 'border-forensic-primary bg-forensic-primarySoft/60'
                  : 'border-forensic-border bg-forensic-surface hover:border-forensic-primary/40 hover:bg-forensic-primarySoft/30',
              )}
            >
              <span
                aria-hidden="true"
                className={cn(
                  'flex h-4 w-4 flex-none items-center justify-center rounded border',
                  setAside
                    ? 'border-forensic-primary bg-forensic-primary text-white'
                    : 'border-forensic-borderBright bg-forensic-surface',
                )}
              >
                {setAside && <Check className="h-3 w-3" strokeWidth={3} />}
              </span>
              <span className="min-w-0 flex-1 text-[13px] leading-snug text-forensic-text">
                <span className="font-semibold">Not relevant.</span>{' '}
                This artifact does not help answer any of the questions above.
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

function Section({ label, children }: { label: string; children: ReactNode }) {
  return (
    <section className="border-b border-forensic-border/60 px-6 py-4 last:border-b-0">
      <h3 className="pb-2 text-[15px] font-semibold text-forensic-text">{label}</h3>
      {children}
    </section>
  )
}

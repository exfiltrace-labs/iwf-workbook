import { ChevronLeft, RotateCcw, CheckCircle2, AlertTriangle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import type { CustodyCase, CustodyEvent, CustodyState, FieldDef } from '../types'
import { isFieldCorrect } from '../useCustodyState'

interface DebriefProps {
  caseData: CustodyCase
  state: CustodyState
  score: { correct: number; total: number }
  onReplay: () => void
  onExit: () => void
}

const PASS_THRESHOLD = 0.8

/**
 * Post-submit feedback view. Renders a pass/fail banner at the top with
 * the per-field score, then walks through every transfer row showing
 * which fields the student got right (green) and which were wrong (red,
 * with the expected answer shown beside).
 */
export function Debrief({ caseData, state, score, onReplay, onExit }: DebriefProps) {
  const passThreshold = Math.ceil(score.total * PASS_THRESHOLD)
  const passed = score.correct / score.total >= PASS_THRESHOLD

  return (
    <div className="flex h-full min-h-0 flex-col overflow-y-auto bg-forensic-bg">
      <div className="mx-auto w-full max-w-4xl px-6 py-8">
        <div className="mb-6 flex flex-wrap items-start justify-between gap-3">
          <div>
            <h1 className="text-[24px] font-bold leading-tight tracking-tight text-forensic-text">
              Chain of custody review
            </h1>
            <p className="mt-1 text-[14px] text-forensic-textMuted">
              {score.correct} of {score.total} fields correct.
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
          <div className="flex items-start gap-3">
            <span
              className={cn(
                'mt-0.5 flex h-6 w-6 flex-none items-center justify-center rounded-full text-white',
                passed ? 'bg-emerald-600' : 'bg-amber-600',
              )}
            >
              {passed ? (
                <CheckCircle2 className="h-4 w-4" />
              ) : (
                <AlertTriangle className="h-4 w-4" />
              )}
            </span>
            <div className="min-w-0 flex-1">
              <h2
                className={cn(
                  'text-[16px] font-semibold leading-snug',
                  passed ? 'text-emerald-800' : 'text-amber-900',
                )}
              >
                {passed ? 'Lab complete' : 'Not quite'}
              </h2>
              <p
                className={cn(
                  'pt-1 text-[13.5px] leading-relaxed',
                  passed ? 'text-emerald-900/85' : 'text-amber-900/85',
                )}
              >
                {passed
                  ? `You got ${score.correct} of ${score.total} fields correct. You can replay to chase the fields you missed without losing your completion, or click Start over to wipe everything and run the case fresh.`
                  : `You got ${score.correct} of ${score.total} fields correct, below the ${passThreshold}-of-${score.total} pass mark. Review the per-field notes below, then replay when you are ready.`}
              </p>
            </div>
          </div>
        </section>

        {/* Per-row review */}
        <section className="space-y-4">
          {caseData.events.map((event) => (
            <RowReview
              key={event.id}
              event={event}
              values={state.fieldValues[event.id] ?? {}}
            />
          ))}
        </section>

        <div className="mt-8 flex justify-end gap-2">
          <Button variant="outline" size="sm" onClick={onExit}>
            <ChevronLeft className="h-4 w-4" />
            Back to brief
          </Button>
          <Button variant="default" size="sm" onClick={onReplay}>
            <RotateCcw className="h-4 w-4" />
            Replay this lab
          </Button>
        </div>
      </div>
    </div>
  )
}

function RowReview({
  event,
  values,
}: {
  event: CustodyEvent
  values: Record<string, string>
}) {
  const wrongCount = event.fields.filter(
    (f) => !isFieldCorrect(f, values[f.id] ?? ''),
  ).length
  const allCorrect = wrongCount === 0
  return (
    <article
      className={cn(
        'rounded-xl border bg-forensic-surface px-5 py-4 shadow-lab-sm',
        allCorrect ? 'border-forensic-border' : 'border-amber-200',
      )}
    >
      <header className="flex items-center gap-3 pb-3">
        <span
          className={cn(
            'flex h-7 w-7 flex-none items-center justify-center rounded-full text-[12px] font-bold text-white',
            allCorrect ? 'bg-emerald-600' : 'bg-amber-600',
          )}
        >
          {event.step}
        </span>
        <h3 className="min-w-0 flex-1 text-[15px] font-semibold leading-tight text-forensic-text">
          {event.title}
        </h3>
        <span
          className={cn(
            'flex-none text-[12px] font-semibold',
            allCorrect ? 'text-emerald-700' : 'text-amber-800',
          )}
        >
          {event.fields.length - wrongCount}/{event.fields.length} correct
        </span>
      </header>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {event.fields.map((field) => (
          <FieldReview
            key={field.id}
            field={field}
            value={values[field.id] ?? ''}
          />
        ))}
      </div>
    </article>
  )
}

function FieldReview({ field, value }: { field: FieldDef; value: string }) {
  const correct = isFieldCorrect(field, value)
  return (
    <div
      className={cn(
        'rounded-md border px-3 py-2 text-[12.5px]',
        correct ? 'border-emerald-200 bg-emerald-50/60' : 'border-rose-200 bg-rose-50/60',
      )}
    >
      <div className="flex items-baseline justify-between gap-2">
        <span className="font-medium text-forensic-textMuted">{field.label}</span>
        <span
          className={cn(
            'text-[11px] font-semibold uppercase tracking-wider',
            correct ? 'text-emerald-700' : 'text-rose-700',
          )}
        >
          {correct ? 'Correct' : 'Not correct'}
        </span>
      </div>
      <p
        className={cn(
          'pt-1 break-words text-[13px] text-forensic-text',
          field.id.toLowerCase().includes('sha') && 'font-mono text-[12px]',
        )}
      >
        <span className="text-forensic-textMuted">You entered: </span>
        {value || <span className="italic text-forensic-textDim">(blank)</span>}
      </p>
      {!correct && (
        <p
          className={cn(
            'pt-1 break-words text-[13px] text-emerald-800',
            field.id.toLowerCase().includes('sha') && 'font-mono text-[12px]',
          )}
        >
          <span className="font-medium">Expected: </span>
          {field.correct}
        </p>
      )}
    </div>
  )
}

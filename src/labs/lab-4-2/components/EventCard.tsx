import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'
import type { CustodyEvent } from '../types'

interface EventCardProps {
  event: CustodyEvent
  active: boolean
  filledCount: number
  totalFields: number
  onClick: () => void
}

/**
 * One event in the scenario timeline. Click to mark this event active,
 * which highlights the matching transfer row in the form pane.
 *
 * Shows a small "n/N filled" indicator so the student can scan which
 * rows still need attention.
 *
 * Narrative paragraphs support inline `code` and **bold** so timestamps,
 * names, and identifiers (hashes, evidence tags, serial numbers) read as
 * the typographic objects they are. Long unbroken tokens (long hex
 * hashes, file paths) wrap inside the card via overflow-wrap so they
 * never spill out of the panel.
 */
export function EventCard({
  event,
  active,
  filledCount,
  totalFields,
  onClick,
}: EventCardProps) {
  const complete = filledCount === totalFields
  return (
    <button
      type="button"
      onClick={(e) => {
        // If the student is actively selecting text inside the card
        // (to copy a hash, an evidence tag, a serial number), treat the
        // mouseup as a selection gesture, not a card click. Without
        // this, the click handler would steal focus and collapse the
        // selection at the moment they release the mouse.
        const selection = window.getSelection()
        if (selection && selection.toString().length > 0) {
          e.preventDefault()
          return
        }
        onClick()
      }}
      data-scenario-event-id={event.id}
      className={cn(
        'group flex w-full flex-col gap-2 rounded-lg border px-4 py-3 text-left transition-colors',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-forensic-primary/30',
        active
          ? 'border-forensic-primary bg-forensic-primarySoft/40 shadow-lab-sm'
          : 'border-forensic-border bg-forensic-surface hover:border-forensic-primary/40 hover:bg-forensic-surfaceAlt/40',
      )}
    >
      <div className="flex items-center gap-3">
        <span
          className={cn(
            'flex h-7 w-7 flex-none items-center justify-center rounded-full text-[12px] font-bold',
            active
              ? 'bg-forensic-primary text-white'
              : complete
                ? 'bg-emerald-100 text-emerald-700'
                : 'bg-forensic-surfaceAlt text-forensic-text',
          )}
        >
          {event.step}
        </span>
        <span className="min-w-0 flex-1 text-[16px] font-semibold leading-tight text-forensic-text">
          {event.title}
        </span>
        <span
          className={cn(
            'flex-none text-[11px] font-semibold tabular-nums',
            complete ? 'text-emerald-700' : 'text-forensic-textMuted',
          )}
        >
          {filledCount}/{totalFields}
        </span>
      </div>
      <div className="select-text space-y-2 [overflow-wrap:anywhere] text-[15px] leading-relaxed text-forensic-text/85">
        {event.narrative.map((paragraph, i) => (
          <p key={i}>{renderInline(paragraph)}</p>
        ))}
      </div>
    </button>
  )
}

/**
 * Tiny inline-markdown renderer. Splits text on `code spans` and **bold**
 * markers and returns React nodes. Code spans render in a monospace font
 * with a subtle background tint so identifiers stand out without looking
 * like body text.
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

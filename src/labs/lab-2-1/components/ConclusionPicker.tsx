import { Check } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { ConclusionChoice } from '../types'

interface ConclusionPickerProps {
  choices: ConclusionChoice[]
  selectedId: string | null
  disabled: boolean
  disabledMessage: string
  onSelect: (choiceId: string) => void
}

/**
 * Multiple-choice control for the student's per-question conclusion.
 *
 * Each option is a click-target card. Until the question has at least
 * one tagged finding, the picker is disabled with a hint.
 */
export function ConclusionPicker({
  choices,
  selectedId,
  disabled,
  disabledMessage,
  onSelect,
}: ConclusionPickerProps) {
  if (disabled) {
    return (
      <div className="rounded-lg border border-dashed border-forensic-border bg-forensic-surfaceAlt/30 px-4 py-3 text-[13.5px] italic text-forensic-textMuted">
        {disabledMessage}
      </div>
    )
  }

  return (
    <div className="space-y-2">
      {choices.map((choice) => {
        const active = choice.id === selectedId
        return (
          <button
            key={choice.id}
            type="button"
            onClick={() => onSelect(choice.id)}
            className={cn(
              'group flex w-full items-start gap-3 rounded-lg border px-4 py-3 text-left transition-colors',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-forensic-primary/30',
              active
                ? 'border-forensic-primary bg-forensic-primarySoft/60 shadow-lab-sm'
                : 'border-forensic-border bg-forensic-surface hover:border-forensic-primary/40 hover:bg-forensic-surfaceAlt/40',
            )}
          >
            <span
              aria-hidden="true"
              className={cn(
                'mt-0.5 flex h-4 w-4 flex-none items-center justify-center rounded-full border',
                active
                  ? 'border-forensic-primary bg-forensic-primary text-white'
                  : 'border-forensic-borderBright bg-forensic-surface',
              )}
            >
              {active && <Check className="h-3 w-3" strokeWidth={3} />}
            </span>
            <span className="text-[14px] leading-relaxed text-forensic-text">{choice.label}</span>
          </button>
        )
      })}
    </div>
  )
}

import { ChevronLeft, RotateCcw, Send, Lock } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import type { CustodyCase } from '../types'

interface CustodyHeaderProps {
  caseData: CustodyCase
  canSubmit: boolean
  blockedReason: string | null
  submitted: boolean
  onExit: () => void
  onReset: () => void
  onSubmit: () => void
}

/**
 * Top bar of the Custody SPA. Mirrors the InvestigationHeader pattern
 * from Lab 2.1: case title and suspect on the left; Back-to-brief,
 * Start over, and Submit on the right. The Submit button hides itself
 * once the student has submitted.
 */
export function CustodyHeader({
  caseData,
  canSubmit,
  blockedReason,
  submitted,
  onExit,
  onReset,
  onSubmit,
}: CustodyHeaderProps) {
  return (
    <header className="flex flex-wrap items-center justify-between gap-3 border-b border-forensic-border bg-forensic-surface px-6 py-3 shadow-lab-sm">
      <div className="min-w-0">
        <h1 className="text-[16px] font-semibold leading-tight text-forensic-text">
          {caseData.scenario.title}
        </h1>
        <p className="text-[13px] text-forensic-textMuted">
          Suspect: <span className="font-medium text-forensic-text">{caseData.scenario.suspect}</span>
        </p>
      </div>
      <div className="flex flex-none items-center gap-2">
        <Button variant="outline" size="sm" onClick={onExit} title="Return to the lab brief">
          <ChevronLeft className="h-4 w-4" />
          Back to brief
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={onReset}
          title="Wipe all entries and any earned completion"
        >
          <RotateCcw className="h-4 w-4" />
          Start over
        </Button>
        {!submitted && (
          <span title={!canSubmit && blockedReason ? blockedReason : undefined}>
            <Button
              variant="default"
              size="sm"
              onClick={onSubmit}
              disabled={!canSubmit}
              className={cn(!canSubmit && 'cursor-not-allowed')}
            >
              {canSubmit ? <Send className="h-4 w-4" /> : <Lock className="h-4 w-4" />}
              Submit
            </Button>
          </span>
        )}
      </div>
    </header>
  )
}

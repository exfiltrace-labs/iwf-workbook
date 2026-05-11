import { ChevronLeft, RotateCcw, Send, Lock } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import type { CaseData } from '../types'

interface InvestigationHeaderProps {
  caseData: CaseData
  canSubmit: boolean
  blockedReason: string | null
  /** Hides the Submit button once the student has already submitted. */
  submitted: boolean
  onExit: () => void
  onReset: () => void
  onSubmit: () => void
}

/**
 * Top bar of the Investigation SPA. A thin chrome strip: case title on
 * the left, the three workspace actions on the right. The HR questions
 * are intentionally not duplicated here since they are already visible
 * as the worksheet headings on the right pane.
 */
export function InvestigationHeader({
  caseData,
  canSubmit,
  blockedReason,
  submitted,
  onExit,
  onReset,
  onSubmit,
}: InvestigationHeaderProps) {
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
          title="Clear all tags, conclusions, and viewed-state"
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

import { CheckCircle2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useLabProgress } from '@/hooks/useLabProgress'

interface LabProgressBadgeProps {
  questionIds: string[]
  /** Visual variant. "dark" suits the navbar dropdown; "light" suits cards. */
  variant?: 'light' | 'dark'
  className?: string
}

/**
 * Tiny pill that reports `answered / total` for a lab. Hidden entirely when
 * the lab declares no questions, and switches to a solid green "complete"
 * style once every question is answered.
 */
export function LabProgressBadge({
  questionIds,
  variant = 'light',
  className,
}: LabProgressBadgeProps) {
  const { answered, total } = useLabProgress(questionIds)
  if (total === 0) return null

  const complete = answered === total

  if (variant === 'dark') {
    return (
      <span
        className={cn(
          'inline-flex items-center gap-1 rounded-full px-1.5 py-0.5 text-[10px] font-semibold tabular-nums',
          complete
            ? 'bg-emerald-500/20 text-emerald-300'
            : 'bg-white/10 text-zinc-300',
          className,
        )}
        title={`${answered} of ${total} questions answered`}
      >
        {complete && <CheckCircle2 className="h-2.5 w-2.5" />}
        {answered}/{total}
      </span>
    )
  }

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[11px] font-semibold tabular-nums',
        complete
          ? 'border-emerald-300 bg-emerald-50 text-emerald-700'
          : 'border-forensic-border bg-forensic-surfaceAlt/60 text-forensic-textMuted',
        className,
      )}
      title={`${answered} of ${total} questions answered`}
    >
      {complete && <CheckCircle2 className="h-3 w-3" />}
      {answered}/{total}
    </span>
  )
}

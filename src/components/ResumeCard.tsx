import { Link } from 'react-router-dom'
import { ArrowRight, Clock, CheckCircle2 } from 'lucide-react'
import { getLab } from '@/labs/registry'
import { useRecentLab } from '@/hooks/useRecentLab'
import { useLabProgress } from '@/hooks/useLabProgress'

/**
 * "Resume where you left off" card for the home page. Renders nothing if
 * the student has not visited any lab yet, so the home page stays clean
 * on first run. Wrapped in `not-prose` because it lives inside the MDX
 * prose column where the typography theme would otherwise reformat it.
 */
export function ResumeCard() {
  const recent = useRecentLab()
  const lab = recent ? getLab(recent.id) : undefined
  const { answered, total } = useLabProgress(lab?.questionIds ?? [])

  if (!lab) return null

  const complete = total > 0 && answered === total
  const visited = recent ? new Date(recent.visitedAt) : null
  const visitedLabel = visited ? formatRelative(visited) : null

  return (
    <div className="not-prose mt-6">
      <Link
        to={`/labs/${lab.id}`}
        className="group flex items-stretch gap-4 overflow-hidden rounded-xl border border-forensic-primary/25 bg-gradient-to-r from-forensic-primary/5 via-transparent to-transparent p-5 shadow-lab-sm transition-colors hover:border-forensic-primary/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-forensic-primary/30"
      >
        <div className="flex items-center">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-forensic-primary/10 text-forensic-primary">
            <Clock className="h-5 w-5" />
          </div>
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-forensic-textMuted">
            Resume where you left off
          </p>
          <p className="mt-0.5 truncate text-base font-semibold text-forensic-text">
            {lab.labNumber} <span className="text-forensic-border">·</span>{' '}
            {lab.title}
          </p>
          <p className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-[12px] text-forensic-textMuted">
            {visitedLabel && <span>Last opened {visitedLabel}</span>}
            {total > 0 && (
              <span className="inline-flex items-center gap-1">
                {complete && <CheckCircle2 className="h-3 w-3 text-emerald-500" />}
                {answered} of {total} questions answered
              </span>
            )}
          </p>
        </div>
        <div className="flex items-center">
          <ArrowRight className="h-5 w-5 flex-none text-forensic-textMuted transition-all group-hover:translate-x-0.5 group-hover:text-forensic-primary" />
        </div>
      </Link>
    </div>
  )
}

/** "5 minutes ago" / "yesterday" / "Apr 8". Keeps it human without a date lib. */
function formatRelative(then: Date): string {
  const now = Date.now()
  const diff = Math.max(0, now - then.getTime())
  const minute = 60 * 1000
  const hour = 60 * minute
  const day = 24 * hour

  if (diff < minute) return 'just now'
  if (diff < hour) {
    const m = Math.floor(diff / minute)
    return `${m} minute${m === 1 ? '' : 's'} ago`
  }
  if (diff < day) {
    const h = Math.floor(diff / hour)
    return `${h} hour${h === 1 ? '' : 's'} ago`
  }
  if (diff < 2 * day) return 'yesterday'
  if (diff < 7 * day) {
    const d = Math.floor(diff / day)
    return `${d} days ago`
  }
  return then.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
}

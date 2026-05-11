import { Link } from 'react-router-dom'
import { ArrowRight, Beaker, CheckCircle2, FileText } from 'lucide-react'
import { LAB_GROUPS } from '@/labs/registry'
import { Badge } from '@/components/ui/badge'
import { LabProgressBadge } from '@/components/LabProgressBadge'

/**
 * Per-lab completion flag for interactive labs. Each interactive lab
 * writes `lab-<id>:completed = '1'` to localStorage when its own pass
 * criteria are met. Read at render time; refreshes naturally on
 * navigation. Returns false on the server or when localStorage is
 * unavailable.
 */
function isInteractiveLabCompleted(labId: string): boolean {
  if (typeof window === 'undefined') return false
  try {
    return window.localStorage.getItem(`${labId}:completed`) === '1'
  } catch {
    return false
  }
}

/**
 * Grid of every lab in the registry, grouped by module. Designed to be
 * dropped into the home MDX so it appears inside the workbook article and
 * gets picked up by the auto-generated table of contents.
 *
 * Wrapped in `not-prose` so the prose theme styles do not apply, then we
 * style each card explicitly.
 */
export function LabGrid() {
  return (
    <div className="not-prose mt-6 space-y-8">
      {LAB_GROUPS.map((group) => (
        <div key={group.module.id}>
          <h3 className="text-[11px] font-semibold uppercase tracking-[0.16em] text-forensic-textMuted">
            {group.module.label}
          </h3>
          <ul className="mt-3 space-y-2">
            {group.labs.map((lab) => (
              <li key={lab.id}>
                <Link
                  to={`/labs/${lab.id}`}
                  className="group flex items-center gap-4 rounded-md border border-forensic-border bg-forensic-surface px-4 py-3 transition-colors hover:border-forensic-primary/40 hover:bg-forensic-surfaceAlt/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-forensic-primary/30"
                >
                  <div className="flex flex-none items-center gap-2">
                    <Badge variant="outline">{lab.labNumber}</Badge>
                    {lab.isInteractive ? (
                      <span
                        className="inline-flex items-center gap-1 text-[11px] font-semibold text-forensic-primary"
                        title="Interactive lab"
                      >
                        <Beaker className="h-3 w-3" />
                      </span>
                    ) : (
                      <span
                        className="inline-flex items-center gap-1 text-[11px] font-semibold text-forensic-textMuted"
                        title="Lab writeup"
                      >
                        <FileText className="h-3 w-3" />
                      </span>
                    )}
                  </div>
                  <div className="min-w-0 flex-1 truncate text-[14px] font-semibold leading-snug text-forensic-text">
                    {lab.title}
                  </div>
                  <div className="flex flex-none items-center gap-2">
                    {lab.isInteractive && isInteractiveLabCompleted(lab.id) ? (
                      <span
                        className="inline-flex items-center gap-1 rounded-full border border-emerald-300 bg-emerald-50 px-2 py-0.5 text-[11px] font-semibold text-emerald-700"
                        title="Lab complete"
                      >
                        <CheckCircle2 className="h-3 w-3" />
                        Complete
                      </span>
                    ) : (
                      <LabProgressBadge questionIds={lab.questionIds} />
                    )}
                    <ArrowRight className="h-4 w-4 flex-none text-forensic-textMuted transition-colors group-hover:text-forensic-primary" />
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  )
}

import { Link, useLocation } from 'react-router-dom'
import { ArrowLeft, FileQuestion } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { PageTransition } from '@/components/PageTransition'

/**
 * Lives inside the persistent `LabShell`, so the dark nav bar stays
 * visible. The card itself echoes the workbook header styling (rounded,
 * bordered, soft shadow) so a stale URL feels like landing on an empty
 * page rather than a system error.
 */
export function NotFoundPage() {
  const location = useLocation()
  return (
    <PageTransition>
      <div className="flex h-full w-full items-center justify-center overflow-y-auto bg-forensic-bg px-6 py-12">
        <div className="w-full max-w-lg rounded-xl border border-forensic-border bg-forensic-surfaceAlt/50 px-6 py-8 text-center shadow-lab-sm">
          <div className="mx-auto mb-4 inline-flex h-12 w-12 items-center justify-center rounded-full border border-forensic-border bg-forensic-surface text-forensic-textMuted">
            <FileQuestion className="h-6 w-6" />
          </div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-forensic-textMuted">
            404
          </p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight text-balance text-forensic-text">
            Page not found
          </h1>
          <p className="mt-3 text-[15px] leading-relaxed text-forensic-text/80">
            We couldn't find anything at{' '}
            <code className="rounded bg-forensic-surfaceAlt px-1 py-0.5 text-[13px] text-forensic-primary">
              {location.pathname}
            </code>
            . The lab may have been renamed, or the link may be out of date.
          </p>
          <div className="mt-6 flex justify-center">
            <Button asChild>
              <Link to="/">
                <ArrowLeft className="h-3.5 w-3.5" />
                Back to course home
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </PageTransition>
  )
}

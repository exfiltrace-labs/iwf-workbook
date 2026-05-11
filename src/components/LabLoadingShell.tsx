import { Loader2 } from 'lucide-react'

interface LabLoadingShellProps {
  /** Optional label, e.g. the lab title, shown beneath the spinner. */
  label?: string
}

/**
 * Lightweight loading state shown while a lazy-loaded lab chunk is being
 * fetched. Sits inside the existing `LabShell` so the dark navbar stays
 * visible the whole time, and centers a spinner in the same scrollable
 * area `LabWorkbook` would otherwise paint into. The fallback is brief
 * once the chunk is cached, so we deliberately keep it understated to
 * avoid flashing skeleton blocks on every navigation.
 */
export function LabLoadingShell({ label }: LabLoadingShellProps) {
  return (
    <div
      role="status"
      aria-live="polite"
      aria-busy="true"
      className="flex h-full w-full items-center justify-center bg-forensic-bg"
    >
      <div className="flex flex-col items-center gap-3 text-forensic-textMuted">
        <Loader2 className="h-6 w-6 animate-spin text-forensic-primary" />
        <span className="text-[12px] font-medium">
          {label ? `Loading ${label}...` : 'Loading lab...'}
        </span>
      </div>
    </div>
  )
}

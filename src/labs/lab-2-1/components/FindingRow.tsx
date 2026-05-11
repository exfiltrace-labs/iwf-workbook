import { X } from 'lucide-react'
import type { Artifact } from '../types'

interface FindingRowProps {
  artifact: Artifact
  onOpen: () => void
  onUntag: () => void
}

/**
 * One tagged-artifact entry inside a Worksheet question section.
 * Click the body to re-open the artifact sheet, or click the small X
 * to remove the tag.
 */
export function FindingRow({ artifact, onOpen, onUntag }: FindingRowProps) {
  return (
    <li className="group flex items-center gap-2 rounded-md border border-forensic-border bg-forensic-surface px-3 py-2.5 shadow-lab-sm transition-colors hover:border-forensic-primary/40">
      <button
        type="button"
        onClick={onOpen}
        className="min-w-0 flex-1 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-forensic-primary/30"
      >
        <div className="text-[14px] font-semibold leading-snug text-forensic-text">
          {artifact.name}
        </div>
        <div className="mt-0.5 flex flex-wrap items-baseline gap-x-2 text-[12px] text-forensic-textMuted">
          <span>{artifact.technicalName}</span>
          {artifact.timestamp && (
            <span className="font-mono text-[11.5px] text-forensic-textDim">
              {artifact.timestamp}
            </span>
          )}
        </div>
      </button>
      <button
        type="button"
        onClick={onUntag}
        aria-label={`Remove ${artifact.name} from this question`}
        className="flex-none rounded-md p-1.5 text-forensic-textDim transition-colors hover:bg-forensic-surfaceAlt hover:text-rose-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-300/40"
        title="Remove from this question"
      >
        <X className="h-4 w-4" />
      </button>
    </li>
  )
}

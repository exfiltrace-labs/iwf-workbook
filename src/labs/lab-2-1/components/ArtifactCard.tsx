import { Eye } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { Artifact, QuestionId, Tag } from '../types'

const TAG_LABEL: Record<QuestionId, string> = {
  q1: 'Q1',
  q2: 'Q2',
  q3: 'Q3',
  q4: 'Q4',
}

interface ArtifactCardProps {
  artifact: Artifact
  viewed: boolean
  tags: Tag[]
  onClick: () => void
}

/**
 * One artifact tile rendered inside a stack in the left rail.
 *
 * Conveys three pieces of state at a glance:
 *  - viewed (clicked open at least once): subtle dim + eye icon
 *  - tagged to question(s): colored Q pills along the bottom
 *  - tagged not-relevant: dimmed, "set aside" label
 */
export function ArtifactCard({ artifact, viewed, tags, onClick }: ArtifactCardProps) {
  const setAside = tags.includes('not-relevant')
  const questionTags = tags.filter((t): t is QuestionId => t !== 'not-relevant')

  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'group relative flex w-full flex-col gap-1.5 rounded-lg border px-3 py-2.5 text-left transition-colors',
        'border-forensic-border bg-forensic-surface hover:border-forensic-primary/40 hover:bg-forensic-surfaceAlt/60',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-forensic-primary/30',
        viewed && !setAside && questionTags.length === 0 && 'opacity-80',
        setAside && 'opacity-50 saturate-50',
        questionTags.length > 0 && 'border-forensic-primary/40 bg-forensic-primarySoft/40',
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <div className="text-[14px] font-semibold leading-snug text-forensic-text">
            {artifact.name}
          </div>
          <div className="mt-1 flex flex-wrap items-baseline gap-x-2 text-[12px] text-forensic-textMuted">
            <span className="font-medium">{artifact.technicalName}</span>
            {artifact.timestamp && (
              <span className="font-mono text-[11.5px] text-forensic-textDim">
                {artifact.timestamp}
              </span>
            )}
          </div>
        </div>
        {viewed && (
          <Eye
            aria-label="Viewed"
            className="h-3.5 w-3.5 flex-none text-forensic-textDim group-hover:text-forensic-textMuted"
          />
        )}
      </div>

      {(questionTags.length > 0 || setAside) && (
        <div className="flex flex-wrap items-center gap-1 pt-0.5">
          {questionTags.map((t) => (
            <span
              key={t}
              className="rounded bg-forensic-primary/12 px-1.5 py-0.5 text-[11.5px] font-bold text-forensic-primary"
            >
              {TAG_LABEL[t]}
            </span>
          ))}
          {setAside && (
            <span className="text-[12px] italic text-forensic-textMuted">Not relevant</span>
          )}
        </div>
      )}
    </button>
  )
}

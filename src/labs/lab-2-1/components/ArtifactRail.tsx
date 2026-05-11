import { ArtifactCard } from './ArtifactCard'
import type { Artifact, ArtifactStack, Tag } from '../types'

interface ArtifactRailProps {
  stacks: ArtifactStack[]
  artifacts: Artifact[]
  viewedIds: string[]
  tagsByArtifact: Record<string, Tag[]>
  onOpenArtifact: (artifactId: string) => void
}

/**
 * Left pane of the Investigation workspace. Renders artifact cards
 * grouped into stacks (categories), each stack with a clear heading.
 * Stacks are statically open. The lab is small enough that hiding any
 * of them would just create extra clicks without aiding triage.
 */
export function ArtifactRail({
  stacks,
  artifacts,
  viewedIds,
  tagsByArtifact,
  onOpenArtifact,
}: ArtifactRailProps) {
  return (
    <aside className="flex h-full min-h-0 w-full flex-col border-r border-forensic-border bg-forensic-surfaceAlt/30">
      <div className="border-b border-forensic-border bg-forensic-surface/50 px-5 py-3">
        <h2 className="text-[15px] font-semibold leading-tight text-forensic-text">
          Workstation artifacts
        </h2>
        <p className="text-[12.5px] text-forensic-textMuted">
          Click any item to read its data and tag it.
        </p>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto px-4 py-4">
        {stacks.map((stack) => {
          const stackArtifacts = artifacts.filter((a) => a.stackId === stack.id)
          if (stackArtifacts.length === 0) return null
          return (
            <section key={stack.id} className="mb-5 last:mb-0">
              <h3 className="mb-2 px-1 text-[13.5px] font-semibold text-forensic-text">
                {stack.label}
              </h3>
              <div className="space-y-1.5">
                {stackArtifacts.map((artifact) => (
                  <ArtifactCard
                    key={artifact.id}
                    artifact={artifact}
                    viewed={viewedIds.includes(artifact.id)}
                    tags={tagsByArtifact[artifact.id] ?? []}
                    onClick={() => onOpenArtifact(artifact.id)}
                  />
                ))}
              </div>
            </section>
          )
        })}
      </div>
    </aside>
  )
}

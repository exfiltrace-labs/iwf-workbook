import { useEffect, useMemo, useState, type ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'
import { Files, ClipboardList } from 'lucide-react'
import { cn } from '@/lib/utils'
import { emitLabProgress } from '@/hooks/useReactiveLocalStorage'
import { CASE } from './case'
import { COMPLETED_KEY, isLabPassed, useInvestigationState } from './useInvestigationState'
import { InvestigationHeader } from './components/InvestigationHeader'
import { ArtifactRail } from './components/ArtifactRail'
import { Worksheet } from './components/Worksheet'
import { ArtifactSheet } from './components/ArtifactSheet'
import { Debrief } from './components/Debrief'
import type { QuestionId, Tag } from './types'

type MobileTab = 'rail' | 'worksheet'

/**
 * Full-bleed Investigation SPA for Lab 2.1.
 *
 * Mounted at `/labs/lab-2-1/investigate` directly inside `LabShell`'s main
 * region, replacing the usual `LabWorkbook` chrome. State lives in
 * `useInvestigationState` (localStorage-backed), and a single
 * `submittedAt` flag toggles between the workspace view (rail +
 * worksheet) and the Debrief view.
 *
 * Responsive behavior: at `lg` breakpoint and up the rail and worksheet
 * render side by side. Below that they collapse to a tab strip so each
 * pane gets the full width when active.
 */
export default function InvestigationApp() {
  const navigate = useNavigate()
  const { state, markViewed, setTags, setConclusion, submit, reset, resetAll } = useInvestigationState()

  const [openArtifactId, setOpenArtifactId] = useState<string | null>(null)
  const [mobileTab, setMobileTab] = useState<MobileTab>('rail')

  useEffect(() => {
    const previous = document.title
    document.title = 'Lab 2.1 · Investigation'
    return () => {
      document.title = previous
    }
  }, [])

  // Once the student has submitted and meets the pass criteria, write a
  // completion flag to localStorage and fire the cross-component progress
  // signal so the top-nav and home-grid pick it up without a navigation.
  // The flag is intentionally one-way: a later replay does not revoke
  // completion.
  useEffect(() => {
    if (!state.submittedAt) return
    if (!isLabPassed(state, CASE)) return
    try {
      const already = window.localStorage.getItem(COMPLETED_KEY) === '1'
      if (already) return
      window.localStorage.setItem(COMPLETED_KEY, '1')
      emitLabProgress()
    } catch {
      /* ignore */
    }
  }, [state])

  const openArtifact = useMemo(
    () => CASE.artifacts.find((a) => a.id === openArtifactId) ?? null,
    [openArtifactId],
  )

  const handleOpenArtifact = (id: string) => {
    markViewed(id)
    setOpenArtifactId(id)
  }

  const handleChangeTags = (artifactId: string, tags: Tag[]) => {
    setTags(artifactId, tags)
  }

  const handleUntagFromQuestion = (artifactId: string, questionId: QuestionId) => {
    const current = state.artifactTags[artifactId] ?? []
    setTags(
      artifactId,
      current.filter((t) => t !== questionId),
    )
  }

  const handleExit = () => {
    navigate('/labs/lab-2-1')
  }

  const handleReset = () => {
    const ok = window.confirm(
      'Start over? This clears every tag, conclusion, and viewed-state for this investigation, and removes any completion you have already earned.',
    )
    if (!ok) return
    resetAll()
    emitLabProgress()
    setOpenArtifactId(null)
    setMobileTab('rail')
  }

  const handleSubmit = () => {
    setOpenArtifactId(null)
    submit()
  }

  const handleReplay = () => {
    reset()
    setOpenArtifactId(null)
    setMobileTab('rail')
  }

  const { canSubmit, blockedReason } = useMemo(() => {
    for (const q of CASE.hrQuestions) {
      const findings = CASE.artifacts.filter((a) =>
        (state.artifactTags[a.id] ?? []).includes(q.id),
      )
      if (findings.length < 2) {
        return {
          canSubmit: false,
          blockedReason: `Tag at least two artifacts to ${q.shortLabel} before submitting.`,
        }
      }
      if (state.conclusions[q.id] == null) {
        return {
          canSubmit: false,
          blockedReason: `Pick a conclusion for ${q.shortLabel} before submitting.`,
        }
      }
    }
    return { canSubmit: true, blockedReason: null as string | null }
  }, [state.artifactTags, state.conclusions])

  const submitted = state.submittedAt !== null

  return (
    <div className="relative flex h-full min-h-0 w-full flex-col overflow-hidden">
      <InvestigationHeader
        caseData={CASE}
        canSubmit={canSubmit}
        blockedReason={blockedReason}
        submitted={submitted}
        onExit={handleExit}
        onReset={handleReset}
        onSubmit={handleSubmit}
      />

      {submitted ? (
        <div className="min-h-0 flex-1 overflow-hidden">
          <Debrief
            caseData={CASE}
            tagsByArtifact={state.artifactTags}
            conclusions={state.conclusions}
            onReplay={handleReplay}
            onExit={handleExit}
          />
        </div>
      ) : (
        <>
          {/* Mobile tab strip. Hidden at lg+, where both panes show side by side. */}
          <nav
            aria-label="Workspace pane"
            className="flex border-b border-forensic-border bg-forensic-surface lg:hidden"
          >
            <TabButton
              active={mobileTab === 'rail'}
              onClick={() => setMobileTab('rail')}
              icon={<Files className="h-4 w-4" />}
              label="Evidence"
            />
            <TabButton
              active={mobileTab === 'worksheet'}
              onClick={() => setMobileTab('worksheet')}
              icon={<ClipboardList className="h-4 w-4" />}
              label="Worksheet"
            />
          </nav>

          <div className="relative flex min-h-0 flex-1 flex-col overflow-hidden lg:grid lg:grid-cols-[22rem_minmax(0,1fr)] xl:grid-cols-[24rem_minmax(0,1fr)]">
            <div
              className={cn(
                'min-h-0 lg:flex lg:h-full lg:flex-col',
                mobileTab === 'rail' ? 'flex h-full flex-col' : 'hidden',
              )}
            >
              <ArtifactRail
                stacks={CASE.stacks}
                artifacts={CASE.artifacts}
                viewedIds={state.viewedArtifactIds}
                tagsByArtifact={state.artifactTags}
                onOpenArtifact={(id) => {
                  handleOpenArtifact(id)
                }}
              />
            </div>

            <div
              className={cn(
                'min-h-0 lg:flex lg:h-full lg:flex-col',
                mobileTab === 'worksheet' ? 'flex h-full flex-col' : 'hidden',
              )}
            >
              <Worksheet
                caseData={CASE}
                artifacts={CASE.artifacts}
                tagsByArtifact={state.artifactTags}
                conclusions={state.conclusions}
                onOpenArtifact={handleOpenArtifact}
                onUntag={handleUntagFromQuestion}
                onSelectConclusion={setConclusion}
              />
            </div>

            <ArtifactSheet
              artifact={openArtifact}
              hrQuestions={CASE.hrQuestions}
              tags={openArtifactId ? state.artifactTags[openArtifactId] ?? [] : []}
              onChangeTags={(tags) => {
                if (openArtifactId) handleChangeTags(openArtifactId, tags)
              }}
              onClose={() => setOpenArtifactId(null)}
            />
          </div>
        </>
      )}
    </div>
  )
}

function TabButton({
  active,
  onClick,
  icon,
  label,
}: {
  active: boolean
  onClick: () => void
  icon: ReactNode
  label: string
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        'flex flex-1 items-center justify-center gap-2 border-b-2 py-2.5 text-[13px] font-semibold transition-colors',
        active
          ? 'border-forensic-primary text-forensic-primary'
          : 'border-transparent text-forensic-textMuted hover:bg-forensic-surfaceAlt hover:text-forensic-text',
      )}
    >
      {icon}
      {label}
    </button>
  )
}

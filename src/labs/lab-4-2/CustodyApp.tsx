import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'
import { ClipboardList, FileText } from 'lucide-react'
import { cn } from '@/lib/utils'
import { emitLabProgress } from '@/hooks/useReactiveLocalStorage'
import { CASE } from './case'
import {
  COMPLETED_KEY,
  isLabPassed,
  scoreCase,
  useCustodyState,
} from './useCustodyState'
import { CustodyHeader } from './components/CustodyHeader'
import { ScenarioPanel } from './components/ScenarioPanel'
import { CustodyForm } from './components/CustodyForm'
import { Debrief } from './components/Debrief'

type MobileTab = 'scenario' | 'form'

/**
 * Full-bleed Custody SPA for Lab 4.2.
 *
 * Mounted at `/labs/lab-4-2/custody` directly inside `LabShell`'s main
 * region, replacing the usual `LabWorkbook` chrome. State lives in
 * `useCustodyState` (localStorage-backed), and `submittedAt` toggles
 * between the form workspace and the Debrief.
 *
 * Responsive: at `lg` and up the scenario panel and form render side by
 * side; below that a tab strip switches between them.
 */
export default function CustodyApp() {
  const navigate = useNavigate()
  const { state, setFieldValue, setSignature, submit, reset, resetAll } = useCustodyState()

  const [activeEventId, setActiveEventId] = useState<string | null>(
    CASE.events[0]?.id ?? null,
  )
  const [mobileTab, setMobileTab] = useState<MobileTab>('scenario')

  // Bumped each time the user picks a scenario card. The effect below
  // smooth-scrolls the form pane to the matching transfer row. Read the
  // latest active event id via a ref so the effect only runs on intent
  // (card click) and not on every focus change inside the form.
  const [scrollTrigger, setScrollTrigger] = useState(0)
  const activeEventIdRef = useRef(activeEventId)
  activeEventIdRef.current = activeEventId

  useEffect(() => {
    const previous = document.title
    document.title = 'Lab 4.2 · Chain of Custody'
    return () => {
      document.title = previous
    }
  }, [])

  // Smooth-scroll the form pane to the matching transfer row when the
  // user clicks a scenario card. Defer to the next animation frame so
  // the mobile tab swap (if any) has time to render the form.
  useEffect(() => {
    if (scrollTrigger === 0) return
    const eventId = activeEventIdRef.current
    if (!eventId) return
    const handle = requestAnimationFrame(() => {
      const el = document.querySelector(`[data-event-id="${eventId}"]`)
      if (el instanceof HTMLElement) {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' })
      }
    })
    return () => cancelAnimationFrame(handle)
  }, [scrollTrigger])

  // Symmetric: when the active event changes (card click or focus
  // inside a form row), scroll the scenario panel so the matching card
  // sits at the top of its visible area.
  useEffect(() => {
    if (!activeEventId) return
    const handle = requestAnimationFrame(() => {
      const el = document.querySelector(`[data-scenario-event-id="${activeEventId}"]`)
      if (el instanceof HTMLElement) {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' })
      }
    })
    return () => cancelAnimationFrame(handle)
  }, [activeEventId])

  // Once submitted and passing, write the completion flag and signal the
  // navbar/home-grid progress UI to refresh.
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

  // Submit gating: every field on every event must have a non-empty
  // value, AND the form must be signed. The first missing item drives
  // the tooltip.
  const { canSubmit, blockedReason } = useMemo(() => {
    for (const event of CASE.events) {
      for (const field of event.fields) {
        const value = state.fieldValues[event.id]?.[field.id] ?? ''
        if (!value.trim()) {
          return {
            canSubmit: false,
            blockedReason: `Fill in "${field.label}" on row ${event.step} (${event.title}) before submitting.`,
          }
        }
      }
    }
    if (!state.signature) {
      return {
        canSubmit: false,
        blockedReason: 'Sign the form in the case-information card before submitting.',
      }
    }
    return { canSubmit: true, blockedReason: null as string | null }
  }, [state.fieldValues, state.signature])

  const handleExit = () => {
    navigate('/labs/lab-4-2')
  }

  const handleReset = () => {
    const ok = window.confirm(
      'Start over? This wipes every field on the form and removes any completion you have already earned.',
    )
    if (!ok) return
    resetAll()
    emitLabProgress()
    setActiveEventId(CASE.events[0]?.id ?? null)
    setMobileTab('scenario')
  }

  const handleSubmit = () => {
    submit()
  }

  const handleReplay = () => {
    reset()
    setActiveEventId(CASE.events[0]?.id ?? null)
    setMobileTab('scenario')
  }

  const handleSelectEvent = (eventId: string) => {
    setActiveEventId(eventId)
    setMobileTab('form')
    setScrollTrigger((t) => t + 1)
  }

  const submitted = state.submittedAt !== null
  const score = useMemo(() => scoreCase(state, CASE), [state])

  return (
    <div className="relative flex h-full min-h-0 w-full flex-col overflow-hidden">
      <CustodyHeader
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
            state={state}
            score={score}
            onReplay={handleReplay}
            onExit={handleExit}
          />
        </div>
      ) : (
        <>
          {/* Mobile tab strip (hidden at lg+) */}
          <nav
            aria-label="Workspace pane"
            className="flex border-b border-forensic-border bg-forensic-surface lg:hidden"
          >
            <TabButton
              active={mobileTab === 'scenario'}
              onClick={() => setMobileTab('scenario')}
              icon={<FileText className="h-4 w-4" />}
              label="Scenario"
            />
            <TabButton
              active={mobileTab === 'form'}
              onClick={() => setMobileTab('form')}
              icon={<ClipboardList className="h-4 w-4" />}
              label="Form"
            />
          </nav>

          <div className="relative flex min-h-0 flex-1 flex-col overflow-hidden lg:grid lg:grid-cols-[26rem_minmax(0,1fr)] xl:grid-cols-[30rem_minmax(0,1fr)] 2xl:grid-cols-[34rem_minmax(0,1fr)]">
            <div
              className={cn(
                'min-h-0 lg:flex lg:h-full lg:flex-col',
                mobileTab === 'scenario' ? 'flex h-full flex-col' : 'hidden',
              )}
            >
              <ScenarioPanel
                caseData={CASE}
                state={state}
                activeEventId={activeEventId}
                onSelectEvent={handleSelectEvent}
              />
            </div>

            <div
              className={cn(
                'min-h-0 lg:flex lg:h-full lg:flex-col',
                mobileTab === 'form' ? 'flex h-full flex-col' : 'hidden',
              )}
            >
              <CustodyForm
                caseData={CASE}
                state={state}
                activeEventId={activeEventId}
                onChangeField={setFieldValue}
                onChangeSignature={setSignature}
                onFocusEvent={setActiveEventId}
              />
            </div>
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

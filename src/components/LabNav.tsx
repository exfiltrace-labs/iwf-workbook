import { useEffect, useMemo, useRef, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { Home, ChevronDown, ChevronRight, Check, CheckCircle2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { LAB_GROUPS, LABS } from '@/labs/registry'
import { LabProgressBadge } from '@/components/LabProgressBadge'
import { useCourseProgress } from '@/hooks/useCourseProgress'
import { LabSearch } from '@/components/LabSearch'
import { ThemeToggle } from '@/components/ThemeToggle'

interface LabNavProps {
  /** Course name shown as the small label above the lab title. */
  courseName?: string
}

/**
 * Top navigation bar for all course labs. Dark themed by design so it
 * stays visually consistent across interactive labs and SANS-style workbook
 * pages alike. Pulled out as its own component so it can be reused across
 * the entire course.
 */
export function LabNav({ courseName }: LabNavProps) {
  const navigate = useNavigate()
  const location = useLocation()

  // Resolve the current lab from the URL. Path shape: /labs/<id>.
  const currentLabId = useMemo(() => {
    const m = /^\/labs\/([^/?#]+)/.exec(location.pathname)
    return m ? m[1] : null
  }, [location.pathname])
  const currentLab = useMemo(
    () => (currentLabId ? LABS.find((l) => l.id === currentLabId) ?? null : null),
    [currentLabId],
  )
  const labNumber = currentLab?.labNumber
  const labTitle = currentLab?.title

  const onHome = () => navigate('/')
  const handleLabHome = () => {
    if (currentLab) navigate(`/labs/${currentLab.id}`)
    else navigate('/')
  }
  const handleSelect = (id: string) => {
    setOpen(false)
    navigate(`/labs/${id}`)
  }

  const [open, setOpen] = useState(false)
  const wrapperRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    if (!open) return
    const onDown = (e: MouseEvent) => {
      if (!wrapperRef.current) return
      if (!wrapperRef.current.contains(e.target as Node)) setOpen(false)
    }
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false)
    }
    document.addEventListener('mousedown', onDown)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onDown)
      document.removeEventListener('keydown', onKey)
    }
  }, [open])

  // Lab groups come straight from the auto-discovered registry, already
  // sorted by module order.
  const groups = LAB_GROUPS

  // Course-wide progress aggregated across every lab. Drives both the
  // small ring shown inside the trigger and the rich header block at
  // the top of the dropdown.
  const { answered, total, labsComplete, labsTracked } = useCourseProgress()
  const hasProgress = total > 0
  const pct = hasProgress ? Math.round((answered / total) * 100) : 0
  const courseComplete = hasProgress && answered === total

  // Module containing the current lab is expanded by default; the rest start
  // collapsed. Stored as a Set of moduleIds.
  const currentModuleId = currentLab?.moduleId ?? null

  const [expanded, setExpanded] = useState<Set<string>>(
    () => new Set(currentModuleId ? [currentModuleId] : []),
  )

  // If the current lab changes (e.g. switcher selects a new one), make sure
  // its module is expanded the next time the menu opens.
  useEffect(() => {
    if (open && currentModuleId) {
      setExpanded((prev) => (prev.has(currentModuleId) ? prev : new Set(prev).add(currentModuleId)))
    }
  }, [open, currentModuleId])

  const toggleModule = (moduleId: string) => {
    setExpanded((prev) => {
      const next = new Set(prev)
      if (next.has(moduleId)) next.delete(moduleId)
      else next.add(moduleId)
      return next
    })
  }

  return (
    <header className="flex-none border-b border-black/30 bg-forensic-navBg text-zinc-100">
      <div className="flex items-center justify-between gap-2 px-3 py-3 sm:gap-4 sm:px-8">
        <div className="flex items-center gap-2 min-w-0 sm:gap-3">
          <button
            type="button"
            onClick={onHome}
            className="flex h-8 w-8 flex-none items-center justify-center rounded-md bg-white/10 text-zinc-100 transition-colors hover:bg-white/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40"
            aria-label="Course Home"
            title="Course Home"
          >
            <Home className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={handleLabHome}
            className="group min-w-0 rounded-md px-1 py-0.5 -mx-1 text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-400/60"
            aria-label={currentLab ? `${labTitle} home` : 'Course Home'}
            title={currentLab ? `${labTitle} home` : 'Course Home'}
          >
            <div className="min-w-0 leading-tight">
              {courseName && (
                <div className="hidden text-[10px] font-semibold uppercase tracking-[0.16em] text-zinc-400 sm:block">
                  {courseName}
                </div>
              )}
              <div className="truncate text-sm font-semibold text-zinc-100 group-hover:text-white transition-colors">
                {currentLab ? (
                  <>
                    {labNumber} <span className="text-zinc-500">·</span> {labTitle}
                  </>
                ) : (
                  'Course Home'
                )}
              </div>
            </div>
          </button>
        </div>

        <div className="flex flex-none items-center gap-1 sm:gap-3">
          <LabSearch />

        <div ref={wrapperRef} className="relative">
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-haspopup="menu"
            aria-expanded={open}
            className="flex items-center gap-2 rounded-md border border-white/15 bg-white/5 px-2 py-1.5 text-xs font-medium text-zinc-100 transition-colors hover:border-white/25 hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40 sm:px-3"
            aria-label={
              hasProgress
                ? `${currentLab ? 'Switch lab' : 'Browse labs'}; course progress ${pct}%`
                : currentLab
                  ? 'Switch lab'
                  : 'Browse labs'
            }
            title={hasProgress ? `${answered} of ${total} questions answered` : undefined}
          >
            {hasProgress && (
              <span className="flex items-center gap-1.5">
                {courseComplete ? (
                  <CheckCircle2 className="h-4 w-4 flex-none text-emerald-300" />
                ) : (
                  <ProgressRing pct={pct} size={18} />
                )}
                <span
                  className={cn(
                    'tabular-nums font-semibold',
                    courseComplete ? 'text-emerald-300' : 'text-zinc-200',
                  )}
                >
                  {pct}%
                </span>
              </span>
            )}
            <span className="hidden sm:inline text-zinc-400">
              {currentLab ? 'Switch lab' : 'Browse labs'}
            </span>
            {currentLab && (
              <span className="hidden font-semibold sm:inline">{labNumber}</span>
            )}
            <ChevronDown
              className={cn('h-3.5 w-3.5 text-zinc-300 transition-transform', open && 'rotate-180')}
            />
          </button>

          {open && (
            <div
              role="menu"
              className="absolute right-0 z-50 mt-2 w-72 max-w-[calc(100vw-1.5rem)] overflow-hidden rounded-lg border border-forensic-codeBorder bg-forensic-codeBg shadow-2xl shadow-black/50 sm:w-96"
            >
              {hasProgress ? (
                <div className="border-b border-forensic-codeBorder px-3 py-2">
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-zinc-400">
                    Course progress
                  </p>
                  <p className="mt-1 text-xs text-zinc-200">
                    <span className="font-semibold tabular-nums text-zinc-100">{answered}</span>{' '}
                    of <span className="tabular-nums">{total}</span> questions answered
                  </p>
                  <p className="mt-0.5 text-[11px] text-zinc-400">
                    <span className="tabular-nums">{labsComplete}</span> of{' '}
                    <span className="tabular-nums">{labsTracked}</span> labs complete
                  </p>
                  <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-white/10">
                    <div
                      className={cn(
                        'h-full rounded-full transition-all duration-500',
                        courseComplete ? 'bg-emerald-400' : 'bg-forensic-primary',
                      )}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              ) : (
                <div className="border-b border-forensic-codeBorder px-3 py-2">
                  <p className="text-xs font-semibold text-zinc-300">Course labs</p>
                </div>
              )}
              <ul className="nav-popover-scroll max-h-96 overflow-y-auto py-1">
                {groups.map((group) => {
                  const isExpanded = expanded.has(group.module.id)
                  const containsCurrent = group.module.id === currentModuleId
                  return (
                    <li key={group.module.id} className="px-1">
                      <button
                        type="button"
                        onClick={() => toggleModule(group.module.id)}
                        aria-expanded={isExpanded}
                        className={cn(
                          'flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left transition-colors hover:bg-white/5',
                          containsCurrent && 'text-zinc-100',
                        )}
                      >
                        <ChevronRight
                          className={cn(
                            'h-3.5 w-3.5 flex-none text-zinc-400 transition-transform',
                            isExpanded && 'rotate-90',
                          )}
                        />
                        <span className="min-w-0 flex-1 truncate text-xs font-semibold text-zinc-200">
                          {group.module.label}
                        </span>
                      </button>
                      {isExpanded && (
                        <ul className="mb-1 ml-4 border-l border-forensic-codeBorder/70 pl-1">
                          {group.labs.map((lab) => {
                            const isCurrent = lab.id === currentLabId
                            return (
                              <li key={lab.id}>
                                <button
                                  type="button"
                                  role="menuitem"
                                  onClick={() => handleSelect(lab.id)}
                                  className={cn(
                                    'flex w-full items-start gap-3 rounded-md px-2 py-1.5 text-left transition-colors hover:bg-white/5',
                                    isCurrent && 'bg-white/10',
                                  )}
                                >
                                  <div className="mt-0.5 flex h-4 w-4 flex-none items-center justify-center">
                                    {isCurrent && (
                                      <Check className="h-3.5 w-3.5 text-zinc-100" />
                                    )}
                                  </div>
                                  <div className="min-w-0 flex-1 leading-tight">
                                    <div className="text-xs font-semibold text-zinc-100">
                                      {lab.labNumber}
                                    </div>
                                    <div className="truncate text-[11px] text-zinc-400">
                                      {lab.title}
                                    </div>
                                  </div>
                                  <LabProgressBadge
                                    questionIds={lab.questionIds}
                                    variant="dark"
                                    className="mt-0.5 flex-none"
                                  />
                                </button>
                              </li>
                            )
                          })}
                        </ul>
                      )}
                    </li>
                  )
                })}
              </ul>
            </div>
          )}
        </div>
          <ThemeToggle />
        </div>
      </div>
    </header>
  )
}

/**
 * Compact circular progress ring with the percentage rendered inside.
 * SVG so it stays crisp at any density. Used inside the Browse-labs
 * trigger as an at-a-glance course progress indicator.
 */
function ProgressRing({ pct, size = 18 }: { pct: number; size?: number }) {
  const stroke = size <= 20 ? 2 : 2.75
  const r = (size - stroke) / 2
  const c = 2 * Math.PI * r
  const safePct = Math.max(0, Math.min(100, pct))
  const offset = c - (safePct / 100) * c
  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      aria-hidden="true"
      className="flex-none"
    >
      <circle
        cx={size / 2}
        cy={size / 2}
        r={r}
        fill="none"
        stroke="currentColor"
        strokeOpacity="0.25"
        strokeWidth={stroke}
      />
      <circle
        cx={size / 2}
        cy={size / 2}
        r={r}
        fill="none"
        stroke="rgb(var(--forensic-primary))"
        strokeWidth={stroke}
        strokeLinecap="round"
        strokeDasharray={c}
        strokeDashoffset={offset}
        transform={`rotate(-90 ${size / 2} ${size / 2})`}
        style={{ transition: 'stroke-dashoffset 400ms ease-out' }}
      />
    </svg>
  )
}

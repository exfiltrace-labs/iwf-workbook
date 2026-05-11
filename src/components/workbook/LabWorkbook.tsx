import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type ComponentType,
  type ReactNode,
} from 'react'
import { MDXProvider } from '@mdx-js/react'
import { useLocation } from 'react-router-dom'
import {
  ArrowLeft,
  ArrowRight,
  ArrowUp,
  ChevronRight,
  Clock,
  Home,
  ListChecks,
  RotateCcw,
  Signal,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { CodeBlock } from './CodeBlock'
import { Figure } from './Figure'
import { Question, Hint, Solution, Choice } from './Question'
import {
  Callout,
  Definition,
  Checklist,
  Check,
  Compare,
  Good,
  Bad,
} from './Pedagogy'
import { Details } from './Details'
import { Cite } from './Cite'
import { LabGrid } from '@/components/LabGrid'
import { ResumeCard } from '@/components/ResumeCard'
import { Timeline, TimelineEvent } from './Timeline'
import { HexView } from './HexView'
import { RegistryTree, RegistryKey, RegistryValue } from './RegistryTree'
import { FileTree, TreeFolder, TreeFile } from './FileTree'
import { WorkbookToc } from './WorkbookToc'
import { WORKBOOK_PROSE_CLASS } from './workbookProse'
import { cn } from '@/lib/utils'
import { autoLinkGlossary } from '@/lib/glossaryAutoLink'
import { COURSE } from '@/content/course'
import {
  QuestionRegistryContext,
  ReferencesContext,
  type Reference,
  type QuestionRegistryValue,
} from './WorkbookContext'

interface LabLink {
  label: string
  onClick: () => void
}

/**
 * One step in the workbook breadcrumb trail. The final crumb (the current
 * page) should omit `onClick` so it renders as plain text.
 */
export interface Breadcrumb {
  label: string
  onClick?: () => void
}

export type LabDifficulty = 'beginner' | 'intermediate' | 'advanced'

interface LabWorkbookProps {
  /** Compiled MDX content component (default export from a `.mdx` file). */
  content: ComponentType<{ components?: Record<string, ComponentType<any>> }>
  /** Eyebrow label, e.g. "Module 2 · The Investigative Mindset". */
  eyebrow?: string
  /** Optional badge label rendered next to the eyebrow. */
  badge?: string
  /** Page title. */
  title: string
  /** Optional one-line description rendered under the title. */
  description?: string
  /** Estimated reading / completion time, e.g. "8 min read" or "30 min lab". */
  readTime?: string
  /** Optional difficulty level. Renders a colored chip in the header. */
  difficulty?: LabDifficulty
  /** Optional call-to-action rendered at the bottom of the workbook. */
  cta?: {
    label: string
    onClick: () => void
  }
  /** Previous lab navigation link, rendered in the footer. */
  prevLab?: LabLink
  /** Next lab navigation link, rendered in the footer. */
  nextLab?: LabLink
  /**
   * Optional list of references / citations. When non-empty, a numbered
   * "References" section is auto-rendered at the bottom of the workbook,
   * and any `<Cite id="...">` markers in the prose link to it.
   */
  references?: Reference[]
  /** Optional extra nodes rendered above the CTA. */
  footer?: ReactNode
  /**
   * Optional breadcrumb trail rendered above the page header. Pass the
   * trail in order from root to current page; the last entry should omit
   * its `onClick` so it renders as the static current-page crumb.
   */
  breadcrumbs?: Breadcrumb[]
}

const DIFFICULTY_STYLE: Record<LabDifficulty, { label: string; chip: string }> = {
  beginner: {
    label: 'Beginner',
    chip: 'border-emerald-500/40 bg-emerald-500/10 text-emerald-800 dark:text-emerald-200',
  },
  intermediate: {
    label: 'Intermediate',
    chip: 'border-amber-500/40 bg-amber-500/10 text-amber-800 dark:text-amber-200',
  },
  advanced: {
    label: 'Advanced',
    chip: 'border-rose-500/40 bg-rose-500/10 text-rose-800 dark:text-rose-200',
  },
}

/**
 * Standardized lab page chrome. Renders compiled MDX inside a centered
 * "wiki" reading column with prose styles, a sticky on-page table of
 * contents to its left, and the workbook custom components made
 * available inside the MDX.
 *
 * Adds a thin reading-progress bar at the top of the column, a floating
 * back-to-top button once the reader scrolls down, hover-anchor links
 * on every heading, and prev/next lab navigation in the footer.
 */
export function LabWorkbook({
  content: Content,
  eyebrow,
  badge,
  title,
  description,
  readTime,
  difficulty,
  cta,
  prevLab,
  nextLab,
  references = [],
  footer,
  breadcrumbs,
}: LabWorkbookProps) {
  const scrollRef = useRef<HTMLDivElement>(null)
  const articleRef = useRef<HTMLElement>(null)

  // --- Question registry --------------------------------------------------
  // Each <Question id="..."> registers itself so we can show a live
  // "n / total answered" indicator in the page header.
  const [questionState, setQuestionState] = useState<Record<string, boolean>>({})
  const questionRegistry = useMemo<QuestionRegistryValue>(
    () => ({
      set: (id, isCorrect) =>
        setQuestionState((prev) =>
          prev[id] === isCorrect ? prev : { ...prev, [id]: isCorrect },
        ),
      unregister: (id) =>
        setQuestionState((prev) => {
          if (!(id in prev)) return prev
          const next = { ...prev }
          delete next[id]
          return next
        }),
    }),
    [],
  )
  const totalQuestions = Object.keys(questionState).length
  const answeredQuestions = Object.values(questionState).filter(Boolean).length

  // --- Sidebar TOC collapse, persisted across navigation ----------------
  const TOC_COLLAPSED_KEY = 'workbook:toc-collapsed'
  const [tocCollapsed, setTocCollapsed] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false
    return window.localStorage.getItem(TOC_COLLAPSED_KEY) === '1'
  })
  useEffect(() => {
    try {
      window.localStorage.setItem(TOC_COLLAPSED_KEY, tocCollapsed ? '1' : '0')
    } catch {
      /* localStorage may be unavailable; ignore. */
    }
  }, [tocCollapsed])

  // Memoize the references context value so consumers re-render only when
  // the references prop changes identity.
  const referencesValue = useMemo(() => ({ references }), [references])

  // --- Document title -----------------------------------------------------
  // Keep the browser tab title in sync with whatever workbook page is
  // mounted. The previous title is restored on unmount so transitioning
  // between routes does not leave a stale title behind.
  useEffect(() => {
    const previous = document.title
    document.title = badge ? `${badge}: ${title}` : title
    return () => {
      document.title = previous
    }
  }, [title, badge])

  // --- Scroll positioning when the content swaps -------------------------
  // Each route renders its own `LabWorkbook` instance, but the shared
  // `LabShell` parent means React reuses the same DOM nodes when only the
  // props change. Without this, navigating from a long lab to the home
  // page (or between labs) would land the reader mid-scroll on the new
  // page.
  //
  // Two cases:
  //   - No `#hash`: snap to the top of the inner scroller.
  //   - With `#hash`: wait one frame for `WorkbookToc` to assign slug
  //     ids to headings, then scroll the inner scroller (not window) to
  //     the target, honoring its CSS `scroll-margin-top` so the heading
  //     does not jam into the top edge.
  const location = useLocation()
  useEffect(() => {
    const scroller = scrollRef.current
    if (!scroller) return
    if (!location.hash) {
      scroller.scrollTo({ top: 0, behavior: 'auto' })
      return
    }
    const id = location.hash.slice(1)
    if (!id) return
    const handle = requestAnimationFrame(() => {
      const el = document.getElementById(id)
      if (!el) return
      const cssMt = parseFloat(getComputedStyle(el).scrollMarginTop || '0')
      const offset = Number.isFinite(cssMt) && cssMt > 0 ? cssMt : 24
      const top =
        el.getBoundingClientRect().top -
        scroller.getBoundingClientRect().top +
        scroller.scrollTop -
        offset
      scroller.scrollTo({ top: Math.max(0, top), behavior: 'auto' })
    })
    return () => cancelAnimationFrame(handle)
  }, [Content, location.hash, location.pathname])

  // --- Reading progress bar + back-to-top visibility ----------------------
  const [progress, setProgress] = useState(0)
  const [showBackToTop, setShowBackToTop] = useState(false)

  useEffect(() => {
    const el = scrollRef.current
    if (!el) return
    const onScroll = () => {
      const max = el.scrollHeight - el.clientHeight
      const pct = max > 0 ? Math.min(1, Math.max(0, el.scrollTop / max)) : 0
      setProgress(pct)
      setShowBackToTop(el.scrollTop > 400)
    }
    onScroll()
    el.addEventListener('scroll', onScroll, { passive: true })
    return () => el.removeEventListener('scroll', onScroll)
  }, [])

  const scrollToTop = () => {
    scrollRef.current?.scrollTo({ top: 0, behavior: 'smooth' })
  }

  // --- Auto-link glossary terms in body text ------------------------------
  // After the MDX renders, walk the prose and decorate the first
  // occurrence of each glossary term with a tooltip span. The actual
  // DOM walk lives in `lib/glossaryAutoLink` to keep this layout
  // component small.
  useEffect(() => {
    const article = articleRef.current
    if (article) autoLinkGlossary(article)
  }, [Content])

  // --- Reset all persisted lab state --------------------------------------
  // Only the questions registered by THIS workbook are cleared. Question ids
  // are globally unique across labs (the registry validates this at startup),
  // so removing exactly those keys leaves every other lab's progress intact.
  // Checklist ids are not tracked by the question registry, so we cannot
  // scope them per-lab without a parallel registry; for now we leave them
  // alone and the button promises only to reset answers.
  const handleResetAll = () => {
    if (totalQuestions === 0) return
    const ok = window.confirm(
      'Reset every answer for this lab? This cannot be undone.',
    )
    if (!ok) return
    try {
      for (const id of Object.keys(questionState)) {
        window.localStorage.removeItem(`lab-question:${id}`)
      }
    } catch {
      /* ignore */
    }
    // Reload so every persisted hook reads fresh state.
    window.location.reload()
  }

  return (
    <div className="relative h-full w-full">
      {/* Reading progress bar - sits above the scroll container so it does
          not get clipped or scroll with the content. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 z-20 h-[3px] bg-transparent"
      >
        <div
          className="h-full bg-forensic-primary transition-[width] duration-150 ease-out"
          style={{ width: `${progress * 100}%` }}
        />
      </div>

      <div ref={scrollRef} className="h-full w-full overflow-y-auto overflow-x-hidden bg-forensic-bg">
        <div className="mx-auto w-full max-w-6xl px-6 pt-10 pb-4">
          <div
            className={cn(
              'grid grid-cols-1 gap-10',
              tocCollapsed
                ? 'lg:grid-cols-[2.5rem_minmax(0,1fr)] lg:gap-6'
                : 'lg:grid-cols-[14rem_minmax(0,1fr)]',
            )}
          >
            {/* Sticky TOC (desktop only). When the TOC is open we render
                a subtle vertical rule on the right edge to visually
                separate it from the main reading column. */}
            <aside
              className={cn(
                'hidden lg:block',
                !tocCollapsed && 'lg:border-r lg:border-forensic-border/70 lg:pr-6',
              )}
            >
              <div className="sticky top-6">
                <WorkbookToc
                  articleRef={articleRef}
                  scrollRef={scrollRef}
                  contentKey={Content}
                  collapsed={tocCollapsed}
                  onToggleCollapsed={() => setTocCollapsed((v) => !v)}
                />
              </div>
            </aside>

            {/* Main reading column */}
            <div className="min-w-0">
              {breadcrumbs && breadcrumbs.length > 0 && (
                <nav
                  aria-label="Breadcrumb"
                  className="mb-4 flex flex-wrap items-center gap-1 text-[12px] text-forensic-textMuted"
                >
                  {breadcrumbs.map((crumb, i) => {
                    const isLast = i === breadcrumbs.length - 1
                    const sep =
                      i > 0 ? (
                        <ChevronRight
                          aria-hidden="true"
                          className="h-3 w-3 flex-none text-forensic-border"
                        />
                      ) : null
                    const isHome = i === 0
                    const inner = (
                      <>
                        {isHome && <Home className="h-3 w-3" aria-hidden="true" />}
                        <span className={cn(isLast && 'text-forensic-text font-semibold')}>
                          {crumb.label}
                        </span>
                      </>
                    )
                    return (
                      <span key={i} className="flex items-center gap-1">
                        {sep}
                        {crumb.onClick && !isLast ? (
                          <button
                            type="button"
                            onClick={crumb.onClick}
                            className="inline-flex items-center gap-1 rounded px-1 -mx-1 transition-colors hover:text-forensic-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-forensic-primary/30"
                          >
                            {inner}
                          </button>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-1 -mx-1">
                            {inner}
                          </span>
                        )}
                      </span>
                    )
                  })}
                </nav>
              )}
              <header className="mb-10 space-y-1.5 rounded-xl border border-forensic-border bg-forensic-surfaceAlt/50 px-6 py-3 shadow-lab-sm">
                {(eyebrow || badge) && (
                  <div className="flex flex-wrap items-center gap-3">
                    {badge && <Badge variant="outline">{badge}</Badge>}
                    {eyebrow && (
                      <span className="text-[13px] font-medium text-forensic-textMuted">
                        {eyebrow}
                      </span>
                    )}
                  </div>
                )}
                <h1 className="text-[1.75rem] sm:text-[2rem] font-bold tracking-tight text-balance text-forensic-text">
                  {title}
                </h1>
                {description && (
                  <p className="text-[17px] leading-relaxed text-forensic-text/80">
                    {description}
                  </p>
                )}
                {(readTime || difficulty || totalQuestions > 0) && (
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-2 pt-1 text-[13px] text-forensic-textMuted">
                    {difficulty && (
                      <span
                        className={cn(
                          'inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-[11px] font-semibold',
                          DIFFICULTY_STYLE[difficulty].chip,
                        )}
                      >
                        <Signal className="h-3 w-3" />
                        {DIFFICULTY_STYLE[difficulty].label}
                      </span>
                    )}
                    {readTime && (
                      <div className="flex items-center gap-1.5">
                        <Clock className="h-3.5 w-3.5" />
                        <span>{readTime}</span>
                      </div>
                    )}
                    {totalQuestions > 0 && (
                      <div className="flex items-center gap-1.5">
                        <ListChecks className="h-3.5 w-3.5" />
                        <span>
                          {answeredQuestions} / {totalQuestions} answered
                        </span>
                      </div>
                    )}
                  </div>
                )}
              </header>

              <article ref={articleRef} className={WORKBOOK_PROSE_CLASS}>
                <QuestionRegistryContext.Provider value={questionRegistry}>
                  <ReferencesContext.Provider value={referencesValue}>
                    <MDXProvider components={MDX_COMPONENTS}>
                      <Content components={MDX_COMPONENTS} />
                    </MDXProvider>
                  </ReferencesContext.Provider>
                </QuestionRegistryContext.Provider>

                {references.length > 0 && (
                  <>
                    <h2 id="references">References</h2>
                    <ol>
                      {references.map((ref) => (
                        <li key={ref.id} id={`ref-${ref.id}`} className="scroll-mt-24">
                          {ref.url ? (
                            <a href={ref.url} target="_blank" rel="noreferrer">
                              {ref.label}
                            </a>
                          ) : (
                            ref.label
                          )}
                          {ref.detail && (
                            <span className="text-forensic-textMuted"> · {ref.detail}</span>
                          )}
                        </li>
                      ))}
                    </ol>
                  </>
                )}
              </article>

              {footer && <div className="mt-10">{footer}</div>}

              {cta && (
                <div className="mt-12 flex justify-end border-t border-forensic-border pt-6">
                  <Button variant="default" onClick={cta.onClick}>
                    {cta.label}
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Button>
                </div>
              )}

              {totalQuestions > 0 && (
                <div className="mt-10 flex justify-end">
                  <button
                    type="button"
                    onClick={handleResetAll}
                    className="inline-flex items-center gap-1.5 rounded-md border border-forensic-border bg-forensic-surface px-3 py-1.5 text-[12px] font-medium text-forensic-textMuted shadow-lab-sm transition-colors hover:border-rose-300 hover:text-rose-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-300/40"
                    title="Clear every saved answer for this lab"
                  >
                    <RotateCcw className="h-3 w-3" />
                    Reset all answers
                  </button>
                </div>
              )}

              {(prevLab || nextLab) && (
                <nav
                  aria-label="Lab navigation"
                  className="mt-10 flex flex-col gap-3 border-t border-forensic-border pt-6 sm:flex-row sm:items-stretch sm:justify-between"
                >
                  {prevLab ? (
                    <button
                      type="button"
                      onClick={prevLab.onClick}
                      className="group flex flex-1 items-center gap-3 rounded-lg border border-forensic-border bg-forensic-surface px-4 py-3 text-left shadow-lab-sm transition-colors hover:border-forensic-borderBright hover:bg-forensic-surfaceAlt/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-forensic-primary/30"
                    >
                      <ArrowLeft className="h-4 w-4 flex-none text-forensic-textMuted transition-colors group-hover:text-forensic-primary" />
                      <div className="min-w-0">
                        <div className="text-[10px] font-semibold uppercase tracking-[0.16em] text-forensic-textMuted">
                          Previous lab
                        </div>
                        <div className="truncate text-sm font-semibold text-forensic-text">
                          {prevLab.label}
                        </div>
                      </div>
                    </button>
                  ) : (
                    <span className="hidden sm:block sm:flex-1" />
                  )}
                  {nextLab ? (
                    <button
                      type="button"
                      onClick={nextLab.onClick}
                      className="group flex flex-1 items-center justify-end gap-3 rounded-lg border border-forensic-border bg-forensic-surface px-4 py-3 text-right shadow-lab-sm transition-colors hover:border-forensic-borderBright hover:bg-forensic-surfaceAlt/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-forensic-primary/30"
                    >
                      <div className="min-w-0">
                        <div className="text-[10px] font-semibold uppercase tracking-[0.16em] text-forensic-textMuted">
                          Next lab
                        </div>
                        <div className="truncate text-sm font-semibold text-forensic-text">
                          {nextLab.label}
                        </div>
                      </div>
                      <ArrowRight className="h-4 w-4 flex-none text-forensic-textMuted transition-colors group-hover:text-forensic-primary" />
                    </button>
                  ) : (
                    <span className="hidden sm:block sm:flex-1" />
                  )}
                </nav>
              )}
            </div>
          </div>

          <WorkbookFooter />
        </div>
      </div>

      {/* Back-to-top button. Positioned over the scroll container so it
          stays put while the content scrolls underneath. */}
      <button
        type="button"
        onClick={scrollToTop}
        aria-label="Back to top"
        title="Back to top"
        tabIndex={showBackToTop ? 0 : -1}
        aria-hidden={!showBackToTop}
        className={cn(
          'absolute bottom-6 right-6 z-30 inline-flex h-10 w-10 items-center justify-center rounded-full border border-forensic-border bg-forensic-surface text-forensic-text shadow-lab transition-all hover:border-forensic-primary/40 hover:text-forensic-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-forensic-primary/40',
          showBackToTop ? 'opacity-100' : 'pointer-events-none opacity-0',
        )}
      >
        <ArrowUp className="h-4 w-4" />
      </button>
    </div>
  )
}

const MDX_COMPONENTS: Record<string, ComponentType<any>> = {
  pre: CodeBlock,
  img: ({ src, alt, title }: { src?: string; alt?: string; title?: string }) => (
    <Figure src={src ?? ''} alt={alt} caption={title || alt} />
  ),
  Figure,
  Question,
  Hint,
  Solution,
  Choice,
  Callout,
  Definition,
  Checklist,
  Check,
  Compare,
  Good,
  Bad,
  Details,
  Cite,
  LabGrid,
  ResumeCard,
  Timeline,
  TimelineEvent,
  HexView,
  RegistryTree,
  RegistryKey,
  RegistryValue,
  FileTree,
  TreeFolder,
  TreeFile,
}

/**
 * Small attribution footer rendered at the bottom of every workbook page.
 * Sits below the prose column so it never competes with the lab content,
 * and stretches the full width of the centered max-w-6xl container.
 */
function WorkbookFooter() {
  const year = new Date().getFullYear()
  const mailto = `mailto:${COURSE.supportEmail}?subject=${encodeURIComponent(
    `${COURSE.name} lab workbook issue`,
  )}`
  const dot = <span aria-hidden="true" className="px-2 text-forensic-border">·</span>
  return (
    <footer className="mt-12 flex flex-wrap items-center justify-between gap-x-4 gap-y-1 border-t border-forensic-border pt-3 pb-1 text-[12px] text-forensic-textMuted">
      <span className="flex items-center">
        &copy; {year}{' '}
        <a
          href={COURSE.publisherUrl}
          target="_blank"
          rel="noreferrer"
          className="ml-1 font-semibold text-forensic-text underline-offset-2 hover:text-forensic-primary hover:underline"
        >
          {COURSE.publisher}
        </a>
        {dot}
        {COURSE.name}
      </span>
      <span className="flex items-center">
        <a
          href={mailto}
          className="underline-offset-2 hover:text-forensic-primary hover:underline"
        >
          Report an issue
        </a>
        {dot}
        <span
          className="font-mono text-[11px] text-forensic-textMuted/60"
          title="Build version. Run `git pull` to grab the latest workbook updates."
        >
          {__COMMIT_HASH__}
        </span>
      </span>
    </footer>
  )
}


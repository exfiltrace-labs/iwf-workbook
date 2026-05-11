import { Children, type ReactNode } from 'react'
import {
  AlertTriangle,
  Info,
  Key,
  Lightbulb,
  ThumbsDown,
  ThumbsUp,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useLocalStorage } from '@/hooks/useLocalStorage'
import { defineSlot, isSlot, slotMarker } from './slot'

/* -------------------------------------------------------------------------- */
/*  <Callout>                                                                 */
/* -------------------------------------------------------------------------- */

type CalloutType = 'note' | 'warning' | 'tip' | 'key'

interface CalloutProps {
  type?: CalloutType
  title?: string
  children: ReactNode
}

const CALLOUT_STYLES: Record<
  CalloutType,
  { wrap: string; icon: React.ComponentType<{ className?: string }>; iconClass: string; titleClass: string }
> = {
  note: {
    wrap: 'border-sky-500/30 bg-sky-500/10',
    icon: Info,
    iconClass: 'text-sky-600 dark:text-sky-400',
    titleClass: 'text-sky-900 dark:text-sky-200',
  },
  warning: {
    wrap: 'border-amber-500/30 bg-amber-500/10',
    icon: AlertTriangle,
    iconClass: 'text-amber-600 dark:text-amber-400',
    titleClass: 'text-amber-900 dark:text-amber-200',
  },
  tip: {
    wrap: 'border-emerald-500/30 bg-emerald-500/10',
    icon: Lightbulb,
    iconClass: 'text-emerald-600 dark:text-emerald-400',
    titleClass: 'text-emerald-900 dark:text-emerald-200',
  },
  key: {
    wrap: 'border-forensic-primary/30 bg-forensic-primarySoft',
    icon: Key,
    iconClass: 'text-forensic-primary',
    titleClass: 'text-forensic-primary',
  },
}

const CALLOUT_DEFAULT_TITLE: Record<CalloutType, string> = {
  note: 'Note',
  warning: 'Warning',
  tip: 'Tip',
  key: 'Key takeaway',
}

export function Callout({ type = 'note', title, children }: CalloutProps) {
  const style = CALLOUT_STYLES[type]
  const Icon = style.icon
  return (
    <aside
      className={cn(
        'not-prose my-5 flex gap-3 rounded-lg border px-4 py-3 shadow-lab-sm',
        style.wrap,
      )}
    >
      <Icon className={cn('mt-0.5 h-4 w-4 flex-none', style.iconClass)} />
      <div className="min-w-0 flex-1">
        <div className={cn('mb-1 text-[13px] font-semibold', style.titleClass)}>
          {title ?? CALLOUT_DEFAULT_TITLE[type]}
        </div>
        <div className="prose prose-sm max-w-none text-forensic-text/90">{children}</div>
      </div>
    </aside>
  )
}

/* -------------------------------------------------------------------------- */
/*  <Definition>                                                              */
/* -------------------------------------------------------------------------- */

interface DefinitionProps {
  term: string
  children: ReactNode
}

/**
 * Inline glossary term. Renders the surrounding text normally and exposes
 * the definition as a tooltip on hover or focus. Use sparingly inside
 * paragraphs:
 *
 *     <Definition term="MFT">Master File Table</Definition>
 */
export function Definition({ term, children }: DefinitionProps) {
  return (
    // The `glossary-term` class is also a marker the autoLinkGlossary
    // walker uses to skip text it has already wrapped. Without it, an
    // inline <Definition term="Prefetch"> would have its inner text
    // walked and wrapped a second time, giving "Prefetch" two stacked
    // tooltips that both open on hover.
    <span className="glossary-term group relative inline-block">
      <span
        tabIndex={0}
        className="cursor-help border-b border-dotted border-forensic-primary/60 text-forensic-text underline-offset-2 focus:outline-none focus-visible:ring-2 focus-visible:ring-forensic-primary/40"
      >
        {term}
      </span>
      <span
        role="tooltip"
        className="pointer-events-none absolute left-1/2 top-full z-30 mt-1 w-64 -translate-x-1/2 translate-y-1 rounded-md border border-forensic-border bg-forensic-surface px-3 py-2 text-[12px] font-normal leading-snug text-forensic-text opacity-0 shadow-lab transition-opacity group-hover:pointer-events-auto group-hover:opacity-100 group-focus-within:opacity-100"
      >
        <span className="block text-[11px] font-semibold uppercase tracking-[0.12em] text-forensic-textMuted">
          {term}
        </span>
        {children}
      </span>
    </span>
  )
}

/* -------------------------------------------------------------------------- */
/*  <Checklist> + <Check>                                                     */
/* -------------------------------------------------------------------------- */

interface ChecklistProps {
  /** Stable id used as the persistence key. */
  id: string
  title?: string
  children: ReactNode
}

interface CheckProps {
  /** Stable id within the parent checklist. */
  id: string
  children: ReactNode
}

export const Check = defineSlot<CheckProps>('Check', ({ children }) => <>{children}</>)
const CheckTypeMarker = slotMarker(Check)

/**
 * Persistent checklist. Each child must be a `<Check id="...">` element.
 * Checked state is stored in localStorage under `lab-checklist:{id}`.
 */
export function Checklist({ id, title, children }: ChecklistProps) {
  const [state, setState] = useLocalStorage<Record<string, boolean>>(
    `lab-checklist:${id}`,
    {},
  )

  const items: { id: string; content: ReactNode }[] = []
  Children.forEach(children, (child) => {
    if (!isSlot(child, CheckTypeMarker)) return
    const props = child.props as CheckProps
    items.push({ id: props.id, content: props.children })
  })

  const toggle = (itemId: string) => {
    setState((prev) => ({ ...prev, [itemId]: !prev[itemId] }))
  }

  const completed = items.filter((it) => state[it.id]).length

  return (
    <div className="not-prose my-5 rounded-lg border border-forensic-border bg-forensic-surface p-4 shadow-lab-sm">
      <div className="mb-3 flex items-center justify-between gap-3">
        <h4 className="text-sm font-semibold text-forensic-text">
          {title ?? 'Checklist'}
        </h4>
        <span className="text-[11px] font-medium text-forensic-textMuted">
          {completed} / {items.length}
        </span>
      </div>
      <ul className="space-y-2">
        {items.map((it) => {
          const checked = !!state[it.id]
          return (
            <li key={it.id}>
              <label className="flex cursor-pointer items-start gap-2.5 text-[14px] text-forensic-text">
                <input
                  type="checkbox"
                  checked={checked}
                  onChange={() => toggle(it.id)}
                  className="mt-0.5 h-4 w-4 flex-none accent-forensic-primary"
                />
                <span
                  className={cn(
                    'min-w-0 flex-1 leading-snug',
                    checked && 'text-forensic-textMuted line-through',
                  )}
                >
                  {it.content}
                </span>
              </label>
            </li>
          )
        })}
      </ul>
    </div>
  )
}

/* -------------------------------------------------------------------------- */
/*  <Compare> + <Good> + <Bad>                                                */
/* -------------------------------------------------------------------------- */

interface CompareProps {
  children: ReactNode
}

interface SideProps {
  title?: string
  children: ReactNode
}

export const Good = defineSlot<SideProps>('Good', ({ children }) => <>{children}</>)
const GoodTypeMarker = slotMarker(Good)

export const Bad = defineSlot<SideProps>('Bad', ({ children }) => <>{children}</>)
const BadTypeMarker = slotMarker(Bad)

/**
 * Side-by-side comparison block. Place a `<Good>` and a `<Bad>` (or one of
 * each) inside `<Compare>` to render them as labeled columns.
 */
export function Compare({ children }: CompareProps) {
  let good: SideProps | undefined
  let bad: SideProps | undefined
  Children.forEach(children, (child) => {
    if (isSlot(child, GoodTypeMarker)) good = child.props as SideProps
    else if (isSlot(child, BadTypeMarker)) bad = child.props as SideProps
  })

  return (
    <div className="not-prose my-5 grid gap-3 sm:grid-cols-2">
      {good && (
        <CompareSide
          tone="good"
          title={good.title ?? 'Do this'}
          icon={<ThumbsUp className="h-3.5 w-3.5" />}
        >
          {good.children}
        </CompareSide>
      )}
      {bad && (
        <CompareSide
          tone="bad"
          title={bad.title ?? "Don't do this"}
          icon={<ThumbsDown className="h-3.5 w-3.5" />}
        >
          {bad.children}
        </CompareSide>
      )}
    </div>
  )
}

function CompareSide({
  tone,
  title,
  icon,
  children,
}: {
  tone: 'good' | 'bad'
  title: string
  icon: ReactNode
  children: ReactNode
}) {
  const styles =
    tone === 'good'
      ? 'border-emerald-500/30 bg-emerald-500/10'
      : 'border-rose-500/30 bg-rose-500/10'
  const titleColor =
    tone === 'good'
      ? 'text-emerald-800 dark:text-emerald-200'
      : 'text-rose-800 dark:text-rose-200'
  return (
    <div className={cn('rounded-lg border p-4 shadow-lab-sm', styles)}>
      <div className={cn('mb-2 flex items-center gap-1.5 text-[12px] font-semibold uppercase tracking-[0.12em]', titleColor)}>
        {icon}
        {title}
      </div>
      <div className="prose prose-sm max-w-none text-forensic-text/90">{children}</div>
    </div>
  )
}


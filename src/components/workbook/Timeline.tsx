import { Children, isValidElement, type ReactNode } from 'react'
import { cn } from '@/lib/utils'

interface TimelineProps {
  children?: ReactNode
  /** Optional caption rendered under the timeline. */
  caption?: ReactNode
  className?: string
}

/**
 * Vertical event timeline for case writeups. Children should be
 * `<TimelineEvent>` nodes.
 *
 * Layout uses a two-column grid: a fixed-width "marker" column that
 * contains the rail and the dot, and a flexible content column. Both
 * the rail and the dot are centered inside the marker column with
 * `flex justify-center`, so they are guaranteed to line up regardless
 * of font sizing or row height.
 *
 * Wrapped in `not-prose` because the prose theme would otherwise add
 * bullets and list margins that fight the layout.
 */
export function Timeline({ children, caption, className }: TimelineProps) {
  const events = Children.toArray(children).filter(
    (child) => isValidElement(child) && child.type === TimelineEvent,
  )
  return (
    <figure className={cn('not-prose my-6', className)}>
      <ol className="space-y-5">
        {events.map((event, idx) => {
          const isLast = idx === events.length - 1
          return (
            <li
              key={idx}
              className="grid grid-cols-[16px_1fr] items-start gap-x-4"
            >
              <div className="relative flex h-full justify-center">
                {!isLast && (
                  <span
                    aria-hidden="true"
                    className="absolute top-2 bottom-[-1.5rem] w-0.5 bg-forensic-primary/25"
                  />
                )}
                <span
                  aria-hidden="true"
                  className="relative z-10 mt-1 h-3 w-3 flex-none rounded-full border-2 border-forensic-primary bg-forensic-surface"
                />
              </div>
              <div>{event}</div>
            </li>
          )
        })}
      </ol>
      {caption && (
        <figcaption className="mt-3 text-center text-[12px] italic text-forensic-textMuted">
          {caption}
        </figcaption>
      )}
    </figure>
  )
}

interface TimelineEventProps {
  /** Time / date label rendered above the title. */
  time: ReactNode
  /** Short event title. */
  title: ReactNode
  /** Optional source artifact (Prefetch, USBSTOR, MFT...). */
  source?: ReactNode
  /** Tone affects the source pill color. */
  tone?: 'default' | 'warning' | 'danger' | 'info'
  children?: ReactNode
}

const TONE_PILL: Record<NonNullable<TimelineEventProps['tone']>, string> = {
  default: 'border-forensic-border bg-forensic-surfaceAlt text-forensic-textMuted',
  warning: 'border-amber-500/40 bg-amber-500/10 text-amber-700 dark:text-amber-300',
  danger: 'border-rose-500/40 bg-rose-500/10 text-rose-700 dark:text-rose-300',
  info: 'border-sky-500/40 bg-sky-500/10 text-sky-700 dark:text-sky-300',
}

export function TimelineEvent({
  time,
  title,
  source,
  tone = 'default',
  children,
}: TimelineEventProps) {
  return (
    <div className="flex flex-col gap-1">
      <div className="flex flex-wrap items-baseline gap-x-3">
        <time className="font-mono text-[11px] uppercase tracking-wide text-forensic-textMuted">
          {time}
        </time>
        {source && (
          <span
            className={cn(
              'inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide',
              TONE_PILL[tone],
            )}
          >
            {source}
          </span>
        )}
      </div>
      <p className="text-sm font-semibold text-forensic-text [&_code]:rounded [&_code]:bg-forensic-surfaceAlt [&_code]:px-1 [&_code]:py-0.5 [&_code]:text-[13px] [&_code]:font-medium [&_code]:text-forensic-primary">
        {title}
      </p>
      {children && (
        <div className="text-[13px] leading-relaxed text-forensic-text/75 [&_code]:rounded [&_code]:bg-forensic-surfaceAlt [&_code]:px-1 [&_code]:py-0.5 [&_code]:text-[12px] [&_code]:font-medium [&_code]:text-forensic-primary">
          {children}
        </div>
      )}
    </div>
  )
}

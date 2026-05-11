import { useId, useState, type ReactNode } from 'react'
import { ChevronDown } from 'lucide-react'
import { cn } from '@/lib/utils'

interface DetailsProps {
  /** Header label shown when the section is collapsed. */
  summary: string
  /** Optional small label rendered above the summary, e.g. "Go deeper". */
  eyebrow?: string
  /** If true, the section starts expanded. Defaults to collapsed. */
  defaultOpen?: boolean
  children: ReactNode
}

/**
 * Collapsible "go deeper" section. Custom React (not native `<details>`)
 * so it picks up the same prose styling as the surrounding text and
 * supports an eyebrow label.
 */
export function Details({ summary, eyebrow, defaultOpen = false, children }: DetailsProps) {
  const [open, setOpen] = useState(defaultOpen)
  const reactId = useId()
  return (
    <div className="not-prose my-5 overflow-hidden rounded-lg border border-forensic-border bg-forensic-surface shadow-lab-sm">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-controls={`details-${reactId}`}
        className="flex w-full items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-forensic-surfaceAlt/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-forensic-primary/30"
      >
        <ChevronDown
          className={cn(
            'h-4 w-4 flex-none text-forensic-textMuted transition-transform',
            open && 'rotate-180',
          )}
        />
        <div className="min-w-0 flex-1">
          {eyebrow && (
            <div className="text-[10px] font-semibold uppercase tracking-[0.16em] text-forensic-textMuted">
              {eyebrow}
            </div>
          )}
          <div className="text-sm font-semibold text-forensic-text">{summary}</div>
        </div>
      </button>
      {open && (
        <div id={`details-${reactId}`} className="border-t border-forensic-border px-5 py-4">
          {/* The outer <section> uses `not-prose` so the collapsible chrome
              isn't styled by Tailwind typography. That means we cannot rely
              on `prose` here either (a `not-prose` ancestor disables prose
              for descendants). Instead, set explicit child styles so inline
              elements match the surrounding workbook prose. */}
          <div
            className={cn(
              'space-y-3 text-[15px] leading-relaxed text-forensic-text/90',
              '[&_p]:my-0 [&_ul]:my-0 [&_ol]:my-0',
              '[&_a]:text-forensic-primary [&_a:hover]:underline',
              '[&_strong]:font-semibold [&_strong]:text-forensic-text',
              '[&_code]:rounded [&_code]:bg-forensic-surfaceAlt',
              '[&_code]:px-1 [&_code]:py-0.5 [&_code]:text-[14px]',
              '[&_code]:font-medium [&_code]:text-forensic-primary',
            )}
          >
            {children}
          </div>
        </div>
      )}
    </div>
  )
}

import { useEffect, useRef, useState, type RefObject } from 'react'
import { PanelLeftClose, PanelLeftOpen } from 'lucide-react'
import { cn } from '@/lib/utils'

interface TocItem {
  id: string
  text: string
  level: number
}

interface WorkbookTocProps {
  /** Ref to the article element whose headings should populate the TOC. */
  articleRef: RefObject<HTMLElement>
  /** Ref to the scrollable container the article lives inside. */
  scrollRef: RefObject<HTMLElement>
  /** A value that changes when the rendered MDX changes (e.g. its module). */
  contentKey?: unknown
  /** When true, render only an expand button instead of the full list. */
  collapsed?: boolean
  /** Toggle handler for the collapse button. */
  onToggleCollapsed?: () => void
}

/**
 * Sticky on-page table of contents. Scans the referenced article element
 * for h2/h3 headings, assigns slug ids if they are missing, and renders a
 * clickable list. Smooth-scrolls the parent scroll container to the
 * heading on click and highlights the heading nearest the top of the
 * viewport using an IntersectionObserver.
 */
export function WorkbookToc({
  articleRef,
  scrollRef,
  contentKey,
  collapsed = false,
  onToggleCollapsed,
}: WorkbookTocProps) {
  const [items, setItems] = useState<TocItem[]>([])
  const [activeId, setActiveId] = useState<string | null>(null)
  // Ref to the inner scrollable list so we can scroll the active item into
  // view as the user scrolls past long sections.
  const listRef = useRef<HTMLUListElement>(null)

  useEffect(() => {
    const article = articleRef.current
    if (!article) return
    const headings = Array.from(article.querySelectorAll('h2, h3')) as HTMLHeadingElement[]
    const next: TocItem[] = headings.map((h) => {
      let id = h.id
      if (!id) {
        id = slugify(h.textContent ?? '')
        h.id = id
      }
      return {
        id,
        text: h.textContent ?? '',
        level: h.tagName === 'H2' ? 2 : 3,
      }
    })
    setItems(next)
    setActiveId(next[0]?.id ?? null)
  }, [articleRef, contentKey])

  useEffect(() => {
    if (items.length === 0) return
    const root = scrollRef.current ?? null
    const observer = new IntersectionObserver(
      (entries) => {
        // Track all currently visible headings; pick the topmost as active.
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)
        if (visible[0]) {
          setActiveId((visible[0].target as HTMLElement).id)
        }
      },
      {
        root,
        // Trigger when a heading enters the top ~30% of the scroll area.
        rootMargin: '0px 0px -70% 0px',
        threshold: 0,
      },
    )
    items.forEach((it) => {
      const el = document.getElementById(it.id)
      if (el) observer.observe(el)
    })

    // Bottom-of-page fallback. The IntersectionObserver above only fires
    // for headings that can reach the top 30% of the viewport. If the last
    // section is short enough that it can never scroll up that far, we
    // detect "near the bottom" here and force the last item active.
    const scroller = scrollRef.current
    if (!scroller) return () => observer.disconnect()
    const onScroll = () => {
      const max = scroller.scrollHeight - scroller.clientHeight
      if (max <= 0) return
      if (max - scroller.scrollTop <= 4) {
        setActiveId(items[items.length - 1].id)
      }
    }
    scroller.addEventListener('scroll', onScroll, { passive: true })
    onScroll()
    return () => {
      observer.disconnect()
      scroller.removeEventListener('scroll', onScroll)
    }
  }, [items, scrollRef])

  // Keep the active item visible inside the (scrollable) TOC. Long labs
  // produce TOCs taller than the viewport; without this effect the active
  // highlight slides off-screen and only reappears near the bottom of the
  // article. `block: 'nearest'` only scrolls if the link is outside the
  // visible portion of the list, so already-visible items don't jiggle.
  useEffect(() => {
    if (!activeId || !listRef.current) return
    const link = listRef.current.querySelector(
      `a[href="#${CSS.escape(activeId)}"]`,
    ) as HTMLAnchorElement | null
    if (!link) return
    const listRect = listRef.current.getBoundingClientRect()
    const linkRect = link.getBoundingClientRect()
    if (linkRect.top < listRect.top || linkRect.bottom > listRect.bottom) {
      link.scrollIntoView({ block: 'nearest', behavior: 'smooth' })
    }
  }, [activeId])

  const handleClick = (id: string, e: React.MouseEvent) => {
    e.preventDefault()
    const el = document.getElementById(id)
    if (!el) return
    const scroller = scrollRef.current
    if (scroller) {
      // Read the heading's CSS scroll-margin-top so the offset matches
      // whatever the prose theme set (e.g. `scroll-mt-24`). Falling back
      // to 24px keeps headings from jamming into the top edge.
      const cssMt = parseFloat(getComputedStyle(el).scrollMarginTop || '0')
      const offset = Number.isFinite(cssMt) && cssMt > 0 ? cssMt : 24
      const top =
        el.getBoundingClientRect().top -
        scroller.getBoundingClientRect().top +
        scroller.scrollTop -
        offset
      scroller.scrollTo({ top: Math.max(0, top), behavior: 'smooth' })
    } else {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
    setActiveId(id)
    // Reflect the current section in the URL so refreshing the page
    // lands the reader back at the same heading. `replaceState` is used
    // instead of `pushState` so clicking through many TOC items doesn't
    // pile up history entries the back button has to walk through.
    const url = new URL(window.location.href)
    url.hash = id
    window.history.replaceState(null, '', url.toString())
  }

  if (items.length === 0) return null

  // Single toggle button reused in both collapsed and expanded states so
  // its style and behavior stay in lockstep. The icon swaps based on the
  // current state instead of having two separately styled buttons.
  const toggleButton = onToggleCollapsed ? (
    <button
      type="button"
      onClick={onToggleCollapsed}
      aria-label={collapsed ? 'Expand table of contents' : 'Collapse table of contents'}
      title={collapsed ? 'Expand table of contents' : 'Collapse table of contents'}
      className="flex h-8 w-8 flex-none items-center justify-center rounded-md border border-forensic-border/70 bg-forensic-surface text-forensic-textMuted/80 shadow-lab-sm transition-colors hover:border-forensic-borderBright hover:text-forensic-text"
    >
      {collapsed ? (
        <PanelLeftOpen className="h-4 w-4" />
      ) : (
        <PanelLeftClose className="h-4 w-4" />
      )}
    </button>
  ) : null

  if (collapsed) return toggleButton

  return (
    <nav aria-label="Table of contents">
      <div className="mb-3 flex items-center justify-between gap-2">
        <p className="text-sm font-semibold text-forensic-text">Table of contents</p>
        {toggleButton}
      </div>
      <ul
        ref={listRef}
        // overflow-y-auto so the list can scroll internally when long; the
        // scrollbar itself is hidden visually (scrollbar-width:none for
        // Firefox, ::-webkit-scrollbar:hidden for Chromium/Safari). The
        // useEffect above keeps the active item visible, so the user never
        // needs to scroll the TOC manually.
        className="max-h-[calc(100vh-8rem)] overflow-y-auto border-l border-forensic-border [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {items.map((it) => {
          const isActive = it.id === activeId
          return (
            <li key={it.id}>
              <a
                href={`#${it.id}`}
                onClick={(e) => handleClick(it.id, e)}
                className={cn(
                  '-ml-px block border-l-2 py-1.5 text-[15px] font-medium leading-snug transition-colors',
                  it.level === 3 ? 'pl-6' : 'pl-3',
                  isActive
                    ? 'border-forensic-primary text-forensic-primary'
                    : 'border-transparent text-forensic-textMuted hover:border-forensic-borderBright hover:text-forensic-text',
                )}
              >
                {it.text}
              </a>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

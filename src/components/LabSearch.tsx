import { useEffect, useId, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search, X } from 'lucide-react'
import { LAB_SEARCH_INDEX, type LabSearchDoc } from 'virtual:lab-search-index'
import { cn } from '@/lib/utils'

interface SearchResult {
  doc: LabSearchDoc
  score: number
  /** Pre-rendered snippet with the matched terms wrapped in <mark>. */
  snippet: { before: string; match: string; after: string } | null
}

const MAX_RESULTS = 12
const SNIPPET_RADIUS = 60

/**
 * Top-nav search popover. Indexes every lab MDX at build time via
 * `virtual:lab-search-index`, then does in-memory token matching here.
 * Triggered by clicking the search button or pressing `/` anywhere on
 * the page (when no input is already focused).
 */
export function LabSearch() {
  const navigate = useNavigate()
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [highlight, setHighlight] = useState(0)
  const inputRef = useRef<HTMLInputElement | null>(null)
  const mobileInputRef = useRef<HTMLInputElement | null>(null)
  const wrapperRef = useRef<HTMLDivElement | null>(null)
  const listboxId = useId()
  const optionId = (idx: number) => `${listboxId}-opt-${idx}`

  // Pre-tokenize every doc once. Lowercased, deduped, sorted long-first so
  // longer terms in queries score higher (cheap proxy for specificity).
  const tokenizedDocs = useMemo(
    () =>
      LAB_SEARCH_INDEX.map((doc) => ({
        doc,
        haystack: `${doc.labTitle} ${doc.labNumber} ${doc.sectionTitle} ${doc.text}`.toLowerCase(),
      })),
    [],
  )

  const results = useMemo<SearchResult[]>(() => {
    const q = query.trim().toLowerCase()
    if (q.length < 2) return []
    const tokens = q.split(/\s+/).filter((t) => t.length >= 2)
    if (tokens.length === 0) return []
    const out: SearchResult[] = []
    for (const { doc, haystack } of tokenizedDocs) {
      let score = 0
      let firstMatchAt = -1
      for (const t of tokens) {
        const idx = haystack.indexOf(t)
        if (idx === -1) continue
        // Title hits weigh more than body hits.
        const titleHit = doc.sectionTitle.toLowerCase().includes(t) || doc.labTitle.toLowerCase().includes(t)
        score += titleHit ? 5 : 1
        if (firstMatchAt === -1 || idx < firstMatchAt) firstMatchAt = idx
      }
      if (score === 0) continue

      // Build a snippet centered on the first match in the body text.
      const bodyLower = doc.text.toLowerCase()
      const longest = tokens.reduce((a, b) => (a.length >= b.length ? a : b))
      const matchIdx = bodyLower.indexOf(longest)
      let snippet: SearchResult['snippet'] = null
      if (matchIdx >= 0) {
        const start = Math.max(0, matchIdx - SNIPPET_RADIUS)
        const end = Math.min(doc.text.length, matchIdx + longest.length + SNIPPET_RADIUS)
        snippet = {
          before: (start > 0 ? '… ' : '') + doc.text.slice(start, matchIdx),
          match: doc.text.slice(matchIdx, matchIdx + longest.length),
          after: doc.text.slice(matchIdx + longest.length, end) + (end < doc.text.length ? ' …' : ''),
        }
      }
      out.push({ doc, score, snippet })
    }
    out.sort((a, b) => b.score - a.score)
    return out.slice(0, MAX_RESULTS)
  }, [query, tokenizedDocs])

  // Reset highlighted result when the query changes.
  useEffect(() => {
    setHighlight(0)
  }, [query])

  // Open / close interactions: focus the input on open, close on outside
  // click or Escape, and bind a global "/" shortcut to focus the input
  // unless the user is already typing somewhere.
  useEffect(() => {
    if (open) {
      // Defer focus to next frame so the input is in the DOM. Prefer the
      // visible input: on mobile that is the one inside the popover, on
      // desktop it is the inline input in the trigger.
      const id = requestAnimationFrame(() => {
        const isMobile = window.matchMedia('(max-width: 639px)').matches
        if (isMobile) mobileInputRef.current?.focus()
        else inputRef.current?.focus()
      })
      return () => cancelAnimationFrame(id)
    }
  }, [open])

  // Always-on `/` shortcut. Bound once for the component's lifetime so
  // toggling `open` does not rebind a global listener every render.
  useEffect(() => {
    const onSlash = (e: KeyboardEvent) => {
      if (e.key !== '/') return
      const target = e.target as HTMLElement | null
      const tag = target?.tagName
      const isTyping =
        tag === 'INPUT' || tag === 'TEXTAREA' || target?.isContentEditable === true
      if (isTyping) return
      e.preventDefault()
      setOpen(true)
      inputRef.current?.focus()
    }
    document.addEventListener('keydown', onSlash)
    return () => document.removeEventListener('keydown', onSlash)
  }, [])

  // Escape closes the popover, but only when it is open.
  useEffect(() => {
    if (!open) return
    const onEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false)
    }
    document.addEventListener('keydown', onEscape)
    return () => document.removeEventListener('keydown', onEscape)
  }, [open])

  useEffect(() => {
    if (!open) return
    const onDown = (e: MouseEvent) => {
      if (!wrapperRef.current) return
      if (!wrapperRef.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', onDown)
    return () => document.removeEventListener('mousedown', onDown)
  }, [open])

  const goTo = (r: SearchResult) => {
    setOpen(false)
    setQuery('')
    navigate(`/labs/${r.doc.labId}#${r.doc.sectionAnchor}`)
  }

  const onInputKey = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setHighlight((h) => Math.min(results.length - 1, h + 1))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setHighlight((h) => Math.max(0, h - 1))
    } else if (e.key === 'Enter' && results[highlight]) {
      e.preventDefault()
      goTo(results[highlight])
    }
  }

  return (
    <div ref={wrapperRef} className="relative">
      {/* Mobile: icon-only trigger that opens the popover (and focuses
          the input rendered inside it). The full input is hidden below
          sm so the nav stays compact. */}
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label="Search labs"
        aria-expanded={open}
        className="flex h-8 w-8 items-center justify-center rounded-md text-zinc-400 transition-colors hover:bg-white/10 hover:text-zinc-100 focus-visible:bg-white/10 focus-visible:text-zinc-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40 sm:hidden"
      >
        <Search className="h-4 w-4" />
      </button>
      <div
        className={cn(
          'hidden items-center gap-2 rounded-md border border-white/15 bg-white/5 px-2.5 py-1.5 transition-colors sm:flex',
          open
            ? 'border-white/30 bg-white/10'
            : 'hover:border-white/25 hover:bg-white/10',
        )}
      >
        <Search className="h-3.5 w-3.5 flex-none text-zinc-400" />
        <input
          ref={inputRef}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setOpen(true)}
          onKeyDown={onInputKey}
          type="text"
          role="combobox"
          aria-label="Search labs"
          aria-expanded={open && results.length > 0}
          aria-controls={listboxId}
          aria-autocomplete="list"
          aria-activedescendant={
            open && results.length > 0 ? optionId(highlight) : undefined
          }
          placeholder="Search labs"
          className="w-36 bg-transparent text-xs font-medium text-zinc-100 placeholder:text-zinc-500 focus:outline-none sm:w-44"
        />
        {query ? (
          <button
            type="button"
            onClick={() => {
              setQuery('')
              inputRef.current?.focus()
            }}
            aria-label="Clear search"
            className="flex-none text-zinc-400 hover:text-zinc-100"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        ) : (
          <kbd className="hidden flex-none rounded border border-white/20 bg-white/5 px-1 font-mono text-[10px] text-zinc-400 sm:inline">
            /
          </kbd>
        )}
      </div>

      {open && (
        <div
          className="fixed inset-x-3 top-14 z-50 mx-auto max-h-[calc(100vh-5rem)] max-w-[28rem] overflow-hidden rounded-lg border border-forensic-codeBorder bg-forensic-codeBg shadow-2xl shadow-black/50 sm:absolute sm:inset-x-auto sm:right-0 sm:top-auto sm:mt-2 sm:max-h-none sm:w-[28rem] sm:max-w-[calc(100vw-2rem)]"
        >
          {/* Mobile-only input rendered inside the popover, since the
              trigger above sm collapses to an icon. */}
          <div className="flex items-center gap-2 border-b border-forensic-codeBorder px-3 py-2 sm:hidden">
            <Search className="h-3.5 w-3.5 flex-none text-zinc-400" />
            <input
              ref={mobileInputRef}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={onInputKey}
              type="text"
              role="combobox"
              aria-label="Search labs"
              aria-expanded={results.length > 0}
              aria-controls={listboxId}
              aria-autocomplete="list"
              aria-activedescendant={
                results.length > 0 ? optionId(highlight) : undefined
              }
              placeholder="Search labs"
              className="w-full bg-transparent text-sm text-zinc-100 placeholder:text-zinc-500 focus:outline-none"
            />
            {query && (
              <button
                type="button"
                onClick={() => {
                  setQuery('')
                  mobileInputRef.current?.focus()
                }}
                aria-label="Clear search"
                className="flex-none text-zinc-400 hover:text-zinc-100"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
          <div className="nav-popover-scroll max-h-[28rem] overflow-y-auto py-1">
            {query.trim().length < 2 ? (
              <p className="px-3 py-4 text-[12px] text-zinc-400">
                Type at least two characters to search every lab writeup. Press{' '}
                <kbd className="rounded border border-forensic-codeBorder bg-white/10 px-1 font-mono text-[10px]">
                  ↑
                </kbd>{' '}
                <kbd className="rounded border border-forensic-codeBorder bg-white/10 px-1 font-mono text-[10px]">
                  ↓
                </kbd>{' '}
                to move,{' '}
                <kbd className="rounded border border-forensic-codeBorder bg-white/10 px-1 font-mono text-[10px]">
                  Enter
                </kbd>{' '}
                to open.
              </p>
            ) : results.length === 0 ? (
              <p className="px-3 py-4 text-[12px] text-zinc-400">
                No matches for <span className="font-mono text-zinc-200">{query}</span>.
              </p>
            ) : (
              <ul id={listboxId} role="listbox" aria-label="Search results">
                {results.map((r, idx) => (
                  <li
                    key={`${r.doc.labId}-${r.doc.sectionAnchor}-${idx}`}
                    id={optionId(idx)}
                    role="option"
                    aria-selected={idx === highlight}
                  >
                    <button
                      type="button"
                      tabIndex={-1}
                      onClick={() => goTo(r)}
                      onMouseEnter={() => setHighlight(idx)}
                      className={cn(
                        'flex w-full flex-col gap-1 px-3 py-2 text-left transition-colors',
                        idx === highlight ? 'bg-white/10' : 'hover:bg-white/5',
                      )}
                    >
                      <div className="flex items-center gap-2 text-[11px]">
                        <span className="rounded bg-white/10 px-1.5 py-0.5 font-semibold text-zinc-200">
                          {r.doc.labNumber}
                        </span>
                        <span className="truncate text-zinc-300">{r.doc.labTitle}</span>
                        <span className="text-zinc-500">·</span>
                        <span className="truncate font-semibold text-zinc-100">
                          {r.doc.sectionTitle}
                        </span>
                      </div>
                      {r.snippet && (
                        <p className="text-[12px] leading-snug text-zinc-400">
                          {r.snippet.before}
                          <mark className="rounded bg-amber-400/30 px-0.5 text-amber-100">
                            {r.snippet.match}
                          </mark>
                          {r.snippet.after}
                        </p>
                      )}
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

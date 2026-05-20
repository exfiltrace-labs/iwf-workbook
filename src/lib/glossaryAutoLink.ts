import { GLOSSARY } from '@/content/glossary'

type GlossaryEntry = (typeof GLOSSARY)[number]

/**
 * Walk every paragraph and list item under `article`, find the first
 * occurrence of each glossary term in the body text, and wrap it in a
 * tooltip span. Each term is decorated at most once per pass so the
 * prose stays readable.
 *
 * Pulled out of `LabWorkbook` so the layout component stays focused on
 * layout. The tooltip itself is plain DOM, not React: MDX renders the
 * article into a static tree at mount, and rebuilding it through React
 * components every time would mean reauthoring every glossary term in
 * MDX. Doing it imperatively after the fact lets authors keep writing
 * plain prose.
 *
 * Idempotent: a second call against an already-decorated article picks
 * up the terms that the first call already wrapped and treats them as
 * used, so it doesn't keep wrapping further occurrences. This matters
 * in React 18 dev mode, where StrictMode double-invokes the mount
 * effect that calls this function.
 */
export function autoLinkGlossary(article: HTMLElement): void {
  const phrases = collectPhrases()
  if (phrases.length === 0) return

  const usedTerms = new Set<string>()
  seedUsedTermsFromExistingSpans(article, phrases, usedTerms)

  // Walk all text nodes inside paragraphs and list items only. We do not
  // want to touch headings, code blocks, tables, or callouts.
  const walker = document.createTreeWalker(article, NodeFilter.SHOW_TEXT, {
    acceptNode(node) {
      const parent = node.parentElement
      if (!parent) return NodeFilter.FILTER_REJECT
      const skip = parent.closest(
        'h1, h2, h3, h4, h5, h6, code, pre, a, .glossary-term, .not-prose, .heading-anchor',
      )
      if (skip) return NodeFilter.FILTER_REJECT
      const inProse = parent.closest('p, li')
      if (!inProse) return NodeFilter.FILTER_REJECT
      return NodeFilter.FILTER_ACCEPT
    },
  })

  const textNodes: Text[] = []
  let cur: Node | null
  while ((cur = walker.nextNode())) textNodes.push(cur as Text)

  for (const node of textNodes) {
    const text = node.nodeValue ?? ''
    if (!text.trim()) continue

    const earliest = findEarliestMatch(text, phrases, usedTerms)
    if (!earliest) continue

    const { entry, phrase, index } = earliest
    const before = text.slice(0, index)
    const after = text.slice(index + phrase.length)
    const span = buildTermSpan(entry, phrase)

    const parent = node.parentNode
    if (!parent) continue
    if (before) parent.insertBefore(document.createTextNode(before), node)
    parent.insertBefore(span, node)
    if (after) parent.insertBefore(document.createTextNode(after), node)
    parent.removeChild(node)
    usedTerms.add(entry.term)
  }
}

interface Phrase {
  entry: GlossaryEntry
  phrase: string
}

function collectPhrases(): Phrase[] {
  const out: Phrase[] = []
  for (const entry of GLOSSARY) {
    out.push({ entry, phrase: entry.term })
    for (const alias of entry.aliases ?? []) out.push({ entry, phrase: alias })
  }
  // Sort longest first so longer phrases win when one is a prefix of another.
  out.sort((a, b) => b.phrase.length - a.phrase.length)
  return out
}

/**
 * Scan the article for `.glossary-term` spans that already exist (either
 * because a prior pass of this function ran, or because an MDX author used
 * a `<Definition>` inline component) and record the glossary terms they
 * represent. Keeps the function idempotent across repeated invocations.
 *
 * The visible label sits in each span's first child element in both
 * cases - either `.glossary-term-label` for spans this function built,
 * or the first inline `<span tabIndex={0}>` for `<Definition>`. Reading
 * that label and looking it up against the known phrases yields the
 * canonical entry term, regardless of which phrase variant was matched.
 */
function seedUsedTermsFromExistingSpans(
  article: HTMLElement,
  phrases: Phrase[],
  usedTerms: Set<string>,
): void {
  const spans = article.querySelectorAll<HTMLElement>('.glossary-term')
  if (spans.length === 0) return

  const phraseToTerm = new Map<string, string>()
  for (const { entry, phrase } of phrases) {
    phraseToTerm.set(phrase.toLowerCase(), entry.term)
  }

  for (const span of spans) {
    const label = span.firstElementChild?.textContent?.trim().toLowerCase()
    if (!label) continue
    const canonical = phraseToTerm.get(label)
    if (canonical) usedTerms.add(canonical)
  }
}

function findEarliestMatch(
  text: string,
  phrases: Phrase[],
  usedTerms: Set<string>,
): { entry: GlossaryEntry; phrase: string; index: number } | null {
  let best: { entry: GlossaryEntry; phrase: string; index: number } | null = null
  for (const { entry, phrase } of phrases) {
    if (usedTerms.has(entry.term)) continue
    const re = new RegExp(`\\b${escapeRegex(phrase)}\\b`, 'i')
    const m = re.exec(text)
    if (m && (best === null || m.index < best.index)) {
      best = { entry, phrase: m[0], index: m.index }
    }
  }
  return best
}

let tooltipIdCounter = 0

function buildTermSpan(entry: GlossaryEntry, matchedPhrase: string): HTMLSpanElement {
  const tooltipId = `glossary-tooltip-${++tooltipIdCounter}`

  const span = document.createElement('span')
  span.className = 'glossary-term group'
  span.setAttribute('tabindex', '0')
  span.setAttribute('aria-describedby', tooltipId)

  const termText = document.createElement('span')
  termText.className = 'glossary-term-label'
  termText.textContent = matchedPhrase
  span.appendChild(termText)

  const tooltip = document.createElement('span')
  tooltip.className = 'glossary-term-tooltip'
  tooltip.id = tooltipId
  tooltip.setAttribute('role', 'tooltip')

  // When the term is near a viewport edge the centered tooltip would
  // overflow off-screen. On hover/focus, measure the tooltip and shift
  // it horizontally just enough to keep it inside the viewport. The
  // shift is exposed to CSS via `--tooltip-shift`.
  const adjust = () => {
    tooltip.style.setProperty('--tooltip-shift', '0px')
    const rect = tooltip.getBoundingClientRect()
    const margin = 8
    let shift = 0
    if (rect.left < margin) shift = margin - rect.left
    else if (rect.right > window.innerWidth - margin)
      shift = window.innerWidth - margin - rect.right
    if (shift !== 0) {
      tooltip.style.setProperty('--tooltip-shift', `${shift}px`)
    }
  }
  span.addEventListener('mouseenter', adjust)
  span.addEventListener('focusin', adjust)

  const titleEl = document.createElement('span')
  titleEl.className = 'glossary-term-tooltip-title'
  titleEl.textContent = entry.term
  const defEl = document.createElement('span')
  renderInlineMarkdown(entry.definition, defEl)
  tooltip.appendChild(titleEl)
  tooltip.appendChild(defEl)
  span.appendChild(tooltip)
  return span
}

function escapeRegex(input: string): string {
  return input.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

/**
 * Tiny inline-markdown renderer for glossary tooltips. Supports a fixed
 * subset of common markup so definitions can mix prose with code, bold,
 * and italic without us shipping a full markdown parser into the runtime.
 *
 * Recognized:
 *   - `code`     -> <code>
 *   - **bold**   -> <strong>
 *   - *italic*   -> <em>
 *   - _italic_   -> <em>
 *
 * Inline code is parsed first so its contents are taken verbatim and the
 * other formatters cannot match inside it.
 */
function renderInlineMarkdown(input: string, target: HTMLElement) {
  const codeRegex = /`([^`]+)`/g
  let lastIndex = 0
  let m: RegExpExecArray | null
  while ((m = codeRegex.exec(input))) {
    if (m.index > lastIndex) {
      appendBoldItalic(input.slice(lastIndex, m.index), target)
    }
    const code = document.createElement('code')
    code.textContent = m[1]
    target.appendChild(code)
    lastIndex = codeRegex.lastIndex
  }
  if (lastIndex < input.length) {
    appendBoldItalic(input.slice(lastIndex), target)
  }
}

function appendBoldItalic(input: string, target: HTMLElement) {
  // Combined regex: bold (**...**), italic-asterisk (*...*), italic-
  // underscore (_..._). Capture group 1 = bold text, 2 = italic-asterisk
  // text, 3 = italic-underscore text.
  const re = /\*\*([^*]+)\*\*|\*([^*]+)\*|_([^_]+)_/g
  let lastIndex = 0
  let m: RegExpExecArray | null
  while ((m = re.exec(input))) {
    if (m.index > lastIndex) {
      target.appendChild(document.createTextNode(input.slice(lastIndex, m.index)))
    }
    if (m[1] != null) {
      const strong = document.createElement('strong')
      strong.textContent = m[1]
      target.appendChild(strong)
    } else if (m[2] != null || m[3] != null) {
      const em = document.createElement('em')
      em.textContent = (m[2] ?? m[3])!
      target.appendChild(em)
    }
    lastIndex = re.lastIndex
  }
  if (lastIndex < input.length) {
    target.appendChild(document.createTextNode(input.slice(lastIndex)))
  }
}

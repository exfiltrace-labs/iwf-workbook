import { useState, type ReactNode, isValidElement } from 'react'
import { Check, Copy } from 'lucide-react'

interface CodeBlockProps {
  children?: ReactNode
}

/**
 * Replacement for the default `<pre>` element rendered by MDX/markdown.
 * Wraps the inner `<code>` in a styled card with a copy button. Detects
 * the language from the inner code element's className when present
 * (e.g. `language-powershell`).
 */
export function CodeBlock({ children }: CodeBlockProps) {
  const [copied, setCopied] = useState(false)

  // Markdown gives us <pre><code className="language-x">...</code></pre>.
  // Pull the text, language, and (optional) filename out of the inner <code>.
  let text = ''
  let language: string | undefined
  let title: string | undefined

  if (
    isValidElement<{ className?: string; children?: ReactNode; 'data-title'?: string }>(
      children,
    )
  ) {
    const className = children.props.className ?? ''
    const match = /language-([\w-]+)/.exec(className)
    if (match) language = match[1]
    title = children.props['data-title']
    text = extractText(children.props.children)
  } else {
    text = extractText(children)
  }

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    } catch {
      /* clipboard not available */
    }
  }

  return (
    <div className="not-prose group my-5 overflow-hidden rounded-lg border border-forensic-snippetBorder bg-forensic-snippetBg text-forensic-snippetText">
      <div className="flex items-center gap-3 border-b border-forensic-snippetBorder bg-forensic-snippetHeader px-3 py-1.5">
        {language ? (
          <span className="flex-none text-[10px] font-semibold uppercase tracking-[0.16em] text-forensic-snippetMuted">
            {language}
          </span>
        ) : (
          <span className="flex-none" />
        )}
        <span className="min-w-0 flex-1 truncate text-center font-mono text-[12px] text-forensic-snippetText">
          {title ?? ''}
        </span>
        <button
          type="button"
          onClick={handleCopy}
          className="inline-flex flex-none items-center gap-1.5 rounded-md border border-forensic-snippetBorder bg-forensic-snippetBorder/40 px-2 py-1 text-[11px] font-medium text-forensic-snippetText transition-colors hover:bg-forensic-snippetBorder/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-forensic-primary/40"
          aria-label="Copy code"
        >
          {copied ? (
            <>
              <Check className="h-3 w-3 text-forensic-corroborated" />
              Copied
            </>
          ) : (
            <>
              <Copy className="h-3 w-3" />
              Copy
            </>
          )}
        </button>
      </div>
      <pre className="overflow-x-auto px-4 py-3 text-[13px] leading-relaxed font-mono">
        {children}
      </pre>
    </div>
  )
}

function extractText(node: ReactNode): string {
  if (node == null || typeof node === 'boolean') return ''
  if (typeof node === 'string' || typeof node === 'number') return String(node)
  if (Array.isArray(node)) return node.map(extractText).join('')
  if (isValidElement<{ children?: ReactNode }>(node)) return extractText(node.props.children)
  return ''
}

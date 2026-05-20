import { useMemo } from 'react'
import { cn } from '@/lib/utils'

interface HexHighlight {
  /** Byte offset (inclusive) where the highlight begins. */
  start: number
  /** Byte length of the highlight. Must be at least 1. */
  length: number
  /** Optional label rendered in the legend below the view. */
  label?: string
  /** Optional color override; defaults to forensic primary. */
  color?: string
}

interface HexViewProps {
  /**
   * Bytes to render. Accepts:
   * - a hex string ("4D 5A 90 00..." or "4D5A9000...")
   * - an explicit number array
   * - a Uint8Array
   */
  bytes: string | number[] | Uint8Array
  /** Where the first byte sits in the source file. Defaults to 0. */
  offset?: number
  /** Bytes per row. Defaults to 16. */
  width?: number
  /** Highlights to overlay on the bytes. */
  highlights?: HexHighlight[]
  /** Optional caption rendered below the view. */
  caption?: string
  className?: string
}

const DEFAULT_HIGHLIGHT_COLORS = [
  '#7c3aed', // forensic primary
  '#0ea5e9',
  '#f59e0b',
  '#ef4444',
  '#10b981',
]

/**
 * Read-only hex dump view, modeled on the canonical 3-column layout
 * (`offset | hex bytes | ASCII gutter`). Supports overlapping highlights
 * with a small legend underneath, which is the workhorse for any
 * "find the magic header" or "spot the embedded string" exercise.
 *
 * ASCII gutter renders printable ASCII (0x20-0x7e) and Latin-1 (0xA0-0xFF)
 * codepoints. Control characters and undefined Windows-1252 bytes (0x00-0x1F,
 * 0x7F-0x9F) render as `.`. This matches HxD's default ANSI gutter closely
 * enough that, for example, `FF D8 FF E0` renders as `ÿØÿà`.
 */
export function HexView({
  bytes,
  offset = 0,
  width = 16,
  highlights = [],
  caption,
  className,
}: HexViewProps) {
  const data = useMemo(() => normalize(bytes), [bytes])

  // Resolve every byte's highlight (first match wins, so authors can layer
  // a precise highlight inside a broader one if they declare it first).
  const colors = useMemo(() => {
    const out: (string | undefined)[] = new Array(data.length).fill(undefined)
    highlights.forEach((h, idx) => {
      const color = h.color ?? DEFAULT_HIGHLIGHT_COLORS[idx % DEFAULT_HIGHLIGHT_COLORS.length]
      for (let i = h.start; i < h.start + h.length && i < data.length; i++) {
        if (out[i] === undefined) out[i] = color
      }
    })
    return out
  }, [data, highlights])

  // Group bytes into rows of `width`.
  const rows = useMemo(() => {
    const out: { rowOffset: number; bytes: number[]; colors: (string | undefined)[] }[] = []
    for (let i = 0; i < data.length; i += width) {
      out.push({
        rowOffset: offset + i,
        bytes: Array.from(data.slice(i, i + width)),
        colors: colors.slice(i, i + width),
      })
    }
    return out
  }, [data, colors, offset, width])

  return (
    <figure className={cn('not-prose my-6', className)}>
      <div className="overflow-x-auto rounded-lg border border-forensic-snippetBorder bg-forensic-snippetBg p-4 font-mono text-[12px] leading-relaxed text-forensic-snippetText shadow-lab">
        {rows.map((row, rowIdx) => (
          <div key={rowIdx} className="flex gap-4 whitespace-pre">
            <span className="select-none text-forensic-snippetMuted">
              {row.rowOffset.toString(16).padStart(8, '0')}
            </span>
            <span>
              {row.bytes.map((b, i) => (
                <span key={i}>
                  <span
                    style={
                      row.colors[i]
                        ? { backgroundColor: row.colors[i], color: '#fff' }
                        : undefined
                    }
                    className={cn('rounded px-0.5')}
                  >
                    {b.toString(16).padStart(2, '0').toUpperCase()}
                  </span>
                  {i === width / 2 - 1 ? '  ' : i < row.bytes.length - 1 ? ' ' : ''}
                </span>
              ))}
              {/* pad out the final row so the ASCII gutter aligns */}
              {row.bytes.length < width && (
                <span className="text-forensic-snippetMuted/40">
                  {' '.repeat((width - row.bytes.length) * 3)}
                </span>
              )}
            </span>
            <span className="text-forensic-snippetText/80">
              {row.bytes.map((b, i) => {
                const printable = (b >= 0x20 && b <= 0x7e) || (b >= 0xa0 && b <= 0xff)
                const ch = printable ? String.fromCharCode(b) : '.'
                return (
                  <span
                    key={i}
                    style={
                      row.colors[i]
                        ? { backgroundColor: row.colors[i], color: '#fff' }
                        : undefined
                    }
                    className="rounded"
                  >
                    {ch}
                  </span>
                )
              })}
            </span>
          </div>
        ))}
      </div>
      {(highlights.length > 0 || caption) && (
        <figcaption className="mt-2 space-y-1 text-center text-[12px] text-forensic-textMuted">
          {highlights.length > 0 && (
            <ul className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1">
              {highlights.map((h, idx) => {
                const color = h.color ?? DEFAULT_HIGHLIGHT_COLORS[idx % DEFAULT_HIGHLIGHT_COLORS.length]
                return (
                  <li key={idx} className="inline-flex items-center gap-1.5">
                    <span
                      className="inline-block h-2.5 w-2.5 rounded"
                      style={{ backgroundColor: color }}
                    />
                    <span>
                      <span className="font-mono text-[11px]">
                        0x{h.start.toString(16).toUpperCase().padStart(4, '0')}
                      </span>
                      {h.label && <> · {h.label}</>}
                    </span>
                  </li>
                )
              })}
            </ul>
          )}
          {caption && <p className="italic">{caption}</p>}
        </figcaption>
      )}
    </figure>
  )
}

function normalize(input: string | number[] | Uint8Array): Uint8Array {
  if (input instanceof Uint8Array) return input
  if (Array.isArray(input)) return Uint8Array.from(input)
  // Strip whitespace, 0x prefixes, and commas; then read pairs of hex chars.
  const cleaned = input.replace(/0x/gi, '').replace(/[\s,]/g, '')
  if (cleaned.length % 2 !== 0) {
    throw new Error('[HexView] hex string must have an even number of characters')
  }
  const out = new Uint8Array(cleaned.length / 2)
  for (let i = 0; i < cleaned.length; i += 2) {
    const byte = parseInt(cleaned.slice(i, i + 2), 16)
    if (Number.isNaN(byte)) {
      throw new Error(`[HexView] invalid hex pair at offset ${i}: "${cleaned.slice(i, i + 2)}"`)
    }
    out[i / 2] = byte
  }
  return out
}

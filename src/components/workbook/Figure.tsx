import { useState } from 'react'
import * as Dialog from '@radix-ui/react-dialog'
import { X, ZoomIn } from 'lucide-react'

interface FigureProps {
  src: string
  alt?: string
  caption?: string
  /**
   * Optional max width for the figure. Numbers are treated as pixels;
   * strings are passed through (so `"32rem"` or `"60%"` also work).
   * When set, the figure is centered horizontally inside the prose
   * column instead of stretching to fill it.
   */
  width?: number | string
}

/**
 * Image with an optional caption. Use directly in MDX as
 * `<Figure src="/img/foo.png" caption="Initial scene" />` for a captioned
 * figure, or rely on plain markdown `![alt](src)` syntax which is also
 * routed through this component.
 *
 * Clicking the image opens a full-screen lightbox so students can read
 * screenshots of tool output. The lightbox is a Radix Dialog so it traps
 * focus inside, restores focus to the trigger on close, and handles
 * Escape, scroll-lock, and outside-click out of the box.
 */
export function Figure({ src, alt, caption, width }: FigureProps) {
  const [open, setOpen] = useState(false)
  const accessibleName = alt ?? caption ?? 'Figure'
  const maxWidth =
    width === undefined ? undefined : typeof width === 'number' ? `${width}px` : width

  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <figure
        className="not-prose my-6"
        style={maxWidth ? { maxWidth, marginLeft: 'auto', marginRight: 'auto' } : undefined}
      >
        <Dialog.Trigger asChild>
          <button
            type="button"
            aria-label={alt ? `Enlarge figure: ${alt}` : 'Enlarge figure'}
            className="group relative block w-full overflow-hidden rounded-sm border border-forensic-border bg-forensic-surface focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-forensic-primary/40"
          >
            <img
              src={src}
              alt={alt ?? caption ?? ''}
              className="block h-auto w-full"
              loading="lazy"
            />
            <span className="pointer-events-none absolute right-2 top-2 inline-flex items-center gap-1 rounded-md border border-zinc-700/40 bg-zinc-900/70 px-2 py-1 text-[11px] font-medium text-zinc-100 opacity-0 backdrop-blur-sm transition-opacity group-hover:opacity-100">
              <ZoomIn className="h-3 w-3" />
              Click to enlarge
            </span>
          </button>
        </Dialog.Trigger>
        {caption && (
          <figcaption className="mt-2 text-center text-[12px] italic text-forensic-textMuted">
            {caption}
          </figcaption>
        )}
      </figure>

      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-[100] bg-black/85 backdrop-blur-sm data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
        <Dialog.Content
          aria-label={accessibleName}
          onClick={(e) => {
            // Dialog.Content covers the full viewport, so clicks on the
            // empty area around the image never reach the Dialog.Overlay
            // (Radix's built-in "click outside to close" target). Close
            // manually when the click landed on the content element
            // itself rather than on the image, caption, or close button.
            if (e.target === e.currentTarget) setOpen(false)
          }}
          className="fixed inset-0 z-[100] flex flex-col items-center justify-center p-6 focus:outline-none"
        >
          <Dialog.Title className="sr-only">{accessibleName}</Dialog.Title>
          <Dialog.Close
            aria-label="Close"
            className="absolute right-4 top-4 inline-flex h-9 w-9 items-center justify-center rounded-full border border-zinc-600 bg-zinc-900/80 text-zinc-100 transition-colors hover:bg-zinc-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-400"
          >
            <X className="h-4 w-4" />
          </Dialog.Close>
          <img
            src={src}
            alt={alt ?? caption ?? ''}
            className="max-h-[85vh] max-w-[90vw] cursor-default rounded-md border border-zinc-700/60 bg-forensic-surface object-contain shadow-2xl"
          />
          {caption && (
            <p className="mt-3 max-w-[80vw] text-center text-[13px] italic text-zinc-300">
              {caption}
            </p>
          )}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}

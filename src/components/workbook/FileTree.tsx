import { Children, isValidElement, useState, type ReactNode } from 'react'
import { ChevronRight, Folder, FolderOpen, File as FileIcon } from 'lucide-react'
import { cn } from '@/lib/utils'

interface FileTreeProps {
  children?: ReactNode
  /** Optional caption rendered below the tree. */
  caption?: ReactNode
  /** Window title shown in the header strip. Defaults to "File Explorer". */
  title?: ReactNode
  className?: string
}

/**
 * Visual file system browser modeled on a Windows Explorer pane. Children
 * should be `<TreeFolder>` and `<TreeFile>` nodes; folders may nest.
 * Designed to be authored declaratively from MDX so writeups can sketch
 * a directory layout (Recycle Bin, Prefetch folder, user profile) without
 * dropping a screenshot.
 */
export function FileTree({
  children,
  caption,
  title = 'File Explorer',
  className,
}: FileTreeProps) {
  return (
    <figure className={cn('not-prose my-6', className)}>
      <div className="overflow-hidden rounded-lg border border-forensic-border bg-forensic-surface shadow-lab-sm">
        <div className="flex items-center gap-2 border-b border-forensic-border bg-forensic-surfaceAlt/60 px-3 py-2">
          <span className="text-[10px] font-semibold uppercase tracking-wider text-forensic-textMuted">
            {title}
          </span>
        </div>
        <ul className="px-2 py-2 font-mono text-[12px]">{children}</ul>
      </div>
      {caption && (
        <figcaption className="mt-2 text-center text-[12px] italic text-forensic-textMuted">
          {caption}
        </figcaption>
      )}
    </figure>
  )
}

interface TreeFolderProps {
  /** Display name for the folder. */
  name: ReactNode
  /** Whether the folder starts expanded. Defaults to true. */
  defaultOpen?: boolean
  /** Highlight this folder to draw the eye. */
  highlight?: boolean
  /** Optional one-line annotation rendered to the right (e.g. "8 items"). */
  meta?: ReactNode
  children?: ReactNode
}

export function TreeFolder({
  name,
  defaultOpen = true,
  highlight = false,
  meta,
  children,
}: TreeFolderProps) {
  const [open, setOpen] = useState(defaultOpen)
  const childArray = Children.toArray(children)
  const hasChildren = childArray.some(
    (c) => isValidElement(c) && (c.type === TreeFolder || c.type === TreeFile),
  )

  return (
    <li>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        className={cn(
          'flex w-full items-center gap-1.5 rounded px-1.5 py-0.5 text-left transition-colors hover:bg-forensic-surfaceAlt/60',
          highlight && 'bg-amber-500/15 ring-1 ring-amber-500/40',
        )}
      >
        <ChevronRight
          className={cn(
            'h-3 w-3 flex-none text-forensic-textMuted transition-transform',
            !hasChildren && 'invisible',
            open && 'rotate-90',
          )}
        />
        {open ? (
          <FolderOpen className="h-3.5 w-3.5 flex-none text-amber-500" />
        ) : (
          <Folder className="h-3.5 w-3.5 flex-none text-amber-500" />
        )}
        <span className="min-w-0 flex-1 truncate text-forensic-text">{name}</span>
        {meta && (
          <span className="flex-none text-[10px] text-forensic-textMuted">{meta}</span>
        )}
      </button>
      {open && hasChildren && (
        <ul className="ml-3 border-l border-forensic-border pl-2">{children}</ul>
      )}
    </li>
  )
}

interface TreeFileProps {
  /** File name (e.g. `7ZFM.EXE-0F1D5A3B.pf`). */
  name: ReactNode
  /** Optional one-line annotation rendered to the right (e.g. file size, mtime). */
  meta?: ReactNode
  /** Highlight this row to draw the eye. */
  highlight?: boolean
  /** When true, render the row dimmed to suggest a deleted / hidden item. */
  deleted?: boolean
}

export function TreeFile({ name, meta, highlight, deleted }: TreeFileProps) {
  return (
    <li>
      <div
        className={cn(
          'flex items-center gap-1.5 rounded px-1.5 py-0.5',
          highlight && 'bg-amber-500/15 ring-1 ring-amber-500/40',
        )}
      >
        <span aria-hidden="true" className="h-3 w-3 flex-none" />
        <FileIcon
          className={cn(
            'h-3.5 w-3.5 flex-none',
            deleted ? 'text-forensic-textMuted/50' : 'text-forensic-textMuted',
          )}
        />
        <span
          className={cn(
            'min-w-0 flex-1 truncate text-forensic-text',
            deleted && 'text-forensic-textMuted line-through',
          )}
        >
          {name}
        </span>
        {meta && (
          <span className="flex-none text-[10px] text-forensic-textMuted">{meta}</span>
        )}
      </div>
    </li>
  )
}

import { Children, isValidElement, useState, type ReactNode } from 'react'
import { ChevronRight, Folder, FolderOpen } from 'lucide-react'
import { cn } from '@/lib/utils'

interface RegistryTreeProps {
  children?: ReactNode
  /** Optional caption rendered below the tree. */
  caption?: ReactNode
  /** Window title shown in the header strip. Defaults to "Registry Editor". */
  title?: ReactNode
  className?: string
}

/**
 * Visual stand-in for a Registry Editor pane. Children should be
 * `<RegistryKey>` nodes, optionally containing nested `<RegistryKey>` and
 * `<RegistryValue>` children. Designed to be authored declaratively from
 * MDX so writeups can show "this hive looks like this" without screenshots.
 */
export function RegistryTree({
  children,
  caption,
  title = 'Registry Editor',
  className,
}: RegistryTreeProps) {
  return (
    <figure className={cn('not-prose my-6', className)}>
      <div className="overflow-hidden rounded-lg border border-forensic-border bg-forensic-surface shadow-lab-sm">
        <div className="flex items-center gap-2 border-b border-forensic-border bg-forensic-surfaceAlt/60 px-3 py-2">
          <span className="text-[10px] font-semibold uppercase tracking-wider text-forensic-textMuted">
            {title}
          </span>
        </div>
        <ul className="px-2 py-2 font-mono text-[12px]">
          {children}
        </ul>
      </div>
      {caption && (
        <figcaption className="mt-2 text-center text-[12px] italic text-forensic-textMuted">
          {caption}
        </figcaption>
      )}
    </figure>
  )
}

interface RegistryKeyProps {
  /** Display name for this key (e.g. `USBSTOR` or full path). */
  name: ReactNode
  /** Whether the key starts expanded. Defaults to true. */
  defaultOpen?: boolean
  /** Optional highlight to draw the eye to a key of interest. */
  highlight?: boolean
  children?: ReactNode
}

export function RegistryKey({
  name,
  defaultOpen = true,
  highlight = false,
  children,
}: RegistryKeyProps) {
  const [open, setOpen] = useState(defaultOpen)
  // Split children into nested keys and leaf values, so we can render values
  // as a small table while keys stay nested.
  const childArray = Children.toArray(children)
  const nestedKeys = childArray.filter(
    (c) => isValidElement(c) && c.type === RegistryKey,
  )
  const values = childArray.filter(
    (c) => isValidElement(c) && c.type === RegistryValue,
  )
  const hasChildren = nestedKeys.length + values.length > 0

  return (
    <li>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className={cn(
          'flex w-full items-center gap-1.5 rounded px-1.5 py-0.5 text-left transition-colors hover:bg-forensic-surfaceAlt/60',
          highlight && 'bg-amber-500/15 ring-1 ring-amber-500/40',
        )}
        aria-expanded={open}
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
        <span className="text-forensic-text">{name}</span>
      </button>
      {open && hasChildren && (
        <div className="ml-3 border-l border-forensic-border pl-2">
          {values.length > 0 && (
            <table className="my-1 w-full table-fixed border-collapse">
              <thead>
                <tr className="text-[10px] uppercase tracking-wider text-forensic-textMuted">
                  <th className="w-2/5 py-0.5 pr-2 text-left font-semibold">Name</th>
                  <th className="w-1/5 py-0.5 pr-2 text-left font-semibold">Type</th>
                  <th className="w-2/5 py-0.5 text-left font-semibold">Data</th>
                </tr>
              </thead>
              <tbody>{values}</tbody>
            </table>
          )}
          {nestedKeys.length > 0 && <ul>{nestedKeys}</ul>}
        </div>
      )}
    </li>
  )
}

interface RegistryValueProps {
  /** Value name (e.g. `(Default)` or `LastWrite`). */
  name: ReactNode
  /** Registry data type (`REG_SZ`, `REG_DWORD`, etc.). */
  type?: ReactNode
  /** Stored data, rendered verbatim. */
  data?: ReactNode
  /** Highlight this row to draw the eye. */
  highlight?: boolean
}

export function RegistryValue({ name, type, data, highlight }: RegistryValueProps) {
  return (
    <tr
      className={cn(
        'align-top text-[11px]',
        highlight && 'bg-amber-500/15',
      )}
    >
      <td className="truncate py-0.5 pr-2 text-forensic-text">{name}</td>
      <td className="truncate py-0.5 pr-2 text-forensic-textMuted">{type}</td>
      <td className="truncate py-0.5 text-forensic-text">{data}</td>
    </tr>
  )
}

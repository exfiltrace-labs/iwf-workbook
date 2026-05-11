import { useReferences } from './WorkbookContext'

interface CiteProps {
  /** Reference id, must match an entry in the workbook's `references` prop. */
  id: string
}

/**
 * Inline citation marker. Renders the 1-based index of the referenced
 * source as a small superscript link to the references list at the
 * bottom of the lab. If the id is unknown, renders `[?]`.
 */
export function Cite({ id }: CiteProps) {
  const { references } = useReferences()
  const index = references.findIndex((r) => r.id === id)
  if (index < 0) {
    return <sup className="text-rose-600">[?]</sup>
  }
  return (
    <sup>
      <a
        href={`#ref-${id}`}
        className="ml-0.5 rounded px-0.5 text-[0.7em] font-semibold text-forensic-primary no-underline hover:underline"
        onClick={(e) => {
          e.preventDefault()
          const target = document.getElementById(`ref-${id}`)
          if (target) target.scrollIntoView({ behavior: 'smooth', block: 'center' })
          history.replaceState(null, '', `#ref-${id}`)
        }}
      >
        [{index + 1}]
      </a>
    </sup>
  )
}

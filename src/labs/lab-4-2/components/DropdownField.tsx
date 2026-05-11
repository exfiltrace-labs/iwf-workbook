import { ChevronDown } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { FieldDef } from '../types'

interface DropdownFieldProps {
  field: FieldDef
  value: string
  onChange: (value: string) => void
}

/**
 * Closed-set field rendered as a native <select>. Each option is one of
 * the strings declared in `field.options`. The first option is a
 * disabled placeholder so an empty value reads as "not yet picked"
 * rather than as the first real option.
 */
export function DropdownField({ field, value, onChange }: DropdownFieldProps) {
  const options = field.options ?? []
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-[12.5px] font-medium text-forensic-textMuted">
        {field.label}
      </span>
      <span className="relative">
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={cn(
            'w-full appearance-none rounded-md border bg-forensic-surface px-3 py-2 pr-9 text-[13.5px] text-forensic-text shadow-lab-sm transition-colors',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-forensic-primary/30',
            value
              ? 'border-forensic-borderBright'
              : 'border-forensic-border text-forensic-textMuted',
          )}
        >
          <option value="" disabled>
            Select...
          </option>
          {options.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
        <ChevronDown
          aria-hidden="true"
          className="pointer-events-none absolute right-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-forensic-textMuted"
        />
      </span>
      {field.helpText && (
        <span className="text-[11.5px] leading-snug text-forensic-textMuted">
          {field.helpText}
        </span>
      )}
    </label>
  )
}

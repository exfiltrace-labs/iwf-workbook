import { cn } from '@/lib/utils'
import type { FieldDef } from '../types'

interface TextFieldProps {
  field: FieldDef
  value: string
  onChange: (value: string) => void
}

/**
 * Short typed input. Used for timestamps and hash values where the set
 * of valid answers is too large to enumerate as a dropdown but precise
 * enough to validate by string match (case-insensitive, trimmed).
 *
 * Hash fields render in a monospace font so the hex string reads cleanly.
 */
export function TextField({ field, value, onChange }: TextFieldProps) {
  const isHash = field.id.toLowerCase().includes('sha') || field.id.toLowerCase().includes('hash')
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-[12.5px] font-medium text-forensic-textMuted">
        {field.label}
      </span>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={field.placeholder ?? ''}
        spellCheck={false}
        autoCapitalize="off"
        autoCorrect="off"
        className={cn(
          'w-full rounded-md border bg-forensic-surface px-3 py-2 text-[13.5px] text-forensic-text shadow-lab-sm transition-colors',
          'placeholder:text-forensic-textDim',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-forensic-primary/30',
          value ? 'border-forensic-borderBright' : 'border-forensic-border',
          isHash && 'font-mono text-[12.5px] tracking-tight',
        )}
      />
      {field.helpText && (
        <span className="text-[11.5px] leading-snug text-forensic-textMuted">
          {field.helpText}
        </span>
      )}
    </label>
  )
}

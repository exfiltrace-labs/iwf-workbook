import { cn } from '@/lib/utils'
import type { CustodyEvent } from '../types'
import { DropdownField } from './DropdownField'
import { TextField } from './TextField'

interface TransferRowProps {
  event: CustodyEvent
  values: Record<string, string>
  /** Examiner signature drawn once in the form header. Empty until signed. */
  signature: string
  /** Display name of the examiner whose signature this is. */
  signedBy: string
  /** Display name of the suspect (does not sign the CoC). */
  suspect: string
  active: boolean
  onChangeField: (fieldId: string, value: string) => void
  onFocus: () => void
}

/**
 * One transfer row in the chain-of-custody form. Renders the row's
 * step label, title, and the field grid. Active row gets a highlighted
 * border so its visual link to the matching scenario card on the left
 * pane is obvious.
 */
export function TransferRow({
  event,
  values,
  signature,
  signedBy,
  suspect,
  active,
  onChangeField,
  onFocus,
}: TransferRowProps) {
  return (
    <article
      data-event-id={event.id}
      onFocus={onFocus}
      className={cn(
        'scroll-mt-4 rounded-xl border bg-forensic-surface px-5 py-4 shadow-lab-sm transition-colors',
        active
          ? 'border-forensic-primary/60 ring-2 ring-forensic-primary/20'
          : 'border-forensic-border',
      )}
    >
      <header className="flex items-center gap-3 pb-3">
        <span
          className={cn(
            'flex h-7 w-7 flex-none items-center justify-center rounded-full text-[12px] font-bold',
            active
              ? 'bg-forensic-primary text-white'
              : 'bg-forensic-surfaceAlt text-forensic-text',
          )}
        >
          {event.step}
        </span>
        <h3 className="text-[15px] font-semibold leading-tight text-forensic-text">
          {event.title}
        </h3>
      </header>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {event.fields.map((field) => {
          const value = values[field.id] ?? ''
          if (field.type === 'dropdown') {
            return (
              <DropdownField
                key={field.id}
                field={field}
                value={value}
                onChange={(v) => onChangeField(field.id, v)}
              />
            )
          }
          return (
            <TextField
              key={field.id}
              field={field}
              value={value}
              onChange={(v) => onChangeField(field.id, v)}
            />
          )
        })}
      </div>

      <div className="mt-4 grid grid-cols-1 gap-4 border-t border-forensic-border/60 pt-3 sm:grid-cols-2">
        <SignatureBlock
          party="Released by"
          name={values['released-by'] ?? ''}
          drawnSignature={signature}
          examinerName={signedBy}
          suspect={suspect}
        />
        <SignatureBlock
          party="Received by"
          name={values['received-by'] ?? ''}
          drawnSignature={signature}
          examinerName={signedBy}
          suspect={suspect}
        />
      </div>
    </article>
  )
}

/**
 * One signature display block on a transfer row's footer. If the
 * selected party is the examiner (the student) and the student has
 * drawn their signature in the form header, the drawn signature is
 * rendered here. For any other party, a cursive pseudo-signature is
 * rendered from the person's name. When the dropdown for this party
 * has not been picked yet, the slot reads "Unsigned".
 */
function SignatureBlock({
  party,
  name,
  drawnSignature,
  examinerName,
  suspect,
}: {
  party: string
  name: string
  drawnSignature: string
  examinerName: string
  suspect: string
}) {
  const isExaminer = name === examinerName
  // Suspects do not sign chain-of-custody forms. The suspect's name can
  // legitimately appear as the source of the evidence on the seizure
  // row, but the signature slot stays empty.
  const isSuspect = name.startsWith(suspect)
  const cursiveName = name ? name.split(',')[0].trim() : ''

  return (
    <div className="flex flex-col gap-1">
      <span className="text-[11.5px] font-medium text-forensic-textMuted">
        {party}
      </span>
      <div className="flex h-12 items-center">
        {!name ? (
          <span className="text-[12px] italic text-forensic-textDim">Unsigned</span>
        ) : isSuspect ? (
          <span className="text-[12px] italic text-forensic-textDim">
            Suspect generally does not sign
          </span>
        ) : isExaminer && drawnSignature ? (
          <img
            src={drawnSignature}
            alt={`${name} signature`}
            className="h-12 max-w-full object-contain"
          />
        ) : isExaminer ? (
          <span className="text-[12px] italic text-forensic-textDim">
            Sign the form to apply
          </span>
        ) : (
          <span
            className="text-[22px] leading-none text-forensic-text [font-family:'Brush_Script_MT',_'Lucida_Handwriting',_cursive] italic"
            style={{ transform: 'rotate(-2deg)' }}
          >
            {cursiveName}
          </span>
        )}
      </div>
      {name && (
        <span className="text-[11px] text-forensic-textMuted">{name}</span>
      )}
    </div>
  )
}

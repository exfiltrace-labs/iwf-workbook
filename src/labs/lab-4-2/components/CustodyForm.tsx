import type { ReactNode } from 'react'
import type { CustodyCase, CustodyState } from '../types'
import { SignatureField } from './SignatureField'
import { TransferRow } from './TransferRow'

interface CustodyFormProps {
  caseData: CustodyCase
  state: CustodyState
  activeEventId: string | null
  onChangeField: (eventId: string, fieldId: string, value: string) => void
  onChangeSignature: (value: string) => void
  onFocusEvent: (eventId: string) => void
}

/**
 * Right-pane chain-of-custody form. Renders a small case-info header
 * card at the top, then one TransferRow per event. After the imaging
 * step (the last `chain: 'shared'` row), the rows are grouped under two
 * labeled sections, "Original device" and "Forensic image", to teach
 * that the original and the forensic image are documented as separate
 * evidence items from this point forward.
 */
export function CustodyForm({
  caseData,
  state,
  activeEventId,
  onChangeField,
  onChangeSignature,
  onFocusEvent,
}: CustodyFormProps) {
  const sharedEvents = caseData.events.filter((e) => e.chain === 'shared')
  const originalEvents = caseData.events.filter((e) => e.chain === 'original')
  const imageEvents = caseData.events.filter((e) => e.chain === 'image')

  return (
    <section className="flex h-full min-h-0 w-full flex-col bg-forensic-bg">
      <div className="border-b border-forensic-border bg-forensic-surface/50 px-5 py-3">
        <h2 className="text-[15px] font-semibold leading-tight text-forensic-text">
          Chain of custody form
        </h2>
        <p className="text-[12.5px] text-forensic-textMuted">
          Document each transfer with the 5W1H fields: who, what, when, where, why, and how.
        </p>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto px-5 py-5">
        <div className="mx-auto max-w-3xl space-y-4">
          {/* Case header */}
          <article className="rounded-xl border border-forensic-border bg-forensic-surface px-5 py-4 shadow-lab-sm">
            <h3 className="pb-2 text-[14px] font-semibold text-forensic-text">
              Case information
            </h3>
            <dl className="grid grid-cols-1 gap-x-5 gap-y-1.5 text-[13px] sm:grid-cols-[10rem_minmax(0,1fr)]">
              <HeaderRow label="Case ID" value={caseData.caseHeader.caseId} mono />
              <HeaderRow label="Suspect" value={caseData.scenario.suspect} />
              <HeaderRow label="Lead examiner" value={caseData.caseHeader.leadExaminer} />
              <HeaderRow label="Submitter" value={caseData.caseHeader.submitter} />
              <HeaderRow
                label="Device"
                value={`${caseData.caseHeader.deviceMake} ${caseData.caseHeader.deviceModel}`}
              />
              <HeaderRow
                label="Serial number"
                value={caseData.caseHeader.serialNumber}
                mono
              />
            </dl>
            <div className="mt-4 border-t border-forensic-border pt-4">
              <SignatureField
                value={state.signature}
                onChange={onChangeSignature}
              />
            </div>
          </article>

          {/* Shared chain rows (steps 1-4) */}
          {sharedEvents.map((event) => (
            <TransferRow
              key={event.id}
              event={event}
              values={state.fieldValues[event.id] ?? {}}
              signature={state.signature}
              signedBy={caseData.caseHeader.leadExaminer}
              suspect={caseData.scenario.suspect}
              active={activeEventId === event.id}
              onChangeField={(fieldId, value) => onChangeField(event.id, fieldId, value)}
              onFocus={() => onFocusEvent(event.id)}
            />
          ))}

          {/* After imaging: original device + image documented in parallel */}
          {(originalEvents.length > 0 || imageEvents.length > 0) && (
            <div>
              <div className="mb-2 flex items-center gap-3 text-[13px] font-medium text-forensic-textMuted">
                <span className="h-px flex-1 bg-forensic-border" aria-hidden="true" />
                After imaging, two evidence items to document separately
                <span className="h-px flex-1 bg-forensic-border" aria-hidden="true" />
              </div>
              <div className="space-y-4">
                <ChainColumn label="Original device">
                  {originalEvents.map((event) => (
                    <TransferRow
                      key={event.id}
                      event={event}
                      values={state.fieldValues[event.id] ?? {}}
                      signature={state.signature}
                      signedBy={caseData.caseHeader.leadExaminer}
              suspect={caseData.scenario.suspect}
                      active={activeEventId === event.id}
                      onChangeField={(fieldId, value) =>
                        onChangeField(event.id, fieldId, value)
                      }
                      onFocus={() => onFocusEvent(event.id)}
                    />
                  ))}
                </ChainColumn>
                <ChainColumn label="Forensic image">
                  {imageEvents.map((event) => (
                    <TransferRow
                      key={event.id}
                      event={event}
                      values={state.fieldValues[event.id] ?? {}}
                      signature={state.signature}
                      signedBy={caseData.caseHeader.leadExaminer}
              suspect={caseData.scenario.suspect}
                      active={activeEventId === event.id}
                      onChangeField={(fieldId, value) =>
                        onChangeField(event.id, fieldId, value)
                      }
                      onFocus={() => onFocusEvent(event.id)}
                    />
                  ))}
                </ChainColumn>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  )
}

function HeaderRow({
  label,
  value,
  mono,
}: {
  label: string
  value: string
  mono?: boolean
}) {
  return (
    <div className="contents">
      <dt className="text-forensic-textMuted">{label}</dt>
      <dd
        className={
          mono
            ? 'font-mono text-[12.5px] text-forensic-text'
            : 'text-forensic-text'
        }
      >
        {value}
      </dd>
    </div>
  )
}

function ChainColumn({
  label,
  children,
}: {
  label: string
  children: ReactNode
}) {
  return (
    <div>
      <h4 className="pb-2 text-[14px] font-semibold text-forensic-primary">
        {label}
      </h4>
      <div className="space-y-3">{children}</div>
    </div>
  )
}

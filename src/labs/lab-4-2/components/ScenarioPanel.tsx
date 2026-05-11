import type { CustodyCase, CustodyState } from '../types'
import { EventCard } from './EventCard'

interface ScenarioPanelProps {
  caseData: CustodyCase
  state: CustodyState
  activeEventId: string | null
  onSelectEvent: (eventId: string) => void
}

/**
 * Left pane of the custody workspace. Shows the scenario header (case
 * title and suspect) and a vertical list of EventCard components, one
 * per documented transfer step.
 *
 * Active event is the one the student is currently filling in on the
 * right pane. Clicking a card here marks that event active and is the
 * intended way to navigate between transfer rows.
 */
export function ScenarioPanel({
  caseData,
  state,
  activeEventId,
  onSelectEvent,
}: ScenarioPanelProps) {
  return (
    <aside className="flex h-full min-h-0 w-full flex-col border-r border-forensic-border bg-forensic-surfaceAlt/30">
      <div className="border-b border-forensic-border bg-forensic-surface/50 px-5 py-3">
        <h2 className="text-[15px] font-semibold leading-tight text-forensic-text">
          Scenario timeline
        </h2>
        <p className="text-[12.5px] text-forensic-textMuted">
          Read each event, then document the matching row on the right.
        </p>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto px-4 py-4">
        <div className="space-y-2.5">
          {caseData.events.map((event) => {
            const eventValues = state.fieldValues[event.id] ?? {}
            const filled = event.fields.filter((f) => {
              const v = eventValues[f.id] ?? ''
              return v.trim().length > 0
            }).length
            return (
              <EventCard
                key={event.id}
                event={event}
                active={activeEventId === event.id}
                filledCount={filled}
                totalFields={event.fields.length}
                onClick={() => onSelectEvent(event.id)}
              />
            )
          })}
        </div>
      </div>
    </aside>
  )
}

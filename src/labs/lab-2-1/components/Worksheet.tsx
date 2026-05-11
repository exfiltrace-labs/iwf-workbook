import type { ReactNode } from 'react'
import { FindingRow } from './FindingRow'
import { ConclusionPicker } from './ConclusionPicker'
import type {
  Artifact,
  CaseData,
  HrQuestion,
  QuestionId,
  Tag,
} from '../types'

interface WorksheetProps {
  caseData: CaseData
  artifacts: Artifact[]
  tagsByArtifact: Record<string, Tag[]>
  conclusions: Record<QuestionId, string | null>
  onOpenArtifact: (artifactId: string) => void
  onUntag: (artifactId: string, questionId: QuestionId) => void
  onSelectConclusion: (questionId: QuestionId, choiceId: string) => void
}

/**
 * Right pane of the Investigation workspace. One section per HR question,
 * each composed of:
 *   - Findings list: every artifact tagged to this question, sorted by
 *     timestamp so the chronology is implicit
 *   - Conclusion picker: multiple-choice control for the student's
 *     answer to the question
 *
 * The HR questions also serve as the page-level headings (no separate
 * "the three questions" panel above) since they are the primary thing
 * the student is here to answer.
 */
export function Worksheet({
  caseData,
  artifacts,
  tagsByArtifact,
  conclusions,
  onOpenArtifact,
  onUntag,
  onSelectConclusion,
}: WorksheetProps) {
  const findingsFor = (qid: QuestionId): Artifact[] => {
    const matches = artifacts.filter((a) =>
      (tagsByArtifact[a.id] ?? []).includes(qid),
    )
    return matches.sort((a, b) => {
      if (a.timestamp && b.timestamp) return a.timestamp.localeCompare(b.timestamp)
      if (a.timestamp) return -1
      if (b.timestamp) return 1
      return 0
    })
  }

  return (
    <section className="flex h-full min-h-0 w-full flex-col bg-forensic-bg">
      <div className="border-b border-forensic-border bg-forensic-surface/50 px-6 py-3">
        <h2 className="text-[15px] font-semibold leading-tight text-forensic-text">
          Your worksheet
        </h2>
        <p className="text-[12.5px] text-forensic-textMuted">
          Tag artifacts to the question they help answer, then commit to a conclusion.
        </p>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto px-6 py-5">
        <div className="mx-auto max-w-2xl space-y-6">
          {caseData.hrQuestions.map((q) => (
            <QuestionBlock
              key={q.id}
              question={q}
              findings={findingsFor(q.id)}
              choices={caseData.conclusionChoices[q.id]}
              selectedChoiceId={conclusions[q.id]}
              onOpenArtifact={onOpenArtifact}
              onUntag={(artifactId) => onUntag(artifactId, q.id)}
              onSelectConclusion={(choiceId) => onSelectConclusion(q.id, choiceId)}
            />
          ))}
        </div>
      </div>
    </section>
  )
}

function QuestionBlock({
  question,
  findings,
  choices,
  selectedChoiceId,
  onOpenArtifact,
  onUntag,
  onSelectConclusion,
}: {
  question: HrQuestion
  findings: Artifact[]
  choices: NonNullable<CaseData['conclusionChoices'][QuestionId]>
  selectedChoiceId: string | null
  onOpenArtifact: (artifactId: string) => void
  onUntag: (artifactId: string) => void
  onSelectConclusion: (choiceId: string) => void
}) {
  return (
    <article className="rounded-xl border border-forensic-border bg-forensic-surface px-6 py-5 shadow-lab-sm">
      <h2 className="text-[17px] font-semibold leading-snug text-forensic-text">
        {question.text}
      </h2>

      <Subsection label={`Findings${findings.length > 0 ? ` (${findings.length})` : ''}`}>
        {findings.length === 0 ? (
          <p className="rounded-md border border-dashed border-forensic-border bg-forensic-surfaceAlt/30 px-3.5 py-2.5 text-[13.5px] italic text-forensic-textMuted">
            No findings yet. Open artifacts on the left and tag any that help answer this question.
          </p>
        ) : (
          <ul className="space-y-1.5">
            {findings.map((a) => (
              <FindingRow
                key={a.id}
                artifact={a}
                onOpen={() => onOpenArtifact(a.id)}
                onUntag={() => onUntag(a.id)}
              />
            ))}
          </ul>
        )}
        {findings.length === 1 && (
          <p className="pt-2 text-[13px] leading-snug text-forensic-herring">
            Look for at least one more independent artifact that tells the same story.
          </p>
        )}
        {findings.length >= 2 && (
          <p className="pt-2 text-[13px] leading-snug text-forensic-corroborated">
            {findings.length} independent witnesses corroborating the same story.
          </p>
        )}
      </Subsection>

      <Subsection label="Your conclusion">
        <ConclusionPicker
          choices={choices}
          selectedId={selectedChoiceId}
          disabled={findings.length < 2}
          disabledMessage="Tag at least two independent artifacts to this question before committing to a conclusion."
          onSelect={onSelectConclusion}
        />
      </Subsection>
    </article>
  )
}

function Subsection({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="pt-4">
      <h3 className="pb-2 text-[14px] font-semibold text-forensic-text">{label}</h3>
      {children}
    </div>
  )
}

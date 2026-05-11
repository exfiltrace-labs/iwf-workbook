/**
 * Local type definitions for Lab 2.1's interactive investigation.
 *
 * Scoped to this lab on purpose. Each interactive lab in the workbook is
 * shaped differently, so the types live next to the lab that uses them
 * rather than in a shared module.
 */

export type QuestionId = 'q1' | 'q2' | 'q3' | 'q4'

export type Tag = QuestionId | 'not-relevant'

/**
 * How an artifact relates to the case.
 *
 *  - `corroborating`: directly answers one or more HR questions; should be
 *    tagged. Missing it counts against the student.
 *  - `context`: anchors the case (logon events, ownership, baselines) but
 *    does not answer a question on its own. Pedagogically useful, less
 *    strictly graded.
 *  - `red-herring`: looks plausibly suspicious or noisy but doesn't move
 *    the investigation forward. Should be left untagged or "set aside".
 */
export type Relevance = 'corroborating' | 'context' | 'red-herring'

export interface HrQuestion {
  id: QuestionId
  shortLabel: string
  text: string
  /**
   * Multi-paragraph teaching note shown in the debrief alongside the
   * student's pick. Reinforces the corroboration logic the question was
   * meant to drill into.
   */
  reinforcement: string
}

export interface ArtifactStack {
  id: string
  label: string
}

export interface ArtifactDataRow {
  label: string
  value: string
  mono?: boolean
}

export interface Artifact {
  id: string
  stackId: string
  name: string
  /** Real-world artifact name(s), e.g. "LNK shortcut files and JumpLists". */
  technicalName: string
  timestamp: string | null
  /** Plain-English description of what this kind of artifact is. */
  whatIsThis: string
  /** Forensic principle the artifact teaches, beyond the immediate data. */
  whyItMatters: string
  data: ArtifactDataRow[]
  promptQuestions: string[]
  relevance: Relevance
  /** HR questions this artifact helps answer. Empty for red-herrings. */
  supportsQuestionIds: QuestionId[]
}

export interface ConclusionChoice {
  id: string
  label: string
  correct: boolean
}

export interface CaseData {
  scenario: {
    title: string
    suspect: string
  }
  hrQuestions: HrQuestion[]
  stacks: ArtifactStack[]
  artifacts: Artifact[]
  conclusionChoices: Record<QuestionId, ConclusionChoice[]>
  debriefNarrative: string[]
}

export interface InvestigationState {
  viewedArtifactIds: string[]
  artifactTags: Record<string, Tag[]>
  conclusions: Record<QuestionId, string | null>
  submittedAt: string | null
}

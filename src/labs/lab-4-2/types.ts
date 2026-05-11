/**
 * Local type definitions for Lab 4.2's interactive chain-of-custody form.
 *
 * Scoped to this lab on purpose. Each interactive lab in the workbook is
 * shaped differently, so the types live next to the lab that uses them
 * rather than in a shared module.
 */

export type FieldType = 'dropdown' | 'text'

/**
 * A single field on a chain-of-custody transfer row.
 *
 * `correct` is the canonical expected value. Dropdowns require an exact
 * match against `correct`. Text fields accept `correct` plus any of the
 * `accept` variants (case-insensitive, trimmed).
 */
export interface FieldDef {
  id: string
  label: string
  type: FieldType
  /** Dropdown only: full list of options (correct + plausible distractors). */
  options?: string[]
  /** Canonical correct answer. */
  correct: string
  /** Text only: additional accepted spellings. */
  accept?: string[]
  /** Optional placeholder shown inside text fields. */
  placeholder?: string
  /** Short note shown beneath the field, used sparingly. */
  helpText?: string
}

/**
 * Which custody chain a row belongs to. After the imaging step the chain
 * forks: the original device goes to evidence storage on its own chain,
 * and the forensic image continues onto the analysis chain.
 */
export type ChainSide = 'shared' | 'original' | 'image'

export interface CustodyEvent {
  id: string
  /** Display label for the step number, e.g. "1", "2", "5a". */
  step: string
  title: string
  /**
   * Narrative paragraphs describing what happened at this step. Rendered
   * as a stack of <p> elements with inline `code` and **bold** support.
   */
  narrative: string[]
  chain: ChainSide
  fields: FieldDef[]
}

export interface CustodyCase {
  scenario: {
    title: string
    suspect: string
    evidenceSummary: string
  }
  caseHeader: {
    caseId: string
    leadExaminer: string
    submitter: string
    deviceMake: string
    deviceModel: string
    serialNumber: string
  }
  events: CustodyEvent[]
}

export interface CustodyState {
  /** Per-event field values, keyed by event id then field id. */
  fieldValues: Record<string, Record<string, string>>
  /**
   * Examiner signature drawn once in the form header. Stored as a base64
   * PNG data URL. Empty string means unsigned. Once signed, the form
   * visually applies it to every row so the student does not have to
   * redraw on each transfer.
   */
  signature: string
  submittedAt: string | null
}

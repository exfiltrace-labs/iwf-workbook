import { createContext, useContext, type ReactNode } from 'react'

/* -------------------------------------------------------------------------- */
/*  Question registry                                                          */
/* -------------------------------------------------------------------------- */

/**
 * Context that lets every `<Question id="...">` rendered in a workbook
 * report itself to its parent `LabWorkbook` so the page header can show
 * a live "n / total answered" indicator.
 */
export interface QuestionRegistryValue {
  /** Record (or update) a question's correctness. Idempotent. */
  set: (id: string, isCorrect: boolean) => void
  /** Drop a question from the registry on unmount. */
  unregister: (id: string) => void
}

export const QuestionRegistryContext = createContext<QuestionRegistryValue | null>(null)

export function useQuestionRegistry(): QuestionRegistryValue | null {
  return useContext(QuestionRegistryContext)
}

/* -------------------------------------------------------------------------- */
/*  References / citations                                                     */
/* -------------------------------------------------------------------------- */

export interface Reference {
  /** Stable id used by `<Cite id="...">` markers in the prose. */
  id: string
  /** Source title or short label shown in the references list. */
  label: ReactNode
  /** Optional URL the reference should link to. */
  url?: string
  /** Optional extra context (author, publication, date). */
  detail?: ReactNode
}

export interface ReferencesValue {
  references: Reference[]
}

export const ReferencesContext = createContext<ReferencesValue>({ references: [] })

export function useReferences(): ReferencesValue {
  return useContext(ReferencesContext)
}

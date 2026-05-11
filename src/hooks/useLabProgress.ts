import {
  emitLabProgress,
  LAB_PROGRESS_EVENT,
  useReactiveLocalStorage,
} from './useReactiveLocalStorage'

// Re-export so existing call sites keep working without changing their
// import path. The constants and the emitter actually live alongside
// the listener wiring in `useReactiveLocalStorage`.
export { emitLabProgress, LAB_PROGRESS_EVENT }

export interface LabProgress {
  /** Number of questions whose persisted answer is locked / correct. */
  answered: number
  /** Total number of declared questions for this lab. */
  total: number
}

/**
 * Reactively count how many questions in a lab the user has answered
 * correctly. Reads `lab-question:<id>` keys directly from localStorage and
 * re-evaluates whenever any `<Question>` updates or whenever another tab
 * writes to storage. Question ids are globally unique across labs (the
 * registry validates this at startup), so no per-lab key prefix is needed.
 */
export function useLabProgress(questionIds: string[]): LabProgress {
  // Stringify so callers passing a fresh array literal each render don't
  // re-trigger the inner effect just because the reference changed.
  const depKey = questionIds.join(',')
  return useReactiveLocalStorage<LabProgress>(
    () => countAnswered(questionIds),
    [depKey],
  )
}

function countAnswered(questionIds: string[]): LabProgress {
  const total = questionIds.length
  if (total === 0) return { answered: 0, total }
  let answered = 0
  for (const id of questionIds) {
    if (isQuestionLocked(id)) answered += 1
  }
  return { answered, total }
}

/** Read one persisted question's `locked` flag. Exported for reuse. */
export function isQuestionLocked(id: string): boolean {
  try {
    const raw = window.localStorage.getItem(`lab-question:${id}`)
    if (!raw) return false
    const parsed = JSON.parse(raw) as { locked?: boolean }
    return parsed?.locked === true
  } catch {
    return false
  }
}

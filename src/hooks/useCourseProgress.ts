import { LABS } from '@/labs/registry'
import { isQuestionLocked } from './useLabProgress'
import { useReactiveLocalStorage } from './useReactiveLocalStorage'

export interface CourseProgress {
  /** Number of progress units answered/completed across the entire course. */
  answered: number
  /** Total number of progress units across the entire course. */
  total: number
  /** Number of labs that are fully complete. */
  labsComplete: number
  /** Total number of labs that contribute to the progress count. */
  labsTracked: number
}

/**
 * Aggregate progress across every lab in the registry. Two kinds of labs
 * contribute progress units:
 *   - Writeup labs with `<Question>` components: each question is a unit,
 *     answered when the question is locked.
 *   - Interactive labs (`isInteractive: true`): each lab is a single unit,
 *     answered when the lab writes its `<labId>:completed` flag.
 * Labs that are neither (no questions and not interactive) are skipped.
 */
export function useCourseProgress(): CourseProgress {
  return useReactiveLocalStorage<CourseProgress>(computeCourseProgress, [])
}

function computeCourseProgress(): CourseProgress {
  let answered = 0
  let total = 0
  let labsComplete = 0
  let labsTracked = 0
  for (const lab of LABS) {
    if (lab.isInteractive) {
      total += 1
      labsTracked += 1
      if (isInteractiveLabCompleted(lab.id)) {
        answered += 1
        labsComplete += 1
      }
      continue
    }
    if (lab.questionIds.length === 0) continue
    labsTracked += 1
    let labAnswered = 0
    for (const id of lab.questionIds) {
      if (isQuestionLocked(id)) labAnswered += 1
    }
    answered += labAnswered
    total += lab.questionIds.length
    if (labAnswered === lab.questionIds.length) labsComplete += 1
  }
  return { answered, total, labsComplete, labsTracked }
}

function isInteractiveLabCompleted(labId: string): boolean {
  if (typeof window === 'undefined') return false
  try {
    return window.localStorage.getItem(`${labId}:completed`) === '1'
  } catch {
    return false
  }
}

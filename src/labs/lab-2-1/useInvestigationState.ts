import { useCallback, useEffect, useState } from 'react'
import type { CaseData, InvestigationState, QuestionId, Tag } from './types'

const STORAGE_KEY = 'lab-2-1:investigation-state'
export const COMPLETED_KEY = 'lab-2-1:completed'

/**
 * Pass criteria for the lab (Option C):
 *   - submitted at least once,
 *   - every HR question has a correct conclusion picked, and
 *   - every HR question has at least one correctly-tagged finding (i.e. an
 *     artifact the student tagged that actually supports that question).
 * The student can still tag a red herring or miss a corroborating artifact
 * and pass; what they cannot do is leave a question with zero relevant
 * findings or pick a wrong conclusion.
 */
export function isLabPassed(state: InvestigationState, caseData: CaseData): boolean {
  if (!state.submittedAt) return false
  for (const q of caseData.hrQuestions) {
    const choiceId = state.conclusions[q.id]
    if (!choiceId) return false
    const choice = caseData.conclusionChoices[q.id].find((c) => c.id === choiceId)
    if (!choice?.correct) return false
    const correctlyTagged = caseData.artifacts.filter(
      (a) =>
        a.supportsQuestionIds.includes(q.id) &&
        (state.artifactTags[a.id] ?? []).includes(q.id),
    )
    if (correctlyTagged.length < 1) return false
  }
  return true
}

/**
 * Read the lab's completion flag from localStorage. Used by the home-grid
 * card to surface a "Complete" indicator for this interactive lab.
 */
export function isLabCompleted(): boolean {
  if (typeof window === 'undefined') return false
  try {
    return window.localStorage.getItem(COMPLETED_KEY) === '1'
  } catch {
    return false
  }
}

const EMPTY_STATE: InvestigationState = {
  viewedArtifactIds: [],
  artifactTags: {},
  conclusions: { q1: null, q2: null, q3: null, q4: null },
  submittedAt: null,
}

function loadInitial(): InvestigationState {
  if (typeof window === 'undefined') return EMPTY_STATE
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) return EMPTY_STATE
    const parsed = JSON.parse(raw) as Partial<InvestigationState>
    return {
      viewedArtifactIds: Array.isArray(parsed.viewedArtifactIds)
        ? parsed.viewedArtifactIds
        : [],
      artifactTags:
        parsed.artifactTags && typeof parsed.artifactTags === 'object'
          ? (parsed.artifactTags as Record<string, Tag[]>)
          : {},
      conclusions: {
        q1: parsed.conclusions?.q1 ?? null,
        q2: parsed.conclusions?.q2 ?? null,
        q3: parsed.conclusions?.q3 ?? null,
        q4: parsed.conclusions?.q4 ?? null,
      },
      submittedAt: parsed.submittedAt ?? null,
    }
  } catch {
    return EMPTY_STATE
  }
}

/**
 * State for the Lab 2.1 investigation workspace. Lives in a single
 * localStorage entry so closing the tab and coming back later resumes
 * the session. Provides four mutators (markViewed, setTags, setConclusion,
 * submit) and a reset that clears the slot entirely.
 *
 * Scoped to this lab. Not a generic interactive-lab hook.
 */
export function useInvestigationState() {
  const [state, setState] = useState<InvestigationState>(loadInitial)

  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
    } catch {
      /* storage may be unavailable; ignore */
    }
  }, [state])

  const markViewed = useCallback((artifactId: string) => {
    setState((prev) => {
      if (prev.viewedArtifactIds.includes(artifactId)) return prev
      return {
        ...prev,
        viewedArtifactIds: [...prev.viewedArtifactIds, artifactId],
      }
    })
  }, [])

  const setTags = useCallback((artifactId: string, tags: Tag[]) => {
    setState((prev) => {
      const next = { ...prev.artifactTags }
      if (tags.length === 0) {
        delete next[artifactId]
      } else {
        next[artifactId] = tags
      }
      return { ...prev, artifactTags: next }
    })
  }, [])

  const setConclusion = useCallback(
    (questionId: QuestionId, choiceId: string | null) => {
      setState((prev) => ({
        ...prev,
        conclusions: { ...prev.conclusions, [questionId]: choiceId },
      }))
    },
    [],
  )

  const submit = useCallback(() => {
    setState((prev) => ({ ...prev, submittedAt: new Date().toISOString() }))
  }, [])

  const reset = useCallback(() => {
    try {
      window.localStorage.removeItem(STORAGE_KEY)
    } catch {
      /* ignore */
    }
    setState(EMPTY_STATE)
  }, [])

  // Full wipe: clears the in-progress state AND the completion flag.
  // Used by the in-header "Start over" action so the student can take
  // the lab from scratch as if they had never opened it. Replay (in the
  // debrief) uses `reset` instead, which preserves the completion badge.
  const resetAll = useCallback(() => {
    try {
      window.localStorage.removeItem(STORAGE_KEY)
      window.localStorage.removeItem(COMPLETED_KEY)
    } catch {
      /* ignore */
    }
    setState(EMPTY_STATE)
  }, [])

  return { state, markViewed, setTags, setConclusion, submit, reset, resetAll }
}

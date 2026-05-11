import { useCallback, useEffect, useState } from 'react'
import type { CustodyCase, CustodyState, FieldDef } from './types'

const STORAGE_KEY = 'lab-4-2:custody-state'
export const COMPLETED_KEY = 'lab-4-2:completed'

const EMPTY_STATE: CustodyState = {
  fieldValues: {},
  signature: '',
  submittedAt: null,
}

function loadInitial(): CustodyState {
  if (typeof window === 'undefined') return EMPTY_STATE
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) return EMPTY_STATE
    const parsed = JSON.parse(raw) as Partial<CustodyState>
    return {
      fieldValues:
        parsed.fieldValues && typeof parsed.fieldValues === 'object'
          ? (parsed.fieldValues as CustodyState['fieldValues'])
          : {},
      signature: typeof parsed.signature === 'string' ? parsed.signature : '',
      submittedAt: parsed.submittedAt ?? null,
    }
  } catch {
    return EMPTY_STATE
  }
}

/**
 * Returns true if `value` is an acceptable answer for `field`. Dropdowns
 * require an exact match against `field.correct`. Text fields normalise
 * casing and whitespace and check against `field.correct` plus any
 * `field.accept` variants.
 */
export function isFieldCorrect(field: FieldDef, value: string): boolean {
  if (field.type === 'dropdown') {
    return value === field.correct
  }
  const normal = value.trim().toLowerCase()
  if (!normal) return false
  if (normal === field.correct.trim().toLowerCase()) return true
  for (const variant of field.accept ?? []) {
    if (normal === variant.trim().toLowerCase()) return true
  }
  return false
}

/**
 * Pass criteria: submitted at least once AND at least 80% of all fields
 * across all events filled correctly. The threshold is intentionally
 * forgiving so a careful student can still pass with one or two slips.
 */
export function isLabPassed(state: CustodyState, caseData: CustodyCase): boolean {
  if (!state.submittedAt) return false
  const { correct, total } = scoreCase(state, caseData)
  if (total === 0) return false
  return correct / total >= 0.8
}

/**
 * Total field count and how many are correct given the current state.
 * Shared by the pass check and the debrief renderer.
 */
export function scoreCase(
  state: CustodyState,
  caseData: CustodyCase,
): { correct: number; total: number } {
  let correct = 0
  let total = 0
  for (const event of caseData.events) {
    for (const field of event.fields) {
      total += 1
      const value = state.fieldValues[event.id]?.[field.id] ?? ''
      if (isFieldCorrect(field, value)) correct += 1
    }
  }
  return { correct, total }
}

/**
 * Per-lab state hook. Persists to a single localStorage key so closing
 * the tab and coming back later resumes the form mid-fill. `reset()`
 * clears the in-progress state but preserves any earned completion.
 * `resetAll()` clears state AND the completion flag and is wired to the
 * Start over action in the SPA header.
 */
export function useCustodyState() {
  const [state, setState] = useState<CustodyState>(loadInitial)

  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
    } catch {
      /* storage may be unavailable; ignore */
    }
  }, [state])

  const setFieldValue = useCallback(
    (eventId: string, fieldId: string, value: string) => {
      setState((prev) => {
        const eventValues = { ...(prev.fieldValues[eventId] ?? {}) }
        if (value === '') {
          delete eventValues[fieldId]
        } else {
          eventValues[fieldId] = value
        }
        const next = { ...prev.fieldValues }
        if (Object.keys(eventValues).length === 0) {
          delete next[eventId]
        } else {
          next[eventId] = eventValues
        }
        return { ...prev, fieldValues: next }
      })
    },
    [],
  )

  const setSignature = useCallback((value: string) => {
    setState((prev) => ({ ...prev, signature: value }))
  }, [])

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

  const resetAll = useCallback(() => {
    try {
      window.localStorage.removeItem(STORAGE_KEY)
      window.localStorage.removeItem(COMPLETED_KEY)
    } catch {
      /* ignore */
    }
    setState(EMPTY_STATE)
  }, [])

  return { state, setFieldValue, setSignature, submit, reset, resetAll }
}

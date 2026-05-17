import { Children, useEffect, useId, useMemo, useState, type ReactNode } from 'react'
import {
  CheckCircle2,
  ChevronDown,
  Lightbulb,
  ListChecks,
  RotateCcw,
  XCircle,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useLocalStorage } from '@/hooks/useLocalStorage'
import { emitLabProgress } from '@/hooks/useLabProgress'
import { useQuestionRegistry } from './WorkbookContext'
import { defineSlot, isSlot, slotMarker } from './slot'

type QuestionType = 'text' | 'choice' | 'checkboxes'

interface QuestionProps {
  /** Stable id, used for persistence and as the prefix for slots. */
  id?: string
  /** Short label like "Q1". Falls back to a numbered "Question" label. */
  label?: string
  /** Question kind. Defaults to "text" (free response). */
  type?: QuestionType
  /** Comma-separated list of accepted answers, or pass `answers` instead. */
  accept?: string
  /** Explicit list of accepted answers. */
  answers?: string[]
  /** If true, ignore case (default: true). */
  caseSensitive?: boolean
  children: ReactNode
}

interface QuestionSlots {
  hint: ReactNode | null
  solution: ReactNode | null
  prompt: ReactNode[]
  choices: { id: string; label: ReactNode; correct: boolean }[]
}

interface PersistedState {
  value: string
  selectedChoiceId: string | null
  selectedChoiceIds: string[]
  submitted: boolean
  locked: boolean
}

interface ChoiceProps {
  /** Stable id within the parent question. */
  id: string
  /** Mark this choice as a correct answer. Multiple may be marked. */
  correct?: boolean
  children: ReactNode
}

/**
 * Multiple choice option for `<Question type="choice">`. Mark the correct
 * answer(s) with `correct`.
 */
export const Choice = defineSlot<ChoiceProps>('Choice', ({ children }) => <>{children}</>)
const ChoiceTypeMarker = slotMarker(Choice)

/**
 * Question box for the workbook. Supports two modes:
 *  - `type="text"` (default): free-text answer matched against an
 *    `accept` list of acceptable spellings.
 *  - `type="choice"`: multiple-choice; mark correct options with the
 *    `correct` prop on `<Choice>` children.
 *
 * State (current value, submission, locked) is persisted to localStorage
 * keyed by `id`, so reloads do not wipe progress. Hint and Solution are
 * still slotted in via `<Hint>` / `<Solution>` children.
 */
export function Question({
  id,
  label,
  type = 'text',
  accept,
  answers,
  caseSensitive = false,
  children,
}: QuestionProps) {
  const accepted = useMemo(() => {
    const list = answers ?? (accept ? accept.split(',').map((s) => s.trim()) : [])
    return list.filter(Boolean)
  }, [accept, answers])

  const slots = useMemo(() => splitSlots(children), [children])

  const initial = useMemo<PersistedState>(
    () => ({
      value: '',
      selectedChoiceId: null,
      selectedChoiceIds: [],
      submitted: false,
      locked: false,
    }),
    [],
  )
  // Persist when the author gave the question a stable `id`, otherwise
  // keep state in memory only. The previous implementation pointed every
  // unkeyed question at one shared `__unsaved` key, so two unkeyed
  // questions on the same page collided on reload. A per-instance React
  // id avoids the collision but would leak a fresh localStorage entry on
  // every mount, so we drop persistence entirely instead and warn in
  // dev. The `useId` is only used to give the input a stable DOM id.
  const reactId = useId()
  const [state, setState] = useLocalStorage<PersistedState>(
    id ? `lab-question:${id}` : null,
    initial,
  )

  const { value, selectedChoiceId, selectedChoiceIds, submitted, locked } = state

  const checkText = (raw: string): boolean => {
    if (accepted.length === 0) return true
    const v = caseSensitive ? raw.trim() : raw.trim().toLowerCase()
    return accepted.some((a) => (caseSensitive ? a : a.toLowerCase()) === v)
  }

  const checkChoice = (choiceId: string | null): boolean => {
    if (!choiceId) return false
    const choice = slots.choices.find((c) => c.id === choiceId)
    return !!choice?.correct
  }

  const checkCheckboxes = (selected: string[]): boolean => {
    const correctIds = slots.choices.filter((c) => c.correct).map((c) => c.id).sort()
    if (correctIds.length === 0) return false
    const picked = [...selected].sort()
    if (picked.length !== correctIds.length) return false
    return picked.every((id, i) => id === correctIds[i])
  }

  const checkAnswer = (): boolean => {
    if (type === 'choice') return checkChoice(selectedChoiceId)
    if (type === 'checkboxes') return checkCheckboxes(selectedChoiceIds)
    return checkText(value)
  }

  const isCorrect = locked || (submitted && checkAnswer())

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (locked) return
    const correct = checkAnswer()
    setState((prev) => ({ ...prev, submitted: true, locked: correct ? true : prev.locked }))
    if (correct) emitLabProgress()
  }

  const handleReset = () => {
    setState(initial)
    if (locked) emitLabProgress()
  }

  const [showHint, setShowHint] = useState(false)
  const [showSolution, setShowSolution] = useState(false)

  // Register with the parent LabWorkbook so the page header can show
  // a live "n / total answered" indicator. Only meaningful if id is set.
  // One effect handles both initial registration and ongoing updates;
  // `set` is idempotent so re-running it on every change is cheap.
  const registry = useQuestionRegistry()
  useEffect(() => {
    if (!registry || !id) return
    registry.set(id, isCorrect)
    return () => registry.unregister(id)
  }, [registry, id, isCorrect])

  // If the persisted state changes (e.g. cleared from another tab), reset
  // the visible toggles to a sane state.
  useEffect(() => {
    if (!locked && !submitted) {
      setShowHint(false)
      setShowSolution(false)
    }
  }, [locked, submitted])

  return (
    <>
    <div
      id={id}
      className="not-prose my-6 rounded-xl border border-forensic-border bg-forensic-surface shadow-lab-sm"
    >
      <header className="flex items-center gap-2 rounded-t-xl border-b border-forensic-border bg-forensic-surfaceAlt px-4 py-2.5">
        <ListChecks className="h-4 w-4 text-forensic-primary" />
        <span className="text-[11px] font-semibold uppercase tracking-[0.16em] text-forensic-textMuted">
          {label ?? 'Question'}
        </span>
      </header>

      <div className="space-y-4 px-4 py-4">
        <div
          id={`${id ?? reactId}-prompt`}
          className="prose prose-sm max-w-none text-forensic-text"
        >
          {slots.prompt}
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          {type === 'text' && (
            <div className="flex flex-col gap-2 sm:flex-row">
              <label className="sr-only" htmlFor={`${id ?? reactId}-input`}>
                Your answer
              </label>
              <input
                id={`${id ?? reactId}-input`}
                aria-describedby={`${id ?? reactId}-prompt`}
                type="text"
                value={value}
                onChange={(e) => {
                  if (locked) return
                  setState((prev) => ({
                    ...prev,
                    value: e.target.value,
                    submitted: false,
                  }))
                }}
                readOnly={locked}
                placeholder="Type your answer..."
                className={cn(
                  'flex-1 rounded-md border px-3 py-2 text-sm shadow-lab-sm focus:outline-none focus:ring-2',
                  locked
                    ? 'cursor-not-allowed border-emerald-500/40 bg-emerald-500/10 text-emerald-900 dark:text-emerald-200'
                    : 'border-forensic-border bg-forensic-surface text-forensic-text focus:border-forensic-primary/60 focus:ring-forensic-primary/20',
                )}
              />
              <SubmitButton locked={locked} />
              <ResetButton onReset={handleReset} />
            </div>
          )}

          {(type === 'choice' || type === 'checkboxes') && (
            <>
              <ul
                role={type === 'choice' ? 'radiogroup' : 'group'}
                aria-labelledby={`${id ?? reactId}-prompt`}
                aria-describedby={
                  type === 'checkboxes' ? `${id ?? reactId}-help` : undefined
                }
                className="space-y-2"
              >
                {slots.choices.map((choice) => {
                  const isChoice = type === 'choice'
                  const checked = isChoice
                    ? selectedChoiceId === choice.id
                    : selectedChoiceIds.includes(choice.id)
                  return (
                    <li key={choice.id}>
                      <label
                        className={cn(
                          'flex cursor-pointer items-start gap-2.5 rounded-md border px-3 py-2 text-sm shadow-lab-sm transition-colors',
                          locked && checked
                            ? 'cursor-not-allowed border-emerald-500/40 bg-emerald-500/10 text-emerald-900 dark:text-emerald-200'
                            : checked
                              ? 'border-slate-500/50 bg-slate-500/10 text-forensic-text'
                              : 'border-forensic-border bg-forensic-surface text-forensic-text hover:border-forensic-borderBright',
                        )}
                      >
                        <input
                          type={isChoice ? 'radio' : 'checkbox'}
                          name={`${id ?? reactId}-choice`}
                          value={choice.id}
                          checked={checked}
                          disabled={locked}
                          onChange={() => {
                            if (locked) return
                            setState((prev) => {
                              if (isChoice) {
                                return {
                                  ...prev,
                                  selectedChoiceId: choice.id,
                                  submitted: false,
                                }
                              }
                              const next = prev.selectedChoiceIds.includes(choice.id)
                                ? prev.selectedChoiceIds.filter((c) => c !== choice.id)
                                : [...prev.selectedChoiceIds, choice.id]
                              return {
                                ...prev,
                                selectedChoiceIds: next,
                                submitted: false,
                              }
                            })
                          }}
                          className="mt-0.5 h-4 w-4 flex-none accent-slate-500"
                        />
                        <span className="min-w-0 flex-1 break-words leading-snug [overflow-wrap:anywhere]">{choice.label}</span>
                      </label>
                    </li>
                  )
                })}
              </ul>
              {type === 'checkboxes' && (
                <p id={`${id ?? reactId}-help`} className="text-[11px] text-forensic-textMuted">
                  Select all that apply.
                </p>
              )}
              <div className="flex flex-wrap gap-2">
                <SubmitButton locked={locked} />
                <ResetButton onReset={handleReset} />
              </div>
            </>
          )}

          {submitted && (
            <div
              className={cn(
                'flex items-start gap-2 rounded-md px-3 py-2 text-xs',
                isCorrect
                  ? 'bg-emerald-500/10 text-emerald-800 dark:text-emerald-200'
                  : 'bg-rose-500/10 text-rose-800 dark:text-rose-200',
              )}
              role="status"
            >
              {isCorrect ? (
                <CheckCircle2 className="h-4 w-4 flex-none" />
              ) : (
                <XCircle className="h-4 w-4 flex-none" />
              )}
              <span>
                {isCorrect
                  ? 'Correct. Nice work.'
                  : type === 'text'
                    ? 'Not quite. Try a different phrasing, or peek at the hint.'
                    : type === 'checkboxes'
                      ? 'Not quite. Make sure you have selected every correct option, and no incorrect ones.'
                      : 'Not quite. Try a different option, or peek at the hint.'}
              </span>
            </div>
          )}
        </form>

        <div className="flex flex-wrap gap-2">
          {slots.hint && (
            <CollapsibleButton
              open={showHint}
              onToggle={() => setShowHint((v) => !v)}
              icon={<Lightbulb className="h-3.5 w-3.5" />}
              label={showHint ? 'Hide hint' : 'Show hint'}
              tone="amber"
              controls={`${id ?? reactId}-hint`}
            />
          )}
          {slots.solution && (
            <CollapsibleButton
              open={showSolution}
              onToggle={() => setShowSolution((v) => !v)}
              icon={<CheckCircle2 className="h-3.5 w-3.5" />}
              label={showSolution ? 'Hide solution' : 'Show solution'}
              tone="emerald"
              controls={`${id ?? reactId}-solution`}
            />
          )}
        </div>

        {slots.hint && showHint && (
          <div
            id={`${id ?? reactId}-hint`}
            className="rounded-md border border-amber-500/30 bg-amber-500/10 px-3 py-2.5"
          >
            <div className="prose prose-sm max-w-none text-amber-900 dark:text-amber-200">{slots.hint}</div>
          </div>
        )}
      </div>
    </div>

    {slots.solution && showSolution && (
      <section
        id={`${id ?? reactId}-solution`}
        aria-label={`Solution for ${label ?? 'question'}`}
        className="-mt-3 mb-6 overflow-hidden rounded-xl border border-emerald-500/30 bg-forensic-surface shadow-lab-sm"
      >
        <header className="not-prose flex items-center gap-2 border-b border-emerald-500/30 bg-emerald-500/10 px-5 py-2.5">
          <CheckCircle2 className="h-4 w-4 text-emerald-700 dark:text-emerald-300" />
          <span className="text-[11px] font-semibold uppercase tracking-[0.16em] text-emerald-800 dark:text-emerald-200">
            Solution{label ? ` · ${label}` : ''}
          </span>
          <button
            type="button"
            onClick={() => setShowSolution(false)}
            className="ml-auto inline-flex items-center gap-1 rounded-md border border-emerald-500/30 bg-forensic-surface px-2 py-0.5 text-[10px] font-semibold text-emerald-800 transition-colors hover:bg-emerald-500/10 dark:text-emerald-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/30"
          >
            Hide solution
          </button>
        </header>
        <div className="prose prose-sm max-w-none px-5 py-4 [&>:first-child]:!mt-0 [&>:last-child]:!mb-0">
          {slots.solution}
        </div>
      </section>
    )}

    </>
  )
}

function SubmitButton({ locked }: { locked: boolean }) {
  return (
    <button
      type="submit"
      disabled={locked}
      className={cn(
        'inline-flex items-center justify-center rounded-md px-4 py-2 text-sm font-semibold shadow-lab-sm transition-colors focus-visible:outline-none focus-visible:ring-2',
        locked
          ? 'cursor-not-allowed bg-emerald-600 text-white'
          : 'bg-forensic-primary text-white hover:bg-forensic-primary/90 focus-visible:ring-forensic-primary/40',
      )}
    >
      {locked ? (
        <>
          <CheckCircle2 className="mr-1.5 h-4 w-4" />
          Correct!
        </>
      ) : (
        'Check'
      )}
    </button>
  )
}

function ResetButton({ onReset }: { onReset: () => void }) {
  return (
    <button
      type="button"
      onClick={onReset}
      className="inline-flex items-center justify-center gap-1.5 rounded-md border border-forensic-border bg-forensic-surface px-3 py-2 text-xs font-medium text-forensic-textMuted shadow-lab-sm transition-colors hover:border-forensic-borderBright hover:text-forensic-text focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-forensic-primary/30"
      title="Reset this question"
    >
      <RotateCcw className="h-3 w-3" />
      Reset
    </button>
  )
}

interface CollapsibleButtonProps {
  open: boolean
  onToggle: () => void
  icon: ReactNode
  label: string
  tone: 'amber' | 'emerald'
  controls: string
}

function CollapsibleButton({ open, onToggle, icon, label, tone, controls }: CollapsibleButtonProps) {
  const toneClasses =
    tone === 'amber'
      ? 'border-amber-500/30 bg-amber-500/10 text-amber-800 dark:text-amber-200 hover:bg-amber-500/15'
      : 'border-emerald-500/30 bg-emerald-500/10 text-emerald-800 dark:text-emerald-200 hover:bg-emerald-500/15'
  return (
    <button
      type="button"
      onClick={onToggle}
      aria-expanded={open}
      aria-controls={controls}
      className={cn(
        'inline-flex items-center gap-1.5 rounded-md border px-2.5 py-1 text-[11px] font-semibold transition-colors',
        toneClasses,
      )}
    >
      {icon}
      {label}
      <ChevronDown className={cn('h-3 w-3 transition-transform', open && 'rotate-180')} />
    </button>
  )
}

/**
 * `<Hint>` slot for use inside `<Question>`. Tagged with a static
 * marker so the parent can split children into prompt / hint / solution.
 */
export const Hint = defineSlot<{ children: ReactNode }>('Hint', ({ children }) => <>{children}</>)
const HintTypeMarker = slotMarker(Hint)

export const Solution = defineSlot<{ children: ReactNode }>('Solution', ({ children }) => <>{children}</>)
const SolutionTypeMarker = slotMarker(Solution)

function splitSlots(children: ReactNode): QuestionSlots {
  const prompt: ReactNode[] = []
  const choices: QuestionSlots['choices'] = []
  let hint: ReactNode | null = null
  let solution: ReactNode | null = null

  Children.forEach(children, (child) => {
    if (isSlot(child, HintTypeMarker)) {
      hint = (child.props as { children?: ReactNode }).children ?? null
      return
    }
    if (isSlot(child, SolutionTypeMarker)) {
      solution = (child.props as { children?: ReactNode }).children ?? null
      return
    }
    if (isSlot(child, ChoiceTypeMarker)) {
      const props = child.props as ChoiceProps
      choices.push({
        id: props.id,
        label: props.children,
        correct: !!props.correct,
      })
      return
    }
    prompt.push(child)
  })

  return { prompt, hint, solution, choices }
}

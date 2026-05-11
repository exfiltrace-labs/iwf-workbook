import type { LabModule } from '@/labs/types'

/**
 * Course modules in the order they appear in the navigation. The single
 * source of truth for module ids and labels. Referenced by lab frontmatter
 * via `moduleId`. Mirrors the curriculum in `lessons/curriculum.md` so
 * lab cards group under the same module headings the student saw in the
 * video lessons.
 */
export const MODULES: LabModule[] = [
  { id: 'module-1', label: 'Module 1 · Course Introduction', order: 1 },
  { id: 'module-2', label: 'Module 2 · The Investigative Mindset', order: 2 },
  { id: 'module-3', label: 'Module 3 · The Digital Forensic Process', order: 3 },
  { id: 'module-4', label: 'Module 4 · Foundational Principles', order: 4 },
  { id: 'module-5', label: 'Module 5 · Understanding How Data Is Stored', order: 5 },
  { id: 'module-6', label: 'Module 6 · Sources of Digital Evidence', order: 6 },
  { id: 'module-7', label: 'Module 7 · The Windows Operating System', order: 7 },
  { id: 'module-8', label: 'Module 8 · DFIR Software and Hardware', order: 8 },
  { id: 'module-9', label: 'Module 9 · Evidence Acquisition', order: 9 },
]

export const MODULES_BY_ID: Record<string, LabModule> = Object.fromEntries(
  MODULES.map((m) => [m.id, m]),
)

import type { ComponentType, LazyExoticComponent } from 'react'
import type { Reference } from '@/components/workbook/WorkbookContext'
import type { LabDifficulty } from '@/components/workbook/LabWorkbook'

/**
 * A course module, e.g. "Module 2 · The Investigative Mindset". Modules are
 * defined explicitly (in `@/content/modules`) so their order and labels stay
 * stable; labs themselves are auto-discovered from MDX frontmatter.
 */
export interface LabModule {
  id: string
  label: string
  order: number
}

/**
 * Frontmatter shape for a lab MDX file. Every lab folder must export this
 * via YAML frontmatter at the top of its `index.mdx`.
 */
export interface LabFrontmatter {
  /** Stable id, e.g. "lab-2-1". Must match the folder name. */
  id: string
  /** Module id this lab belongs to (must match a `LabModule.id`). */
  moduleId: string
  /** Short label, e.g. "Lab 2.1". */
  labNumber: string
  /** Lab title, e.g. "Your First Investigation". */
  title: string
  /** Sort order within the parent module. Lower comes first. Defaults to id. */
  order?: number
  /** Optional reading time displayed in the workbook header. */
  readTime?: string
  /** Optional difficulty chip displayed in the workbook header. */
  difficulty?: LabDifficulty
  /** Optional eyebrow override for the workbook header. */
  eyebrow?: string
  /** Optional one-line description for the workbook header. */
  description?: string
  /** Optional list of references to render in the workbook footer. */
  references?: Reference[]
  /**
   * Marks the lab as having a hands-on interactive workspace in addition
   * to (or instead of) its writeup. Used by the home-grid card to render a
   * different icon so students can tell at a glance which labs are SPA
   * style. Each interactive lab is otherwise self-contained: it owns its
   * own route, its own state, and its own UI under `src/labs/<id>/`.
   */
  isInteractive?: boolean
}

/**
 * A fully-resolved lab entry from the registry. Combines frontmatter with
 * the compiled MDX component.
 */
export interface LabEntry extends LabFrontmatter {
  /**
   * Lazy-loaded compiled MDX. Each lab is its own Rollup chunk; the chunk
   * is fetched the first time React renders this component inside a
   * `<Suspense>` boundary, so labs the student never opens never download.
   */
  Component: LazyExoticComponent<
    ComponentType<{ components?: Record<string, ComponentType<any>> }>
  >
  /**
   * Stable ids of every `<Question id="...">` declared in the lab MDX.
   * Extracted at build time by the lab manifest plugin so progress badges
   * can count answered questions without mounting the lab.
   */
  questionIds: string[]
}

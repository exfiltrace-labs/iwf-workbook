import { lazy, type ComponentType } from 'react'
import { MODULES, MODULES_BY_ID } from '@/content/modules'
import { LAB_MANIFEST } from 'virtual:lab-manifest'
import type { LabEntry, LabModule } from './types'

/* -------------------------------------------------------------------------- */
/*  Auto-discover labs                                                        */
/* -------------------------------------------------------------------------- */
/* The build-time `virtual:lab-manifest` plugin gives us every lab's
 * frontmatter and question ids without ever pulling lab content into the
 * main bundle. We then attach a lazy loader for the compiled MDX, so each
 * lab becomes its own Rollup chunk fetched only on navigation. */

interface RawMdxModule {
  default: ComponentType<{ components?: Record<string, ComponentType<any>> }>
}

/** Lazy glob: each entry is `() => Promise<Module>`, one chunk per lab. */
const lazyMdx = import.meta.glob<RawMdxModule>('../content/labs/*/index.mdx')

/** Match a lazy-glob key to a specific lab id. */
function findMdxLoader(labId: string): (() => Promise<RawMdxModule>) | undefined {
  const suffix = `/labs/${labId}/index.mdx`
  for (const key of Object.keys(lazyMdx)) {
    if (key.endsWith(suffix)) return lazyMdx[key]
  }
  return undefined
}

const rawLabs: LabEntry[] = []
for (const entry of LAB_MANIFEST) {
  // The manifest plugin types these as required, but be defensive in case
  // a malformed MDX frontmatter slips through at build time.
  if (!entry.id || !entry.moduleId || !entry.labNumber || !entry.title) {
    throw new Error(
      `[lab registry] Manifest entry missing required frontmatter (id, moduleId, labNumber, title): ${JSON.stringify(entry)}`,
    )
  }
  if (!MODULES_BY_ID[entry.moduleId]) {
    const valid = Object.keys(MODULES_BY_ID).join(', ')
    throw new Error(
      `[lab registry] Lab "${entry.id}" references unknown moduleId "${entry.moduleId}". Valid module ids: ${valid}`,
    )
  }

  const mdxLoader = findMdxLoader(entry.id)
  if (!mdxLoader) {
    throw new Error(
      `[lab registry] No MDX file found for lab "${entry.id}".`,
    )
  }

  rawLabs.push({
    ...entry,
    Component: lazy(mdxLoader),
  })
}

/* -------------------------------------------------------------------------- */
/*  Question id uniqueness guard                                              */
/* -------------------------------------------------------------------------- */
/* Question ids are persisted to localStorage as `lab-question:<id>`, so two
 * labs that declare the same id would silently share state. Catch that at
 * dev-server startup with a loud error listing the offending labs. The
 * scaffold writes ids prefixed with the lab id (`lab-2-1-q1`) to make this
 * collision practically impossible if you stick to the convention. */
{
  const seen = new Map<string, string>() // questionId -> labId that owns it
  const collisions: { id: string; labs: string[] }[] = []
  for (const lab of rawLabs) {
    for (const qid of lab.questionIds) {
      const owner = seen.get(qid)
      if (owner && owner !== lab.id) {
        collisions.push({ id: qid, labs: [owner, lab.id] })
      } else {
        seen.set(qid, lab.id)
      }
    }
  }
  if (collisions.length > 0) {
    const detail = collisions
      .map((c) => `  - "${c.id}" appears in: ${c.labs.join(', ')}`)
      .join('\n')
    throw new Error(
      `[lab registry] Duplicate <Question> ids detected. Question ids must be unique across the whole course (they share a localStorage namespace). Prefix each id with its lab id (e.g. "lab-2-1-q1") to avoid collisions.\n${detail}`,
    )
  }
}

/** All labs, sorted by module order then by per-lab order then by id. */
export const LABS: LabEntry[] = rawLabs.sort((a, b) => {
  const aMod = MODULES_BY_ID[a.moduleId]?.order ?? 999
  const bMod = MODULES_BY_ID[b.moduleId]?.order ?? 999
  if (aMod !== bMod) return aMod - bMod
  const aOrder = a.order ?? 999
  const bOrder = b.order ?? 999
  if (aOrder !== bOrder) return aOrder - bOrder
  return a.id.localeCompare(b.id)
})

const labsById = new Map(LABS.map((l) => [l.id, l]))

export function getLab(id: string | undefined): LabEntry | undefined {
  if (!id) return undefined
  return labsById.get(id)
}

export interface LabGroup {
  module: LabModule
  labs: LabEntry[]
}

/** Labs grouped by module, in module order. Modules with no labs are omitted. */
export const LAB_GROUPS: LabGroup[] = MODULES.map((module) => ({
  module,
  labs: LABS.filter((l) => l.moduleId === module.id),
})).filter((g) => g.labs.length > 0)

export { MODULES, MODULES_BY_ID } from '@/content/modules'

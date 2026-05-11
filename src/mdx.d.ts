/// <reference types="vite/client" />

/**
 * Short git commit hash injected at build time by `vite.config.ts` via
 * `define`. Displayed in the workbook footer so students who run the app
 * locally can tell when their clone is behind upstream.
 */
declare const __COMMIT_HASH__: string

declare module '*.mdx' {
  import type { ComponentType } from 'react'
  const MDXComponent: ComponentType<{ components?: Record<string, ComponentType<any>> }>
  export default MDXComponent
  /**
   * YAML frontmatter exposed by `remark-mdx-frontmatter` (configured with
   * `name: 'frontmatter'`). Each MDX page in `src/content/labs/` exports
   * one of these so the lab registry can pick it up automatically.
   */
  export const frontmatter: Record<string, unknown>
}

/**
 * Build-time generated index of every lab in `src/content/labs/`. Produced
 * by the `labManifestPlugin` in `vite.config.ts`. The runtime registry
 * imports this and combines it with lazy-loaded MDX/case modules so that
 * the home page and lab dropdown can render without pulling any actual
 * lab content into the main bundle.
 */
declare module 'virtual:lab-manifest' {
  export interface LabManifestEntry {
    id: string
    moduleId: string
    labNumber: string
    title: string
    order?: number
    readTime?: string
    difficulty?: 'beginner' | 'intermediate' | 'advanced'
    eyebrow?: string
    description?: string
    references?: Array<{
      id: string
      label: string
      url?: string
      detail?: string
    }>
    /**
     * Marks the lab as having a hands-on interactive workspace in addition
     * to (or instead of) its writeup. Surfaced through the lab registry so
     * the home-grid card can render a different icon.
     */
    isInteractive?: boolean
    /** Stable ids of every `<Question>` declared in the lab MDX. */
    questionIds: string[]
  }
  export const LAB_MANIFEST: LabManifestEntry[]
}

/**
 * Build-time generated full-text search index over every lab MDX. One
 * entry per `## ` / `### ` section, with the body text stripped of MDX
 * tags and code fences. Produced by `labSearchIndexPlugin` in
 * `vite.config.ts`.
 */
declare module 'virtual:lab-search-index' {
  export interface LabSearchDoc {
    labId: string
    labNumber: string
    labTitle: string
    sectionTitle: string
    sectionAnchor: string
    text: string
  }
  export const LAB_SEARCH_INDEX: LabSearchDoc[]
}

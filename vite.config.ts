import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import mdx from '@mdx-js/rollup'
import remarkGfm from 'remark-gfm'
import remarkFrontmatter from 'remark-frontmatter'
import remarkMdxFrontmatter from 'remark-mdx-frontmatter'
import rehypeHighlight from 'rehype-highlight'
import langPowerShell from 'highlight.js/lib/languages/powershell'
import langDos from 'highlight.js/lib/languages/dos'
import path from 'node:path'
import fs from 'node:fs'
import { execSync } from 'node:child_process'
import { parse as parseYaml } from 'yaml'
import { COURSE } from './src/content/course'

/**
 * Resolve the current git commit short hash at build time. Falls back to
 * "unreleased" when the project is not yet a git repo (e.g. before the
 * student clone), so the footer always renders something sensible.
 */
function resolveCommitHash(): string {
  try {
    return execSync('git rev-parse --short HEAD', {
      stdio: ['ignore', 'pipe', 'ignore'],
    })
      .toString()
      .trim()
  } catch {
    return 'unreleased'
  }
}

const COMMIT_HASH = resolveCommitHash()

/**
 * Vite plugin: exposes a `virtual:lab-manifest` module that contains a
 * tiny JSON-shaped index of every lab in `src/content/labs/`. The plugin
 * walks the lab folders at startup, parses the YAML frontmatter at the
 * top of each `index.mdx`, and scrapes `<Question id="...">` declarations
 * with a regex.
 *
 * Why this exists: with code-splitting, each lab's compiled MDX is its
 * own lazy-loaded chunk, so we cannot read frontmatter by importing the
 * module without dragging the whole lab into the main bundle. This
 * plugin generates the metadata at build time so the home page and the
 * dropdown render instantly while the heavy content stays per-lab.
 */
function labManifestPlugin() {
  const VIRTUAL_ID = 'virtual:lab-manifest'
  const RESOLVED_ID = '\0' + VIRTUAL_ID
  const LABS_DIR = path.resolve(__dirname, 'src/content/labs')

  type ManifestEntry = Record<string, unknown> & {
    questionIds: string[]
  }

  function extractFrontmatter(source: string): Record<string, unknown> {
    // Frontmatter is the YAML block between the first two `---` fences.
    // Anything else is treated as having no frontmatter (which the
    // registry will then warn about).
    const match = /^---\r?\n([\s\S]*?)\r?\n---/.exec(source)
    if (!match) return {}
    try {
      const parsed = parseYaml(match[1])
      return (parsed && typeof parsed === 'object' ? parsed : {}) as Record<
        string,
        unknown
      >
    } catch (err) {
      console.warn(`[lab-manifest] Failed to parse frontmatter: ${(err as Error).message}`)
      return {}
    }
  }

  function extractQuestionIds(source: string): string[] {
    const ids: string[] = []
    const seen = new Set<string>()
    const re = /<Question\b[^>]*?\bid\s*=\s*(?:"([^"]+)"|'([^']+)'|\{\s*['"]([^'"]+)['"]\s*\})/g
    let m: RegExpExecArray | null
    while ((m = re.exec(source))) {
      const id = m[1] ?? m[2] ?? m[3]
      if (id && !seen.has(id)) {
        seen.add(id)
        ids.push(id)
      }
    }
    return ids
  }

  function buildManifest(): ManifestEntry[] {
    if (!fs.existsSync(LABS_DIR)) return []
    const entries: ManifestEntry[] = []
    for (const folder of fs.readdirSync(LABS_DIR)) {
      const labDir = path.join(LABS_DIR, folder)
      if (!fs.statSync(labDir).isDirectory()) continue
      const mdxPath = path.join(labDir, 'index.mdx')
      if (!fs.existsSync(mdxPath)) continue
      const source = fs.readFileSync(mdxPath, 'utf8')
      const frontmatter = extractFrontmatter(source)
      const questionIds = extractQuestionIds(source)
      entries.push({ ...frontmatter, questionIds })
    }
    return entries
  }

  return {
    name: 'lab-manifest',
    resolveId(id: string) {
      if (id === VIRTUAL_ID) return RESOLVED_ID
      return null
    },
    load(id: string) {
      if (id !== RESOLVED_ID) return null
      const manifest = buildManifest()
      // Emit as a real ES module so Vite can tree-shake / cache it.
      return `export const LAB_MANIFEST = ${JSON.stringify(manifest)};\n`
    },
    handleHotUpdate(ctx: { file: string; server: any }) {
      // Any change under src/content/labs/ invalidates the manifest.
      // Easiest reliable behavior: invalidate the virtual module and
      // ask the dev server for a full reload so the registry rebuilds.
      const normalized = ctx.file.replace(/\\/g, '/')
      if (!normalized.includes('/src/content/labs/')) return
      const mod = ctx.server.moduleGraph.getModuleById(RESOLVED_ID)
      if (mod) ctx.server.moduleGraph.invalidateModule(mod)
      ctx.server.ws.send({ type: 'full-reload' })
    },
  }
}

/**
 * Tiny remark plugin: parse fenced code-block meta strings like
 *   ```powershell title="collect.ps1"
 * and forward `title` onto the rendered <code> element as `data-title`.
 * Our CodeBlock component reads `data-title` to render a filename label.
 *
 * Inline so we don't pull in another dependency.
 */
function remarkCodeMeta() {
  type Node = { type: string; meta?: string; data?: any; children?: Node[] }
  const walk = (node: Node) => {
    if (node.type === 'code' && typeof node.meta === 'string') {
      const titleMatch = /title="([^"]+)"/.exec(node.meta)
      if (titleMatch) {
        node.data = node.data || {}
        node.data.hProperties = node.data.hProperties || {}
        node.data.hProperties['data-title'] = titleMatch[1]
      }
    }
    if (node.children) for (const child of node.children) walk(child)
  }
  return (tree: Node) => walk(tree)
}

/**
 * Vite plugin: exposes a `virtual:lab-search-index` module containing one
 * search "document" per `## ` / `### ` section across every lab MDX. Each
 * doc carries the lab id and number, the heading text, the slugified anchor,
 * and a body string with MDX tags and code fences stripped. The home-page /
 * nav search does in-memory token matching against this index, so no
 * runtime crawl of the labs is needed.
 */
function labSearchIndexPlugin() {
  const VIRTUAL_ID = 'virtual:lab-search-index'
  const RESOLVED_ID = '\0' + VIRTUAL_ID
  const LABS_DIR = path.resolve(__dirname, 'src/content/labs')

  type Doc = {
    labId: string
    labNumber: string
    labTitle: string
    sectionTitle: string
    sectionAnchor: string
    text: string
  }

  // Mirror the slugify in src/components/workbook/WorkbookToc.tsx so the
  // anchors we generate here line up with the heading ids the runtime TOC
  // assigns. If the two ever drift, deep links from search will land at the
  // top of the lab page instead of the matched section.
  function slugify(input: string): string {
    return input
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_-]+/g, '-')
      .replace(/^-+|-+$/g, '')
  }

  function stripMdx(source: string): string {
    return (
      source
        // normalize CRLF / CR to LF so the line-anchored regexes below
        // work on Windows-authored files. Without this, `[ \t]*$` won't
        // tolerate the trailing `\r` and table-stripping silently fails.
        .replace(/\r\n?/g, '\n')
        // remove fenced code blocks
        .replace(/```[\s\S]*?```/g, ' ')
        // remove inline code
        .replace(/`[^`]*`/g, ' ')
        // remove JSX/MDX tags (non-greedy, single line)
        .replace(/<\/?[A-Za-z][^>]*>/g, ' ')
        // markdown links: keep label, drop url
        .replace(/\[([^\]]+)\]\([^)]*\)/g, '$1')
        // markdown table separator rows: lines made of |, -, :, spaces
        .replace(/^[ \t]*\|?[ \t]*:?-{2,}[-: |\t]*\|?[ \t]*$/gm, ' ')
        // any remaining pipe-bordered table row: drop the leading/trailing
        // pipes and split inner cells with spaces so the snippet reads as
        // plain prose instead of "|cell|cell|".
        .replace(/^[ \t]*\|(.+)\|[ \t]*$/gm, (_m, inner) =>
          ' ' + String(inner).split('|').join(' ') + ' ',
        )
        // catch any leftover pipes
        .replace(/\|/g, ' ')
        // markdown headings, blockquotes, list markers at line starts
        .replace(/^[ \t]*[#>][ \t]*/gm, ' ')
        .replace(/^[ \t]*[-*+][ \t]+/gm, ' ')
        // emphasis markers
        .replace(/[*_~]/g, ' ')
        // collapse whitespace
        .replace(/\s+/g, ' ')
        .trim()
    )
  }

  function buildIndex(): Doc[] {
    if (!fs.existsSync(LABS_DIR)) return []
    const docs: Doc[] = []
    for (const folder of fs.readdirSync(LABS_DIR)) {
      const labDir = path.join(LABS_DIR, folder)
      if (!fs.statSync(labDir).isDirectory()) continue
      const mdxPath = path.join(labDir, 'index.mdx')
      if (!fs.existsSync(mdxPath)) continue
      const raw = fs.readFileSync(mdxPath, 'utf8')
      const fmMatch = /^---\r?\n([\s\S]*?)\r?\n---\r?\n?/.exec(raw)
      if (!fmMatch) continue
      let parsed: any
      try {
        parsed = parseYaml(fmMatch[1])
      } catch {
        continue
      }
      const labId: string = parsed?.id ?? folder
      const labNumber: string = parsed?.labNumber ?? labId
      const labTitle: string = parsed?.title ?? labId
      const body = raw.slice(fmMatch[0].length)
      // Split on `## ` and `### ` headings (lvl 2/3) at line starts.
      const sections = body.split(/^(?=##{1,2} )/m)
      // Synthesize an "Overview" doc for any prose before the first heading.
      let isFirst = true
      for (const section of sections) {
        const headingMatch = /^(##{1,2})\s+(.+?)\s*$/m.exec(section)
        let sectionTitle: string
        let rest: string
        if (headingMatch) {
          sectionTitle = headingMatch[2].replace(/[`*_]/g, '')
          rest = section.slice(headingMatch[0].length)
        } else if (isFirst) {
          sectionTitle = 'Overview'
          rest = section
        } else {
          continue
        }
        isFirst = false
        const text = stripMdx(rest)
        if (text.length === 0 && sectionTitle === 'Overview') continue
        docs.push({
          labId,
          labNumber,
          labTitle,
          sectionTitle,
          sectionAnchor: slugify(sectionTitle),
          text,
        })
      }
    }
    return docs
  }

  return {
    name: 'lab-search-index',
    resolveId(id: string) {
      if (id === VIRTUAL_ID) return RESOLVED_ID
      return null
    },
    load(id: string) {
      if (id !== RESOLVED_ID) return null
      return `export const LAB_SEARCH_INDEX = ${JSON.stringify(buildIndex())};\n`
    },
    handleHotUpdate(ctx: { file: string; server: any }) {
      const normalized = ctx.file.replace(/\\/g, '/')
      if (!normalized.includes('/src/content/labs/')) return
      const mod = ctx.server.moduleGraph.getModuleById(RESOLVED_ID)
      if (mod) ctx.server.moduleGraph.invalidateModule(mod)
      ctx.server.ws.send({ type: 'full-reload' })
    },
  }
}

export default defineConfig({
  plugins: [
    labManifestPlugin(),
    labSearchIndexPlugin(),
    {
      enforce: 'pre',
      ...mdx({
        providerImportSource: '@mdx-js/react',
        remarkPlugins: [
          remarkGfm,
          remarkCodeMeta,
          remarkFrontmatter,
          [remarkMdxFrontmatter, { name: 'frontmatter' }],
        ],
        rehypePlugins: [
          [
            rehypeHighlight,
            {
              detect: true,
              ignoreMissing: true,
              languages: { powershell: langPowerShell, dos: langDos },
            },
          ],
        ],
      }),
    },
    react({ include: /\.(jsx|tsx|mdx)$/ }),
    {
      // Inject the course name into the static index.html <title> at build
      // and dev time so the initial document title matches the course
      // before React hydrates and `LabWorkbook` takes over per-page.
      name: 'inject-course-title',
      transformIndexHtml(html) {
        return html.replace(
          /<title>[^<]*<\/title>/,
          `<title>${COURSE.publisher}: ${COURSE.name}</title>`,
        )
      },
    },
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  define: {
    __COMMIT_HASH__: JSON.stringify(COMMIT_HASH),
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (!id.includes('node_modules')) return
          if (id.includes('react-dom') || id.includes('/react/') || id.includes('scheduler')) return 'vendor-react'
          if (id.includes('react-router')) return 'vendor-router'
          if (id.includes('@radix-ui')) return 'vendor-radix'
          if (id.includes('highlight.js')) return 'vendor-highlight'
          if (id.includes('@mdx-js')) return 'vendor-mdx'
        },
      },
    },
  },
})

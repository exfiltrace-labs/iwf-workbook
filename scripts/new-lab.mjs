#!/usr/bin/env node
/**
 * Scaffold a new lab folder under src/content/labs/.
 *
 * Usage:
 *   npm run new-lab -- --module 3 --number 1 --title "Memory Triage"
 *   npm run new-lab -- -m 3 -n 1 -t "Memory Triage" --difficulty beginner
 *
 * Required flags: --module, --number, --title.
 * Optional flags:
 *   --difficulty <level>   beginner | intermediate | advanced.
 *   --read-time "<text>"   Reading time string (e.g. "20 min lab").
 *   --force                Overwrite existing files.
 */

import { mkdir, writeFile, access } from 'node:fs/promises'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const HERE = dirname(fileURLToPath(import.meta.url))
const ROOT = resolve(HERE, '..')
const LABS_DIR = join(ROOT, 'src', 'content', 'labs')

function parseArgs(argv) {
  const args = {}
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i]
    const next = () => argv[++i]
    switch (a) {
      case '--module':
      case '-m':
        args.module = next()
        break
      case '--number':
      case '-n':
        args.number = next()
        break
      case '--title':
      case '-t':
        args.title = next()
        break
      case '--difficulty':
        args.difficulty = next()
        break
      case '--read-time':
        args.readTime = next()
        break
      case '--force':
        args.force = true
        break
      case '--help':
      case '-h':
        args.help = true
        break
      default:
        console.error(`Unknown flag: ${a}`)
        process.exit(2)
    }
  }
  return args
}

function printHelp() {
  console.log(`Scaffold a new lab.

Usage:
  npm run new-lab -- --module <num> --number <num> --title "<title>" [options]

Required:
  -m, --module <num>     Module number (matches modules.ts ids module-<num>).
  -n, --number <num>     Lab number within the module.
  -t, --title "<text>"   Lab title.

Options:
      --difficulty <l>   beginner | intermediate | advanced.
      --read-time <s>    Reading time, e.g. "15 min lab".
      --force            Overwrite existing files.
  -h, --help             Show this message.
`)
}

async function exists(p) {
  try {
    await access(p)
    return true
  } catch {
    return false
  }
}

const args = parseArgs(process.argv.slice(2))
if (args.help) {
  printHelp()
  process.exit(0)
}

if (!args.module || !args.number || !args.title) {
  console.error('Missing required flag. Run with --help for usage.')
  process.exit(2)
}

const moduleNum = String(args.module).trim()
const labNum = String(args.number).trim()
if (!/^\d+$/.test(moduleNum) || !/^\d+$/.test(labNum)) {
  console.error('--module and --number must be integers.')
  process.exit(2)
}

const labId = `lab-${moduleNum}-${labNum}`
const moduleId = `module-${moduleNum}`
const labNumber = `Lab ${moduleNum}.${labNum}`
const folder = join(LABS_DIR, labId)
const indexPath = join(folder, 'index.mdx')

if (await exists(indexPath)) {
  if (!args.force) {
    console.error(`Lab already exists: ${indexPath}\nPass --force to overwrite.`)
    process.exit(1)
  }
}

const frontmatterLines = [
  '---',
  `id: ${labId}`,
  `moduleId: ${moduleId}`,
  `labNumber: ${labNumber}`,
  `title: ${JSON.stringify(args.title)}`,
  `order: ${labNum}`,
]
if (args.difficulty) {
  frontmatterLines.push(`difficulty: ${args.difficulty}`)
}
if (args.readTime) {
  frontmatterLines.push(`readTime: ${JSON.stringify(args.readTime)}`)
}
frontmatterLines.push('---')

const indexBody = `${frontmatterLines.join('\n')}

# Overview

A short paragraph that frames what this lab is about and what the student
will walk away knowing. Keep it tight: students decide whether to invest
time based on these first few sentences.

## Objectives

- Replace these bullets with the concrete skills the lab teaches.
- Each bullet should be observable, not vague.

## Setup

Describe what the student needs running before they begin: VM snapshot,
sample data, tools to install. Link to any external downloads.

## Walkthrough

Walk the student through the exercise. Use \`<Question id="${labId}-q1">\`
components to gate progress on real understanding. Question ids are
shared across the whole course in localStorage, so always prefix them
with the lab id (the registry will throw at startup if two labs collide).
Use code fences with \`title="filename"\` for runnable snippets.

## Debrief

Wrap up with the takeaway and a pointer to the next lab.
`

await mkdir(folder, { recursive: true })
await writeFile(indexPath, indexBody, 'utf8')
console.log(`Created ${indexPath}`)

console.log(`\nDone. Visit /labs/${labId} after restarting \`npm run dev\`.`)

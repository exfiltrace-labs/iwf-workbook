#!/usr/bin/env node
/*
 * Runs automatically before `npm run dev` (via the `predev` script).
 *
 * Fetches the upstream branch and tells the student how many commits
 * their local checkout is behind, so they know when to `git pull` for
 * the latest labs and fixes. Fails silently on any error (offline,
 * not a git checkout, no upstream configured, git not on PATH) so the
 * dev server still starts in every environment.
 */
import { spawnSync } from 'node:child_process'

const BRANCH = 'main'
const REMOTE = 'origin'

const RESET = '\x1b[0m'
const DIM = '\x1b[2m'
const BOLD = '\x1b[1m'
const YELLOW = '\x1b[33m'
const GREEN = '\x1b[32m'

function git(args, { timeout = 8000 } = {}) {
  const result = spawnSync('git', args, {
    encoding: 'utf8',
    timeout,
    stdio: ['ignore', 'pipe', 'pipe'],
  })
  if (result.status !== 0) return null
  return result.stdout.trim()
}

// Bail quietly if we are not in a git checkout.
if (git(['rev-parse', '--is-inside-work-tree']) !== 'true') process.exit(0)

// Fetch in the background-ish: we still wait, but with a short timeout
// so a flaky network never blocks the dev server for long.
const fetched = spawnSync('git', ['fetch', REMOTE, BRANCH, '--quiet'], {
  timeout: 8000,
  stdio: 'ignore',
})
if (fetched.status !== 0) process.exit(0)

const behind = git(['rev-list', '--count', `HEAD..${REMOTE}/${BRANCH}`])
if (behind == null) process.exit(0)

const n = Number(behind)
if (Number.isNaN(n)) process.exit(0)

if (n === 0) {
  console.log(`${DIM}[workbook]${RESET} ${GREEN}Up to date with ${REMOTE}/${BRANCH}.${RESET}`)
} else {
  const word = n === 1 ? 'commit' : 'commits'
  console.log(
    `${DIM}[workbook]${RESET} ${YELLOW}${BOLD}You are ${n} ${word} behind ${REMOTE}/${BRANCH}.${RESET} Run ${BOLD}git pull${RESET} to get the latest labs and fixes.`,
  )
}

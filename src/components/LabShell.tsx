import type { ReactNode } from 'react'
import { LabNav } from './LabNav'

interface LabShellProps {
  /** Course name shown as the small label above the lab title and in the footer. */
  courseName?: string
  children: ReactNode
}

/**
 * Top-level chrome that wraps every screen of a lab.
 *
 * Composes a shared dark nav (LabNav) and footer (LabFooter) around the
 * lab's main content. Designed to wrap every lab in the course, both
 * interactive web app labs and static workbook style ones.
 *
 * Layout: a fixed-height nav and footer with a flex-1 main region in
 * between. Children are rendered inside main and should size themselves
 * with `h-full` (for full viewport screens like the investigation
 * workspace) or normal block flow (for scroll-the-page screens like
 * briefings).
 */
export function LabShell({ courseName, children }: LabShellProps) {
  return (
    <div className="flex h-screen w-full flex-col bg-forensic-bg text-forensic-text antialiased">
      <LabNav courseName={courseName} />
      <main className="flex min-h-0 flex-1 flex-col overflow-hidden">{children}</main>
    </div>
  )
}

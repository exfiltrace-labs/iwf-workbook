/**
 * Single source of truth for course-level metadata. The workbook app is
 * designed to be reused across multiple TCM courses, so anything that
 * names the course (page title, footer, mailto subjects, nav chrome)
 * reads from here. Swapping in a new course is a one-file change.
 *
 * Imported by `vite.config.ts` at build time, so keep this file free of
 * runtime-only code (no React, no DOM, no `@/` aliases).
 */
export const COURSE = {
  /** Full display name. Used in titles, headers, and the footer. */
  name: 'Introduction to Windows Forensics',
  /** Publishing organization name. */
  publisher: 'TCM Security Academy',
  /** Publisher home page. */
  publisherUrl: 'https://tcm-sec.com/',
  /** Support inbox for "Report an issue" and similar links. */
  supportEmail: 'support@tcm-sec.com',
} as const

import { LabWorkbook } from '@/components/workbook/LabWorkbook'
import { PageTransition } from '@/components/PageTransition'
import HomeContent from '@/content/home/index.mdx'
import { COURSE } from '@/content/course'

/**
 * Course landing page. Renders inside the same `LabWorkbook` chrome as
 * every lab page (sticky TOC, prose column, reading progress bar, glossary
 * tooltips) so the home page feels like just another workbook entry. The
 * lab grid lives inside `home.mdx` via the `<LabGrid />` MDX component, so
 * the auto-generated TOC picks up the "Labs" heading like any other.
 */
export function HomePage() {
  return (
    <PageTransition>
      <LabWorkbook
        content={HomeContent}
        eyebrow={COURSE.name}
        title="Lab Workbook"
        description={`The official electronic lab workbook for ${COURSE.publisher}'s ${COURSE.name} course.`}
      />
    </PageTransition>
  )
}

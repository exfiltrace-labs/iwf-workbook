/**
 * Single source of truth for the workbook prose className. Used by both
 * the main article in `LabWorkbook` and the Solution panel in `Question`
 * so that text rendered inside an expanded solution looks identical to
 * text rendered in the main reading flow.
 */
export const WORKBOOK_PROSE_CLASS = `prose prose-stone dark:prose-invert max-w-none
  prose-headings:scroll-mt-24 prose-headings:font-semibold
  prose-h2:text-xl prose-h2:mt-10 prose-h2:mb-4
    prose-h2:border-b prose-h2:border-forensic-border prose-h2:pb-2
  prose-h3:text-base prose-h3:mt-7 prose-h3:mb-2
  prose-h4:text-[15px] prose-h4:mt-5 prose-h4:mb-2
  prose-p:text-[17px] prose-p:leading-relaxed prose-p:text-forensic-text/90
  prose-li:text-[17px] prose-li:text-forensic-text/90
  prose-strong:text-forensic-text
  prose-a:text-forensic-primary prose-a:no-underline hover:prose-a:underline
  prose-code:text-forensic-primary prose-code:font-medium
    prose-code:before:content-none prose-code:after:content-none
    prose-code:rounded prose-code:bg-forensic-surfaceAlt
    prose-code:px-1 prose-code:py-0.5 prose-code:text-[14px]
  prose-table:my-6 prose-table:w-full prose-table:border-collapse
    prose-table:overflow-hidden prose-table:rounded-lg
    prose-table:border prose-table:border-forensic-border
    prose-table:text-[14px] prose-table:shadow-lab-sm
  prose-thead:bg-forensic-surfaceAlt
  prose-th:border prose-th:border-forensic-border prose-th:px-3 prose-th:py-2
    prose-th:text-left prose-th:font-semibold prose-th:text-forensic-text
  prose-td:border prose-td:border-forensic-border prose-td:px-3 prose-td:py-2
    prose-td:align-top prose-td:text-forensic-text/90
  [&_tbody_tr:nth-child(even)]:bg-forensic-surfaceAlt/40`

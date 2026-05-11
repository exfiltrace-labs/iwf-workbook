import { Suspense, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { LabWorkbook, type Breadcrumb } from '@/components/workbook/LabWorkbook'
import { LabLoadingShell } from '@/components/LabLoadingShell'
import { PageTransition } from '@/components/PageTransition'
import { LABS, getLab } from '@/labs/registry'
import { rememberRecentLab } from '@/hooks/useRecentLab'
import { MODULES_BY_ID } from '@/content/modules'
import { NotFoundPage } from './NotFoundPage'

export function LabPage() {
  const { labId } = useParams<{ labId: string }>()
  const lab = getLab(labId)
  if (!lab) return <NotFoundPage />
  return <LabPageInner labId={lab.id} />
}

function LabPageInner({ labId }: { labId: string }) {
  const navigate = useNavigate()
  const lab = getLab(labId)!

  // Track this as the most recently visited lab so the home page can offer a
  // "Resume where you left off" card. Re-runs whenever the student navigates
  // between labs without unmounting.
  useEffect(() => {
    rememberRecentLab(labId)
  }, [labId])

  // Determine prev/next labs in registry order for the writeup footer.
  const idx = LABS.findIndex((l) => l.id === labId)
  const prev = idx > 0 ? LABS[idx - 1] : undefined
  const next = idx >= 0 && idx < LABS.length - 1 ? LABS[idx + 1] : undefined
  const moduleLabel = MODULES_BY_ID[lab.moduleId]?.label

  const breadcrumbs: Breadcrumb[] = [
    { label: 'Course Home', onClick: () => navigate('/') },
    ...(moduleLabel ? [{ label: moduleLabel }] : []),
    { label: `${lab.labNumber}: ${lab.title}` },
  ]

  return (
    <PageTransition motionKey={`lab-${labId}`}>
      <Suspense fallback={<LabLoadingShell label={lab.title} />}>
        <LabWorkbook
          content={lab.Component}
          breadcrumbs={breadcrumbs}
          eyebrow={lab.eyebrow ?? moduleLabel}
          badge={lab.labNumber}
          title={lab.title}
          description={lab.description}
          readTime={lab.readTime}
          difficulty={lab.difficulty}
          references={lab.references ?? []}
          prevLab={
            prev
              ? {
                  label: `${prev.labNumber}: ${prev.title}`,
                  onClick: () => navigate(`/labs/${prev.id}`),
                }
              : undefined
          }
          nextLab={
            next
              ? {
                  label: `${next.labNumber}: ${next.title}`,
                  onClick: () => navigate(`/labs/${next.id}`),
                }
              : undefined
          }
        />
      </Suspense>
    </PageTransition>
  )
}

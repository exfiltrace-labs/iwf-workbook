import { lazy, Suspense, useEffect } from 'react'
import { BrowserRouter, Route, Routes, useLocation } from 'react-router-dom'
import { AnimatePresence } from 'framer-motion'
import { LabShell } from '@/components/LabShell'
import { LabLoadingShell } from '@/components/LabLoadingShell'
import { HomePage } from '@/routes/HomePage'
import { LabPage } from '@/routes/LabPage'
import { NotFoundPage } from '@/routes/NotFoundPage'
import { COURSE } from '@/content/course'

/**
 * Per-lab interactive routes. Each interactive lab in the workbook is
 * its own self-contained module under `src/labs/<id>/`, with whatever
 * UI suits that lab. We register each one explicitly here next to the
 * generic `/labs/:labId` route so the bundle splitting stays clean and
 * adding the next interactive lab is a one-line addition rather than a
 * generic abstraction.
 */
const Lab21Investigation = lazy(() => import('@/labs/lab-2-1/InvestigationApp'))
const Lab42Custody = lazy(() => import('@/labs/lab-4-2/CustodyApp'))

/**
 * Top-level app. Mounts the router inside the persistent `LabShell` so the
 * navigation chrome stays consistent across the home page, every lab page,
 * and the 404 page.
 */
export default function App() {
  // While a print preview is open, force the document into light theme so
  // hardcoded Tailwind `dark:` utility classes (e.g. `dark:text-emerald-200`
  // on callout titles) don't bleed light-mode-incompatible colors onto the
  // printed page. The print stylesheet handles CSS-variable surfaces; this
  // handles the rest. The user's theme is restored after print closes.
  useEffect(() => {
    let restoreDark = false
    const onBeforePrint = () => {
      const root = document.documentElement
      restoreDark = root.classList.contains('dark')
      if (restoreDark) root.classList.remove('dark')
    }
    const onAfterPrint = () => {
      if (restoreDark) document.documentElement.classList.add('dark')
    }
    window.addEventListener('beforeprint', onBeforePrint)
    window.addEventListener('afterprint', onAfterPrint)
    return () => {
      window.removeEventListener('beforeprint', onBeforePrint)
      window.removeEventListener('afterprint', onAfterPrint)
    }
  }, [])

  return (
    <BrowserRouter>
      <LabShell courseName={COURSE.name}>
        <AnimatedRoutes />
      </LabShell>
    </BrowserRouter>
  )
}

/**
 * Routes wrapped in `AnimatePresence` so navigation between top-level
 * destinations cross-fades.
 */
function AnimatedRoutes() {
  const location = useLocation()

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<HomePage />} />
        <Route
          path="/labs/lab-2-1/investigate"
          element={
            <Suspense fallback={<LabLoadingShell label="Lab 2.1: Your First Investigation" />}>
              <Lab21Investigation />
            </Suspense>
          }
        />
        <Route
          path="/labs/lab-4-2/custody"
          element={
            <Suspense fallback={<LabLoadingShell label="Lab 4.2: Maintaining Chain of Custody" />}>
              <Lab42Custody />
            </Suspense>
          }
        />
        <Route path="/labs/:labId" element={<LabPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </AnimatePresence>
  )
}

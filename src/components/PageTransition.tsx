import { motion } from 'framer-motion'
import type { ReactNode } from 'react'

interface PageTransitionProps {
  /**
   * Stable key for `AnimatePresence`. When this changes, the wrapper
   * unmounts and remounts, triggering the fade-out / fade-in cycle.
   * Omit when used outside of an `AnimatePresence` (the wrapper still
   * fades in on mount).
   */
  motionKey?: string
  children: ReactNode
}

/**
 * Shared fade-in motion shell used by every top-level route and by
 * `LabPage`'s sub-step transitions. Centralizing this here means there
 * is exactly one place to tune timing or easing for the whole app.
 */
export function PageTransition({ motionKey, children }: PageTransitionProps) {
  return (
    <motion.div
      key={motionKey}
      className="flex h-full min-h-0 flex-col overflow-hidden"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
    >
      {children}
    </motion.div>
  )
}

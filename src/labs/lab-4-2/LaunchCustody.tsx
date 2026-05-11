import { useNavigate } from 'react-router-dom'
import { Beaker, ArrowRight } from 'lucide-react'

/**
 * The "Start Lab" affordance rendered at the bottom of the Lab 4.2 MDX
 * brief, opening the interactive chain-of-custody workspace. Imported
 * directly into `index.mdx` so the shared MDX_COMPONENTS registry stays
 * free of lab-specific bindings.
 */
export function LaunchCustody() {
  const navigate = useNavigate()
  return (
    <div className="not-prose mt-10 rounded-xl border border-forensic-primary/30 bg-forensic-primarySoft/40 px-5 py-4 shadow-lab-sm">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          <span className="flex h-9 w-9 flex-none items-center justify-center rounded-lg bg-forensic-primary/10 text-forensic-primary">
            <Beaker className="h-4 w-4" />
          </span>
          <div className="min-w-0">
            <p className="text-[14px] font-semibold leading-snug text-forensic-text">
              When you're ready, launch the custody form.
            </p>
            <p className="text-[12.5px] leading-snug text-forensic-textMuted">
              You can exit any time and your progress is saved automatically.
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => navigate('/labs/lab-4-2/custody')}
          className="inline-flex flex-none items-center gap-2 rounded-lg bg-forensic-primary px-4 py-2.5 text-[13px] font-semibold text-white shadow-lab-sm transition-colors hover:bg-forensic-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-forensic-primary/40 focus-visible:ring-offset-2 focus-visible:ring-offset-forensic-bg"
        >
          Start Lab
          <ArrowRight className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  )
}

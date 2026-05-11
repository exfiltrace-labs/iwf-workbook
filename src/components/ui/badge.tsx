import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const badgeVariants = cva(
  'inline-flex items-center rounded-md border px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wider transition-colors',
  {
    variants: {
      variant: {
        default: 'border-forensic-border bg-forensic-surfaceAlt text-forensic-textMuted',
        viewed: 'border-blue-200 bg-blue-50 text-blue-700',
        marked: 'border-amber-200 bg-amber-50 text-amber-700',
        corroborated: 'border-emerald-200 bg-emerald-50 text-emerald-700',
        herring: 'border-rose-200 bg-rose-50 text-rose-700',
        context: 'border-slate-200 bg-slate-50 text-slate-600',
        outline: 'border-forensic-borderBright text-forensic-textMuted bg-forensic-surface',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  },
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />
}

export { Badge, badgeVariants }

import * as React from 'react'
import { Slot } from '@radix-ui/react-slot'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg text-sm font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-forensic-primary/40 focus-visible:ring-offset-2 focus-visible:ring-offset-forensic-bg disabled:pointer-events-none disabled:opacity-50',
  {
    variants: {
      variant: {
        default:
          'bg-forensic-primary text-white hover:bg-forensic-primary/90 shadow-lab-sm',
        accent:
          'bg-forensic-accent text-white hover:bg-amber-700 shadow-lab-sm font-semibold',
        outline:
          'border border-forensic-border bg-forensic-surface text-forensic-text hover:bg-forensic-surfaceAlt hover:border-forensic-borderBright shadow-lab-sm',
        ghost:
          'bg-transparent text-forensic-textMuted hover:bg-forensic-surfaceAlt hover:text-forensic-text',
        destructive:
          'bg-rose-600 text-white hover:bg-rose-700 shadow-lab-sm',
      },
      size: {
        default: 'h-10 px-4 py-2',
        sm: 'h-8 px-3 text-xs',
        lg: 'h-12 px-6 text-base',
        icon: 'h-9 w-9',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  },
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : 'button'
    return <Comp className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props} />
  },
)
Button.displayName = 'Button'

export { Button, buttonVariants }

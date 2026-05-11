import { Moon, Sun } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useTheme } from '@/hooks/useTheme'

interface ThemeToggleProps {
  className?: string
}

/**
 * Header-nav button that toggles between light and dark themes. Renders
 * a sun in light mode (click to go dark) and a moon in dark mode (click
 * to go light), matching the convention most apps use.
 */
export function ThemeToggle({ className }: ThemeToggleProps) {
  const { theme, toggleTheme } = useTheme()
  const isDark = theme === 'dark'
  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={isDark ? 'Switch to light theme' : 'Switch to dark theme'}
      title={isDark ? 'Switch to light theme' : 'Switch to dark theme'}
      className={cn(
        'flex h-8 w-8 flex-none items-center justify-center rounded-md text-zinc-300 transition-colors hover:bg-white/10 hover:text-zinc-100 focus-visible:bg-white/10 focus-visible:text-zinc-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40',
        className,
      )}
    >
      {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
    </button>
  )
}

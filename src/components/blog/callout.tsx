import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'

interface CalloutProps {
  children: ReactNode
  className?: string
}

export function Callout({ children, className }: CalloutProps) {
  return (
    <aside
      role="note"
      className={cn(
        'my-6 rounded-md border border-accent/30 bg-accent/5 px-4 py-3 text-neutral-700 dark:text-neutral-600',
        className
      )}
    >
      <div className="text-sm leading-relaxed [&_p]:mb-0">{children}</div>
    </aside>
  )
}

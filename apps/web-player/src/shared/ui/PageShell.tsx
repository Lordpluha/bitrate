import { cn } from '@bitrate/ui-react'
import type { ReactNode } from 'react'

type PageShellProps = {
  children: ReactNode
  /** `narrow` caps the column at the reading width; `full` lets it span the panel. */
  width?: 'full' | 'narrow'
}

/**
 * A scrolling main-panel page with the standard gutters and spacing. It fills the panel's
 * height, so a State/Message among its children takes the rest of it and sits in the middle;
 * the `narrow` reading width caps every child but that message, which centres on the panel.
 */
export const PageShell = ({ children, width = 'narrow' }: PageShellProps) => (
  <div className="flex h-full flex-1 flex-col overflow-y-auto custom-scrollbar">
    <div
      className={cn(
        'flex flex-1 flex-col gap-5 px-4 pt-2 pb-3 md:gap-6 md:px-8 md:py-6',
        width === 'narrow' && '[&>:not([data-slot=state-message])]:max-w-174',
      )}
    >
      {children}
    </div>
  </div>
)

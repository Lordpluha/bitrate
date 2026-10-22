import { cn } from '@bitrate/ui-react'
import type { ReactNode } from 'react'

type PageShellProps = {
  children: ReactNode
  /** `narrow` caps the column at the reading width; `full` lets it span the panel. */
  width?: 'full' | 'narrow'
}

/** A scrolling main-panel page with the standard gutters and spacing. */
export const PageShell = ({ children, width = 'narrow' }: PageShellProps) => (
  <div className="h-full overflow-y-auto custom-scrollbar">
    <div
      className={cn(
        'flex flex-col gap-5 px-4 pt-2 pb-3 md:gap-6 md:px-8 md:py-6',
        width === 'narrow' && 'max-w-190',
      )}
    >
      {children}
    </div>
  </div>
)

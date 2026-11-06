import { cn } from '@bitrate/ui-react'
import type { ReactNode } from 'react'

type PageShellProps = {
  children: ReactNode
  /** `narrow` caps the column at the reading width; `full` lets it span the panel. */
  width?: 'full' | 'narrow'
}

/**
 * A scrolling main-panel page with the standard gutters and spacing. The narrow column sits in
 * the middle of the panel, and the column fills the panel's height so a State/Message below the
 * title centres in the space that is left.
 */
export const PageShell = ({ children, width = 'narrow' }: PageShellProps) => (
  <div className="h-full overflow-y-auto custom-scrollbar">
    <div
      className={cn(
        'flex min-h-full flex-col gap-5 px-4 pt-2 pb-3 md:gap-6 md:px-8 md:py-6',
        width === 'narrow' && 'mx-auto w-full max-w-190',
      )}
    >
      {children}
    </div>
  </div>
)

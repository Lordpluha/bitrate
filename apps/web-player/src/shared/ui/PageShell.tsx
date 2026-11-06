import type { ReactNode } from 'react'

type PageShellProps = {
  children: ReactNode
}

/**
 * A scrolling main-panel page with the standard gutters and spacing. The column spans the panel
 * like every other main page, so the title keeps its place at the left edge, and fills the
 * panel's height so a State/Message below the title centres in the space that is left.
 */
export const PageShell = ({ children }: PageShellProps) => (
  <div className="h-full overflow-y-auto custom-scrollbar">
    <div className="flex min-h-full flex-col gap-5 px-4 pt-2 pb-3 md:gap-6 md:px-8 md:py-6">
      {children}
    </div>
  </div>
)

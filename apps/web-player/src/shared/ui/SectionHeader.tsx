import type { ReactNode } from 'react'

type SectionHeaderProps = {
  /** "Show all" or another trailing action, already linked where it should be. */
  action?: ReactNode
  title: string
}

/** The design system's Section Header: a 22px Unbounded title and an optional muted action. */
export const SectionHeader = ({ action, title }: SectionHeaderProps) => (
  <div className="mb-4 flex items-center justify-between gap-3">
    <h2 className="text-[22px] leading-[1.25] font-semibold text-foreground">
      {title}
    </h2>
    {action ? (
      <span className="shrink-0 text-[13px] font-semibold text-muted-foreground">
        {action}
      </span>
    ) : null}
  </div>
)

import type { ReactNode } from 'react'

type PageTitleProps = {
  /** A trailing action, e.g. "Clear queue". */
  action?: ReactNode
  title: string
}

/** The design's Page Title: a 32px Unbounded heading with an optional action beside it. */
export const PageTitle = ({ action, title }: PageTitleProps) => (
  <div className="flex items-center justify-between gap-4">
    <h1 className="truncate text-2xl leading-[1.1] font-bold text-foreground md:text-[32px]">
      {title}
    </h1>
    {action}
  </div>
)

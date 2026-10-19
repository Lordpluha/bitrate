import type { ReactNode } from 'react'

type AuthHeadingProps = {
  description?: ReactNode
  title: string
}

/** The screen title and the line under it. */
export const AuthHeading = ({ description, title }: AuthHeadingProps) => (
  <header className="flex flex-col gap-2">
    <h1 className="font-[family-name:var(--font-landing-display)] text-2xl leading-[1.25] font-semibold tracking-[-0.4px] text-foreground">
      {title}
    </h1>
    {description ? (
      <p className="text-sm leading-normal text-muted-foreground">
        {description}
      </p>
    ) : null}
  </header>
)

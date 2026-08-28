import { LogoIcon, Typography } from '@spotify/ui-react'
import type { ReactNode } from 'react'

type AuthFormHeaderProps = {
  description: ReactNode
  title: string
}

export const AuthFormHeader = ({ description, title }: AuthFormHeaderProps) => (
  <header className="flex flex-col items-center">
    <LogoIcon aria-hidden="true" height={64} width={64} />
    <Typography as="h1" className="mt-2 text-center" size="heading5">
      {title}
    </Typography>
    <Typography as="div" className="text-center text-grey-500" size="body">
      {description}
    </Typography>
  </header>
)

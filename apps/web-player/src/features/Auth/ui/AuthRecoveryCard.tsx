import { LogoIcon } from '@bitrate/ui-react'
import type { ReactNode } from 'react'

type AuthRecoveryCardProps = {
  children: ReactNode
  description: string
  title: string
}

export const AuthRecoveryCard = ({
  children,
  description,
  title,
}: AuthRecoveryCardProps) => (
  <section className="mx-auto flex w-full max-w-xl flex-col gap-6 rounded-lg bg-contrast px-8 py-10 text-text-contrast shadow-2xl max-sm:px-5">
    <div className="flex flex-col items-center text-center">
      <LogoIcon aria-hidden="true" height={64} width={64} />
      <h1 className="mt-4 text-3xl font-bold">{title}</h1>
      <p className="mt-2 text-sm text-grey-500">{description}</p>
    </div>
    {children}
  </section>
)

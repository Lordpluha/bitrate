import { LogoIcon } from '@bitrate/ui-react'
import { ROUTES } from '@shared/routes'
import Link from 'next/link'

export type LogoProps = {
  href?: string
}

export const Logo = ({ href = ROUTES.landing }: LogoProps) => {
  return (
    <Link
      aria-label="Bitrate Home"
      className="transition-[0.3s] hover:opacity-70"
      href={href}
    >
      <LogoIcon className="transition-[0.3s]" height={32} width={32} />
    </Link>
  )
}

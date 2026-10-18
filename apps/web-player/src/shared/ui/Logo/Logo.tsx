import { LogoIcon } from '@bitrate/ui-react'
import { ROUTES } from '@shared/routes'
import Link from 'next/link'

export type LogoProps = {
  href?: string
  /** Shows the "Bitrate" wordmark beside the mark, as the app's top bar does. */
  wordmark?: boolean
}

export const Logo = ({
  href = ROUTES.landing,
  wordmark = false,
}: LogoProps) => {
  return (
    <Link
      aria-label="Bitrate Home"
      className="flex items-center gap-2.5 transition-[0.3s] hover:opacity-70"
      href={href}
    >
      <LogoIcon
        className="transition-[0.3s]"
        height={wordmark ? 33 : 32}
        width={wordmark ? 33 : 32}
      />
      {wordmark ? (
        <span className="font-[family-name:var(--font-landing-display)] text-[19px] leading-none font-bold text-foreground">
          Bitrate
        </span>
      ) : null}
    </Link>
  )
}

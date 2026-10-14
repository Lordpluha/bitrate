import { cn } from '@bitrate/ui-react'
import { ROUTES } from '@shared/routes'
import Image from 'next/image'
import Link from 'next/link'

type AuthLogoProps = {
  className?: string
  size?: 'panel' | 'form'
}

/** The Bitrate lockup: the brand mark and the word, linking back to the landing. */
export const AuthLogo = ({ className, size = 'form' }: AuthLogoProps) => (
  <Link
    aria-label="Bitrate home"
    className={cn('flex w-fit items-center gap-2.5', className)}
    href={ROUTES.landing}
  >
    {/* A raster mark, as in the design: two inline SVG logos on one page share gradient ids. */}
    <Image
      alt=""
      height={size === 'panel' ? 32 : 30}
      src="/images/auth/bitrate-mark.webp"
      unoptimized
      width={size === 'panel' ? 32 : 30}
    />
    <span
      className={cn(
        'font-[family-name:var(--font-landing-display)] font-semibold',
        size === 'panel' ? 'text-[22px] text-white' : 'text-xl text-foreground',
      )}
    >
      Bitrate
    </span>
  </Link>
)

import { LogoIcon } from '@bitrate/ui-react'
import Link from 'next/link'

export const ArtistLogo = () => {
  return (
    <Link aria-label="Bitrate for Artists home" href={'/'}>
      <LogoIcon height={36} width={36} />
    </Link>
  )
}

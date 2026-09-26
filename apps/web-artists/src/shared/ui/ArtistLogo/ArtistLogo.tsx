import { LogoIcon } from '@bitrate/ui-react'
import { Link } from '@tanstack/react-router'

export const ArtistLogo = () => {
  return (
    <Link aria-label="Bitrate for Artists home" to="/">
      <LogoIcon height={36} width={36} />
    </Link>
  )
}

import { Button } from '@bitrate/ui-react'
import { ROUTES } from '@shared/routes/routes'
import { ArtistLogo } from '@shared/ui'
import { Link } from '@tanstack/react-router'

export const LandingHeader = () => {
  return (
    <header className="border-b border-border">
      <div className="mx-auto flex h-18 max-w-7xl items-center justify-between gap-4 px-4 sm:px-8">
        <ArtistLogo />
        <nav aria-label="Account" className="flex items-center gap-2">
          <Button asChild variant="ghost">
            <Link to={ROUTES.auth.login}>Log in</Link>
          </Button>
          <Button asChild>
            <Link to={ROUTES.auth.registration}>Sign up</Link>
          </Button>
        </nav>
      </div>
    </header>
  )
}

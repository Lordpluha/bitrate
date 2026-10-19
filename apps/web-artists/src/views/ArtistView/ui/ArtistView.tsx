import { LandingFeatures } from './LandingFeatures'
import { LandingFooter } from './LandingFooter'
import { LandingHeader } from './LandingHeader'
import { LandingHero } from './LandingHero'

/** The public page at `/`: what the artist workspace does today, with sign-up and log-in. */
export const ArtistView = () => {
  return (
    <div className="artist-dashboard flex min-h-dvh flex-col bg-background text-foreground">
      <LandingHeader />
      <main className="flex-1">
        <LandingHero />
        <LandingFeatures />
      </main>
      <LandingFooter />
    </div>
  )
}

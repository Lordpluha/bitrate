import { LandingFeatures } from './LandingFeatures'
import { LandingFinale } from './LandingFinale'
import { LandingFooter } from './LandingFooter'
import { LandingHeader } from './LandingHeader'
import { LandingHero } from './LandingHero'
import { LandingSignal } from './LandingSignal'

/** The public page at `/`: what the artist workspace does today, with sign-up and log-in. */
export const ArtistView = () => {
  return (
    <div className="artist-dashboard artist-landing flex min-h-dvh flex-col bg-background text-foreground">
      {/* Wope-style diagonal Spotlight Beams + Studio Grid + Horizon Nebula */}
      <div aria-hidden="true" className="artist-landing-backdrop">
        <div className="artist-landing-spotlight-left" />
        <div className="artist-landing-spotlight-right" />
        <div className="artist-landing-grid" />
        <div className="artist-landing-horizon" />
      </div>

      <div aria-hidden="true" className="artist-landing-closing-glow" />
      <LandingSignal />

      <LandingHeader />
      <main className="flex-1">
        <LandingHero />
        <LandingFeatures />
        <LandingFinale />
      </main>
      <LandingFooter />
    </div>
  )
}

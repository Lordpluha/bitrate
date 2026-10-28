import { Button } from '@bitrate/ui-react'
import { ROUTES } from '@shared/routes/routes'
import { Link } from '@tanstack/react-router'
import { ArrowRight } from 'lucide-react'

export const LandingHero = () => {
  return (
    <section
      aria-labelledby="landing-title"
      className="mx-auto grid max-w-7xl items-center gap-8 px-4 py-10 sm:px-8 lg:grid-cols-[minmax(0,35rem)_1fr] lg:gap-12 lg:py-20"
    >
      <div className="flex flex-col gap-5">
        <p className="text-sm font-semibold uppercase tracking-wider text-text-secondary">
          Bitrate for Artists
        </p>
        <h1
          className="text-balance text-4xl font-semibold leading-tight lg:text-6xl"
          id="landing-title"
        >
          Plan, prepare and track your releases.
        </h1>
        <p className="text-pretty text-lg text-text-secondary">
          One workspace for the releases you put out on Bitrate: drafts, credits
          and rights, publishing and listening analytics.
        </p>
        <div className="flex flex-wrap gap-3">
          <Button asChild size="lg">
            <Link to={ROUTES.auth.registration}>
              Create an account
              <ArrowRight aria-hidden="true" />
            </Link>
          </Button>
          <Button asChild size="lg" variant="outline">
            <Link to={ROUTES.auth.login}>Log in</Link>
          </Button>
        </div>
      </div>
      <img
        alt=""
        className="h-65 w-full rounded-xl object-cover lg:h-105"
        decoding="async"
        height={420}
        src="/artwork/landing/night-signal.webp"
        width={720}
      />
    </section>
  )
}

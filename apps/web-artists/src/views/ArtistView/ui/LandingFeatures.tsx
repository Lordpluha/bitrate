import { LandingCredits } from './LandingCredits'
import { ListeningResponse } from './ListeningResponse'
import { ReleaseJourney } from './ReleaseJourney'

export const LandingFeatures = () => (
  <div className="mx-auto flex max-w-7xl flex-col gap-20 px-4 pb-20 sm:px-8 lg:gap-28 lg:pb-28">
    <ReleaseJourney />
    <LandingCredits />
    <ListeningResponse />
  </div>
)

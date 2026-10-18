import { AboutArtist } from '@widgets/RightSidebar/AboutArtist'
import { Credits } from '@widgets/RightSidebar/Credits'
import { NextInQueue } from '@widgets/RightSidebar/NextInQueue'

/** Up Next, the artist and the credits beside (or under) the full Now Playing view. */
export const NowPlayingDetails = () => (
  <section className="flex min-w-0 flex-col gap-5">
    <NextInQueue />
    <AboutArtist />
    <Credits />
  </section>
)

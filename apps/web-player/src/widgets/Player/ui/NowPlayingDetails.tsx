import { AboutArtist } from '@widgets/RightSidebar/AboutArtist'
import { Credits } from '@widgets/RightSidebar/Credits'
import { NextInQueue } from '@widgets/RightSidebar/NextInQueue'

export const NowPlayingDetails = () => (
  <section className="px-4 pb-24 pt-10 sm:px-6 sm:pb-26 xl:pb-28">
    <div className="mx-auto w-full max-w-5xl">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div className="flex flex-col gap-4">
          <AboutArtist />
          <NextInQueue />
        </div>
        <div className="flex flex-col gap-4">
          <Credits />
        </div>
      </div>
    </div>
  </section>
)

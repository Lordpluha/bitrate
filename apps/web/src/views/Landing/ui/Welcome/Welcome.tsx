/** biome-ignore-all lint/performance/noImgElement: decoration */
import { Typography } from '@spotify/ui-react'

import { DownloadButton } from './DownloadButton'
import { Statistics } from './Statistics'

export const Welcome = () => {
  return (
    <div className="hero flex gap-2 items-stretch container p-0 box-border max-lg:grid max-lg:grid-rows-2 -mt-[112px] max-lg:-mt-25">
      <div className=" flex-1 p-20 pt-40 rounded-3xl bg-bgSecondary mt-2 flex flex-col items-start gap-8 max-lg:p-10 max-lg:pt-35">
        <Typography as="h1" className={'leading-[1.2]'} size={'heading1'}>
          Discover a World of Music with Spotify
        </Typography>
        <Typography as="p" className="text-xl" size={'body'}>
          {' '}
          Welcome to Spotify, where music comes alive. Experience a universe of
          endless tunes, handpicked playlists, and personalized recommendations
          just for you.
        </Typography>
        <DownloadButton />
        <Statistics />
      </div>
      <div
        className="relative flex-1 p-20 pt-40 rounded-3xl mt-2 flex flex-col items-center border-green-500 border-solid border-2 overflow-hidden"
        style={{
          background:
            'linear-gradient(150deg, #0d2616 0%, var(--color-secondary) 99.04%)',
        }}
      >
        {/* <SpotifyCurvesIcon
          className='w-full h-full absolute top-0 bottom-0 left-0 right-0 z-[1] object-contain'
          color='#107032'
        /> */}
        <img
          alt=""
          aria-hidden="true"
          className="w-full h-full absolute top-30 bottom-0 left-0 right-0 z-2 object-contain"
          src="/images/intro-phone.png"
        />
        <img
          alt=""
          aria-hidden="true"
          className="w-91 h-13.5 absolute bottom-33 left-0 right-0 z-3 object-cover"
          src="/images/spotify-music-1.png"
        />
        <img
          alt=""
          aria-hidden="true"
          className="w-91 h-21 absolute bottom-10 left-10 right-0 z-3 object-cover"
          src="/images/spotify-music-2.png"
        />
      </div>
    </div>
  )
}

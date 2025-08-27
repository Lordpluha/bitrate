import { Typography } from '@spotify/ui'
import { DownloadButton } from './DownloadButton'
import { Statistics } from './Statistics'
import clsx from 'clsx'
import { SpotifyCurvesIcon } from '@shared/ui'

import styles from './MobileBlock.module.css'

export const Welcome = () => {
  return (
    <div className='hero flex gap-2 items-stretch container p-0 box-border max-lg:grid max-lg:grid-rows-2 -mt-[112px] max-lg:-mt-[100px]'>
      <div className=' flex-1 p-20 pt-[160px] rounded-3xl bg-bgSecondary mt-2 flex flex-col items-start gap-8 max-lg:p-10 max-lg:pt-[140px]'>
        <Typography.Heading1 className={'leading-[1.2]'}>
          Discover a World of Music with Spotify
        </Typography.Heading1>
        <Typography.Paragraph className='text-xl'>
          {' '}
          Welcome to Spotify, where music comes alive. Experience a universe of
          endless tunes, handpicked playlists, and personalized recommendations
          just for you.
        </Typography.Paragraph>
        <DownloadButton />
        <Statistics />
      </div>
      <div
        className={clsx(
          'relative flex-1 p-20 pt-[160px] rounded-3xl mt-2 flex flex-col items-center border-green-500 border-solid border-2 overflow-hidden',
          styles.bgHeroGradient
        )}
      >
        <SpotifyCurvesIcon
          className='w-full h-full absolute top-0 bottom-0 left-0 right-0 z-[1] object-contain'
          color='#107032'
        />
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          className='w-full h-full absolute top-[120px] bottom-0 left-0 right-0 z-[2] object-contain'
          src='/images/intro-phone.png'
        />
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          className='w-[364px] h-[54px] absolute bottom-[132px] left-0 right-0 z-[3] object-cover'
          src='/images/spotify-music-1.png'
        />
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          className='w-[364px] h-[84px] absolute bottom-10 left-10 right-0 z-[3] object-cover'
          src='/images/spotify-music-2.png'
        />
      </div>
    </div>
  )
}

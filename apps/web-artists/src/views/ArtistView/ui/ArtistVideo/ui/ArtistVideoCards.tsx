import Link from 'next/link'
import { useRef, useReducer } from 'react'
import { CheckMark, Unpause, Pause, Button } from '@spotify/ui-react'
import config from '../config/video-config.json'

type VideoLink = { text: string; href: string }

const lnk = (links: VideoLink[], text: string) =>
  links.find((l) => l.text === text)?.href ?? '#'

const linkCls = 'underline underline-offset-2 transition-colors duration-300 hover:text-purple-600'
const paragraphCls = 'mt-4 text-base leading-relaxed'
const ulCls = 'mt-4 text-base list-none'

export const ArtistVideoCards = () => {
  return (
    <section className='bg-black w-full'>
      <div className='w-full max-w-screen-2xl mx-auto'>

        {/* Amplify your music */}
        {(() => {
          const video = config.videoCard[0]
          const l = (text: string) => lnk(video.links, text)
          return (
            <VideoCard video={video} reverse={false}>
              <p className={paragraphCls}>
                Turn up your music with Campaign Kit — a set of tools designed to drive meaningful
                metrics for artists and music marketers. Expand your reach and build lifelong fans.
              </p>
              <ul className={ulCls}>
                <Description accent={video.accent}>
                  <Link href={l('Marquee')} className={linkCls}>Marquee</Link>
                  {' '}makes your new release unmissable with a full-screen recommendation.
                </Description>
                <Description accent={video.accent}>
                  <Link href={l('Showcase')} className={linkCls}>Showcase</Link>
                  {' '}promotes your music on Spotify's Home with a selected headline.
                </Description>
                <Description accent={video.accent}>
                  <Link href={l('Discovery Mode')} className={linkCls}>Discovery Mode</Link>
                  {' '}can give your music a boost in personalized playlists.
                </Description>
                <Description accent={video.accent}>
                  Share your upcoming tracks with Spotify editors using{' '}
                  <Link href={l('playlist pitching')} className={linkCls}>playlist pitching</Link>.
                </Description>
              </ul>
            </VideoCard>
          )
        })()}

        {/* Connect with fans */}
        {(() => {
          const video = config.videoCard[1]
          const l = (text: string) => lnk(video.links, text)
          return (
            <VideoCard video={video} reverse={true}>
              <p className={paragraphCls}>
                Invite listeners into your creative world. Customize your artist profile, create
                videos & visuals, and bring the story behind your music to life.
              </p>
              <ul className={ulCls}>
                <Description accent={video.accent}>
                  <Link href={l('Clips')} className={linkCls}>Clips</Link>
                  {' '}are short videos you create to connect with fans while keeping your music front-and-center.
                </Description>
                <Description accent={video.accent}>
                  Add a{' '}
                  <Link href={l('Canvas')} className={linkCls}>Canvas</Link>
                  {' '}– a short, looping visual – to each of your tracks on Spotify.
                </Description>
                <Description accent={video.accent}>
                  <Link href={l('Countdown Pages')} className={linkCls}>Countdown Pages</Link>
                  {' '}help you get fans hyped for your upcoming album.
                </Description>
                <Description accent={video.accent}>
                  Your{' '}
                  <Link href={l('Artist Profile')} className={linkCls}>Artist Profile</Link>
                  {' '}shows fans what you're all about.
                </Description>
              </ul>
            </VideoCard>
          )
        })()}

        {/* Grow your business */}
        {(() => {
          const video = config.videoCard[2]
          const l = (text: string) => lnk(video.links, text)
          return (
            <VideoCard video={video} reverse={false}>
              <p className={paragraphCls}>
                There are many ways to earn revenue as an artist on Spotify. While{' '}
                <Link href={l('Loud & Clear')} className={linkCls}>Loud & Clear</Link>
                {' '}is your source for data, resources, and transparency around streaming royalties,
                here are some other opportunities to explore.
              </p>
              <ul className={ulCls}>
                <Description accent={video.accent}>
                  <Link href={l('Sell and promote merch')} className={linkCls}>Sell and promote merch</Link>
                  {' '}on Spotify, because music and merch are better together.
                </Description>
                <Description accent={video.accent}>
                  List your{' '}
                  <Link href={l('concert and festival dates')} className={linkCls}>concert and festival dates</Link>
                  {' '}to make sure your fans never miss another show.
                </Description>
                <Description accent={video.accent}>
                  <Link href={l('Fan Support')} className={linkCls}>Fan Support</Link>
                  {' '}lets you collect tips, or rally listeners around a charitable cause.
                </Description>
              </ul>
            </VideoCard>
          )
        })()}

        {/* Understand your audience */}
        {(() => {
          const video = config.videoCard[3]
          const l = (text: string) => lnk(video.links, text)
          return (
            <VideoCard video={video} reverse={true}>
              <p className='mt-4 text-base'>
                Dig into audience, playlist, and music data to help you reach your goals.
              </p>
              <ul className={ulCls}>
                <Description accent={video.accent}>
                  <Link href={l('Segments')} className={linkCls}>Segments</Link>
                  {' '}allow you to better understand the breakdown of your audience.
                </Description>
                <Description accent={video.accent}>
                  Hone your marketing strategy with release engagement and{' '}
                  <Link href={l('listener conversion metrics')} className={linkCls}>listener conversion metrics</Link>.
                </Description>
                <Description accent={video.accent}>
                  <Link href={l('Fan Study')} className={linkCls}>Fan Study</Link>
                  {' '}is our ongoing report about fan behavior around the world.
                </Description>
              </ul>
            </VideoCard>
          )
        })()}

      </div>
    </section>
  )
}

type VideoEntry = (typeof config.videoCard)[number]

function VideoCard({
  video,
  reverse,
  children,
}: {
  video: VideoEntry
  reverse: boolean
  children: React.ReactNode
}) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [isPaused, togglePaused] = useReducer((s: boolean) => !s, false)

  const handleToggle = () => {
    const v = videoRef.current
    if (!v) return
    isPaused ? v.play() : v.pause()
    togglePaused()
  }

  return (
    <div
      id={video.id}
      className='flex items-center py-8 px-6 lg:py-16'
    >
      <div className={`xs:gap-8 lg:flex-row flex flex-col w-full justify-between items-center gap-4 ${reverse ? '' : 'lg:flex-row-reverse'}`}>

        <div className='lg:self-center flex flex-col self-start max-w-154 w-full order-2 text-white lg:order-1'>
          <h2 className='text-[32px] lg:text-5xl font-bold'>{video.title}</h2>
          <div className='
            [&_p]:leading-5 xs:[&_p]:leading-relaxed
            [&_ul]:space-y-2 xs:[&_ul]:space-y-3
            [&_ul]:leading-5 xs:[&_ul]:leading-relaxed
          '>
            {children}
          </div>
          <div className='flex justify-center xs:justify-start mt-6'>
            <Button
              variant={'artistCard'}
              asChild
              size='xl'
            >
              <Link href='/'>Explore Campaign Kit</Link>
            </Button>
          </div>
        </div>

        <div className='lg:order-2 order-1 relative group w-full max-w-240 lg:max-w-154'>
          <video
            ref={videoRef}
            autoPlay
            muted
            loop
            playsInline
            preload='metadata'
            onClick={handleToggle}
            className='w-full h-auto rounded-lg object-cover cursor-pointer'
          >
            <source src={video.src} type='video/webm' />
          </video>

          <div className='absolute flex justify-end mb-2 bottom-2 right-0 opacity-0 
                group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300
                translate-y-4 '>
            <button
              onClick={handleToggle}
              aria-label={isPaused ? 'Play video' : 'Pause video'}
              className='inline-flex items-center p-2 bg-white text-black rounded-3xl cursor-pointer 
                transition-transform duration-400
                hover:scale-120'
            >
              {isPaused ? <Unpause className='w-6 h-6 ' /> : <Pause className='w-6 h-6' />}
            </button>
          </div>

        </div>

      </div>
    </div>
  )
}

function Description({ accent, children }: { accent: string; children: React.ReactNode }) {
  return (
    <li className='flex gap-2 items-start'>
      <span
        className='mt-0.5 shrink-0 flex items-center justify-center w-5 h-5 rounded-full'
        style={{ backgroundColor: accent }}
      >
        <CheckMark className='w-3 h-3' />
      </span>
      <span>{children}</span>
    </li>
  )
}

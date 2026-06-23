import { useReducer, useRef } from 'react'
import Link from 'next/link'
import { Unpause, Pause, ArrowDownIcon } from '@spotify/ui-react'

import videoYtConfig from '../config/bgVideo-config.json'
import navLinksData from '../config/navLink-config.json'

export const ArtistHero = () => {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [isPaused, togglePaused] = useReducer((s: boolean) => !s, false)

  const handleToggle = () => {
    const video = videoRef.current
    if (!video) return
    isPaused ? video.play() : video.pause()
    togglePaused()
  }

  return (
    <section className='relative overflow-hidden'>
      <video
        ref={videoRef}
        autoPlay
        muted
        loop
        playsInline
        preload='metadata'
        className='md:object-[60%_40%] absolute h-full w-full object-cover object-[55%_45%]'
      >
        <source src={videoYtConfig.bgVideo.src} type='video/webm' />
        <p className='sr-only'>{videoYtConfig.bgVideo.fallbackText}</p>
      </video>

      <div className='sm:px-8 lg:justify-center relative flex h-full flex-col justify-end pb-14 pt-24 mx-auto container'>

        <div className='mt-[90vw] lg:mt-12 mb-12 font-bold'>
          <h1 className='sm:text-5xl md:text-6xl lg:text-5xl xl:text-6xl 2xl:text-8xl text-[40px] inline-block text-white leading-tight'>
            Where your music <br />is everything
          </h1>
          <p className='sm:text-xl md:text-4xl lg:text-2xl xl:text-4xl 2xl:text-5xl leading-14 text-2xl pt-5 text-white'>
            Develop your fanbase, build your <br className='hidden lg:block' />
            business and create the world <br className='hidden 2xl:block' />
            around your music.
          </p>
        </div>

        <div className='flex flex-col gap-2'>

          <div className='flex justify-end mb-2'>
            <button
              onClick={handleToggle}
              aria-label={isPaused ? 'Play video' : 'Pause video'}
              className='inline-flex items-center p-2 text-white rounded-3xl border-solid border cursor-pointer transition-transform duration-300 hover:scale-110'
            >
              {isPaused ? <Unpause className='w-6 h-6' /> : <Pause className='w-6 h-6' />}
            </button>
          </div>

          <div className='lg:flex-row lg:gap-6 flex flex-col gap-2 w-full'>
            {navLinksData.navLinks.map((link, index) => (
              <Link
                key={index}
                href={link.href}
                className='relative group overflow-hidden p-4 text-xl text-balance font-bold rounded-md bg-white text-black
                  sm:text-xl md:text-2xl xl:text-[34px]
                  lg:rounded-none lg:bg-transparent lg:border-t lg:text-white lg:mix-blend-screen'
              >
                <span
                  className='hidden lg:block absolute inset-0 bg-white -translate-y-full transition-transform duration-500 ease-in-out group-hover:translate-y-0'
                  aria-hidden='true'
                />
                <span className='relative transition-colors duration-300 ease-in-out group-hover:text-black'>
                  {link.title}
                  <ArrowDownIcon className='lg:block w-8 h-8 hidden mt-8' />
                </span>
              </Link>
            ))}
          </div>

        </div>
      </div>
    </section>
  )
}

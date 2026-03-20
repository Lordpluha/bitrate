import Link from 'next/link'
import Image from 'next/image'
import { Button } from '@spotify/ui-react'
import config from '../config/artist-blog.json'

export const ArtistBlog = () => {
  return (
    <>
      <div className='container pb-12 lg:pb-16'>
        <h2 className='text-[36px] font-bold text-black text-balance my-8'>{config.title}</h2>
        <div className='grid grid-cols-1 lg:grid-cols-6 gap-y-12 gap-x-6'>
          {config.artistBlogLinks.map((item, index) => (
            <article
              key={index}
              className={`group flex flex-col ${index < 2 ? 'lg:col-span-3' : 'lg:col-span-2'}`}
            >
              <Link
                href={item.href}
                className='flex flex-col gap-4'
              >
                <div className='relative w-full aspect-video overflow-hidden'>
                  <Image
                    src={item.imageSrc}
                    alt={item.titleImage}
                    fill
                    className='object-cover transform transition-transform duration-300 group-hover:scale-105'
                  />
                </div>
                <h3 className='md:text-2xl text-xl text-black font-bold text-balance transition decoration-2 underline-offset-4 group-hover:underline'>
                  {item.titleImage}
                </h3>
                <p className='xs:block text-base text-black font-normal hidden'>
                  {item.description}
                </p>
              </Link>
            </article>
          ))}
        </div>
      </div>

      <div className='w-full bg-blue-600 py-10 px-4 xs:px-8 sm:px-12 sm:py-16'>
        <div className='container flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between sm:gap-12'>
          <header className='flex flex-col text-balance lg:flex-1'>
            <span className='text-[32px] font-bold text-white mb-4'>
              Ready to claim your artist profile?
            </span>
            <span className='font-normal text-base text-white'>
              Use a Spotify account to get access to Spotify for Artists.
            </span>
          </header>
          <div className='flex justify-center lg:justify-end xs:justify-start'>
            <Button
              variant={'ghost'}
              asChild
              size='lg'
              className='lg:px-8 bg-white lg:items-center text-blue-600! font-bold rounded-full px-6 py-2 transition-all duration-300 hover:scale-105'
            >
              <Link href='/'>Get started</Link>
            </Button>
          </div>
        </div>
      </div>
    </>
  )
}

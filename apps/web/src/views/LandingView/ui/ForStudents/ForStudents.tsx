import { ROUTES } from '@shared/routes'
import { Typography } from '@spotify/ui-react'
import Link from 'next/link'

export const ForStudents = () => {
  return (
    <div className="py-16 container 3xl:!max-w-[1540px] text-center max-lg:py-12 max-md:py-8">
      <div className="container flex flex-col items-center justify-center">
        <Typography
          as={'h3'}
          className={'leading-[1.2] mb-8 max-md:mb-6'}
          size={'heading3'}
        >
          Enjoy Premium Features with Our Student Discount!
        </Typography>

        <Typography as="p" className="mb-6 max-md:mb-4" size={'body'}>
          Spotify loves students, and we've got a special treat for you! Elevate
          your music experience without breaking the bank. Unlock all the
          premium features you love at an exclusive student discount.
        </Typography>

        <Link
          className="text-xl py-2 px-6 rounded-3xl hover:opacity-70 transition-[1s] text-text font-medium border-solid border-2 border-text block mb-4 min-w-[254px]"
          href={ROUTES.forStudents}
        >
          Learn more
        </Link>
      </div>
    </div>
  )
}

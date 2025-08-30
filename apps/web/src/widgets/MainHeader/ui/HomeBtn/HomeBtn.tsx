import { ROUTES } from '@shared/routes'
import { HomeIcon } from '@shared/ui'
import Link from 'next/link'
import React from 'react'

export const HomeBtn = () => {
  return (
    <Link className='bg-surface p-3 rounded-full hover:opacity-70 transition-[.3s] h-12 w-12 flex items-center justify-center' href={ROUTES.main}>
      <HomeIcon className='fill-grey-400 text-grey-400 dark:fill-white-100 dark:text-white-100' />
    </Link>
  )
}

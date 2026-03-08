import { ROUTES } from '@shared/routes'
import { HomeIcon } from '@spotify/ui-react'
import Link from 'next/link'
import React from 'react'

export const HomeBtn = () => {
  return (
    <Link
      className="bg-background-elevated p-3 rounded-full hover:opacity-70 transition-[.3s] h-12 w-12 flex items-center justify-center"
      href={ROUTES.main}
    >
      <HomeIcon className="fill-text text-text" />
    </Link>
  )
}

import { HomeIcon } from '@bitrate/ui-react'
import { ROUTES } from '@shared/routes'
import Link from 'next/link'

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

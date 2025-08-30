import Link from 'next/link'

import { ROUTES } from '@shared/routes'
import { DownloadIcon } from '@shared/ui'

export const DownloadButton = () => (
  <Link
    className='text-xl py-2 px-6 rounded-3xl hover:opacity-70 transition-[1s] text-text font-medium border-solid border-2 flex items-center gap-2'
    href={ROUTES.download}
  >
    <span>Download The App</span>
    <DownloadIcon className='w-[36px] h-[36px] [--fg-color:white] dark:[--fg-color:black] text-black dark:text-white' />
  </Link>
)

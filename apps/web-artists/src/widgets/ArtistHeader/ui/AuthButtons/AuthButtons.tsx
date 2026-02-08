import Link from 'next/link'
import { cn } from '@spotify/ui-react'

export const AuthButtons = () => (
  <div className="flex items-center gap-4">
    <Link
      className={cn(
        'text-sm text-center text-text font-bold',
        'py-1 px-4 h-8',
        'rounded-3xl border-solid border',
        'transform hover:scale-105 transition duration-300 ease-in-out',
      )}
      href={'/login'}
    >
      Log out
    </Link>
    <Link
      className={cn(
        'text-sm text-center bg-white font-bold',
        'py-1 px-4 h-8',
        'rounded-3xl border-solid border',
        'transform hover:scale-105 transition duration-300 ease-in-out',
      )}
      href={'/registration'}
    >
      Get access
    </Link>
  </div>
)

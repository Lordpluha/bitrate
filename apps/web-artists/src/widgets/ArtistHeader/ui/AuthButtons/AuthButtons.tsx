import Link from 'next/link'
import { cn } from '@spotify/ui-react'

interface AuthButtonsProps {
  variant?: 'default' | 'burger'
  className?: string
}

export const AuthButtons = ({ variant = 'default', className }: AuthButtonsProps) => {
  const isBurger = variant === 'burger'
  
  return (
    <div className={cn(
      'flex items-center',
      isBurger ? 'flex-col gap-3 w-full mb-10' : 'flex-row gap-4',
      className
    )}>
      <Link
        className={cn(
          'text-sm text-center text-text font-bold',
          'py-1 px-4',
          'rounded-3xl border-solid border',
          'transform hover:scale-105 transition duration-300 ease-in-out',
          isBurger && 'text-base w-full py-3 px-12 align-middle'
        )}
        href={'/login'}
      >
        Log out
      </Link>
      <Link
        className={cn(
          'text-sm text-center bg-white font-bold',
          'py-1 px-4',
          'rounded-3xl border-solid border',
          'transform hover:scale-105 transition duration-300 ease-in-out',
          isBurger && 'text-base w-full py-3 px-12'
        )}
        href={'/registration'}
      >
        Get access
      </Link>
    </div>
  )
}

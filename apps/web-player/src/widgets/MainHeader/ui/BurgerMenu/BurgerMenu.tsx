'use client'

import { cn } from '@spotify/ui-react'
import { Menu } from 'lucide-react'
import Image from 'next/image'
import { useState } from 'react'
import { useAuth } from '@/shared/hooks'
import { generateColor } from '@/shared/utils'
import { getUserAvatarUrl } from '@/shared/utils/mediaUrl'
import { BurgerMenuPanel } from './BurgerMenuPanel'

type BurgerMenuProps = {
  trigger?: 'avatar' | 'menu'
}

export const BurgerMenu = ({ trigger = 'menu' }: BurgerMenuProps) => {
  const [isOpen, setIsOpen] = useState(false)
  const { isAuthenticated, isLogoutPending, logout, user } = useAuth()
  const username = user?.username || 'User'
  const avatarUrl = user?.avatar ? getUserAvatarUrl(user.avatar) : null

  const closeMenu = () => setIsOpen(false)

  return (
    <>
      <button
        aria-expanded={isOpen}
        aria-haspopup="dialog"
        aria-label={isOpen ? 'Close menu' : 'Open menu'}
        className={cn(
          'text-text transition-opacity hover:opacity-80',
          trigger === 'avatar'
            ? 'flex size-10 shrink-0 items-center justify-center overflow-hidden rounded-full bg-surface p-1'
            : 'p-2',
        )}
        onClick={() => setIsOpen((value) => !value)}
        type="button"
      >
        {trigger === 'avatar' ? (
          avatarUrl ? (
            <Image
              alt={username}
              className="size-full rounded-full object-cover"
              height={36}
              src={avatarUrl}
              unoptimized
              width={36}
            />
          ) : (
            <span
              className="flex size-full items-center justify-center rounded-full text-sm font-bold text-black"
              style={{ backgroundColor: generateColor(username) }}
            >
              {username.charAt(0).toUpperCase()}
            </span>
          )
        ) : (
          <Menu className="h-6 w-6" />
        )}
      </button>

      {isOpen && (
        <button
          aria-hidden="true"
          className="fixed inset-0 z-40 bg-black/50"
          onClick={closeMenu}
          tabIndex={-1}
          type="button"
        />
      )}
      <BurgerMenuPanel
        isAuthenticated={isAuthenticated}
        isLogoutPending={isLogoutPending}
        isOpen={isOpen}
        logout={logout}
        onClose={closeMenu}
        username={user?.username}
      />
    </>
  )
}

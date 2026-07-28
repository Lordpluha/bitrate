'use client'

import { cn } from '@spotify/ui-react'
import { Menu, X } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { useState } from 'react'
import { ThemeSwitcher } from '@/features/SwitchTheme'
import { useAuth } from '@/shared/hooks'
import { ROUTES } from '@/shared/routes'
import { generateColor } from '@/shared/utils'
import { getUserAvatarUrl } from '@/shared/utils/mediaUrl'
import { AuthButtons } from '../AuthButtons'
import { InstallBtn } from '../InstallBtn'
import { NavLinks } from '../NavLinks'

type BurgerMenuProps = {
  trigger?: 'avatar' | 'menu'
}

export const BurgerMenu = ({ trigger = 'menu' }: BurgerMenuProps) => {
  const [isOpen, setIsOpen] = useState(false)
  const { isAuthenticated, isLogoutPending, logout, user } = useAuth()
  const username = user?.username || 'User'
  const avatarUrl = user?.avatar ? getUserAvatarUrl(user.avatar) : null

  const toggleMenu = () => {
    setIsOpen(!isOpen)
  }

  const closeMenu = () => {
    setIsOpen(false)
  }

  return (
    <>
      <button
        aria-label="Toggle menu"
        className={cn(
          'text-text transition-opacity hover:opacity-80',
          trigger === 'avatar'
            ? 'flex size-10 shrink-0 items-center justify-center overflow-hidden rounded-full bg-surface p-1'
            : 'p-2',
        )}
        onClick={toggleMenu}
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
        ) : isOpen ? (
          <X className="h-6 w-6" />
        ) : (
          <Menu className="h-6 w-6" />
        )}
      </button>

      {isOpen && (
        <button
          aria-label="Close menu"
          className="fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={closeMenu}
          type="button"
        />
      )}

      <div
        className={cn(
          'fixed right-0 top-0 z-50 h-dvh w-full max-w-96 transform border-l border-border bg-background-secondary transition-transform duration-300 ease-in-out',
          isOpen ? 'translate-x-0' : 'translate-x-full',
        )}
      >
        <div className="h-full overflow-y-auto p-6 custom-scrollbar">
          <div className="flex justify-between items-center mb-8">
            <div className="min-w-0">
              <h2 className="text-lg font-semibold text-text">Menu</h2>
              {user && (
                <p className="truncate text-sm text-text-subdued">
                  {user.username}
                </p>
              )}
            </div>
            <button
              aria-label="Close menu"
              className="p-2 text-text hover:opacity-70 transition-opacity"
              onClick={closeMenu}
              type="button"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="space-y-6">
            {isAuthenticated ? (
              <>
                <nav className="grid border-b border-border pb-6">
                  <MenuLink href={ROUTES.profile} onClick={closeMenu}>
                    Profile
                  </MenuLink>
                  <MenuLink href={ROUTES.recents} onClick={closeMenu}>
                    Recents
                  </MenuLink>
                  <MenuLink href={ROUTES.settings} onClick={closeMenu}>
                    Settings
                  </MenuLink>
                </nav>
                <div className="flex items-center justify-between border-b border-border pb-6">
                  <span className="text-sm text-text-subdued">Theme</span>
                  <ThemeSwitcher />
                </div>
                <InstallBtn />
                <button
                  className="w-full rounded-full bg-surface px-4 py-2.5 text-sm font-semibold text-text transition-colors hover:bg-surface-hover disabled:opacity-60"
                  disabled={isLogoutPending}
                  onClick={() => logout()}
                  type="button"
                >
                  {isLogoutPending ? 'Logging out...' : 'Log out'}
                </button>
              </>
            ) : (
              <>
                <div className="border-b border-border pb-6">
                  <div className="flex flex-col space-y-4">
                    <NavLinks />
                  </div>
                </div>
                <div className="border-b border-border pb-6">
                  <InstallBtn />
                </div>
                <AuthButtons />
              </>
            )}
          </div>
        </div>
      </div>
    </>
  )
}

type MenuLinkProps = {
  children: string
  href: string
  onClick: () => void
}

const MenuLink = ({ children, href, onClick }: MenuLinkProps) => (
  <Link
    className="rounded px-3 py-3 text-text transition-colors hover:bg-surface"
    href={href}
    onClick={onClick}
  >
    {children}
  </Link>
)

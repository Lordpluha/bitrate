'use client'

import { X } from 'lucide-react'
import Link from 'next/link'
import { ThemeSwitcher } from '@/features/SwitchTheme'
import { useOverlayFocus } from '@/shared/hooks'
import { ROUTES } from '@/shared/routes'
import { AuthButtons } from '../AuthButtons'
import { InstallBtn } from '../InstallBtn'
import { NavLinks } from '../NavLinks'

type BurgerMenuPanelProps = {
  isAuthenticated: boolean
  isLogoutPending: boolean
  isOpen: boolean
  logout: () => void
  onClose: () => void
  username?: string
}

export const BurgerMenuPanel = ({
  isAuthenticated,
  isLogoutPending,
  isOpen,
  logout,
  onClose,
  username,
}: BurgerMenuPanelProps) => {
  const panelRef = useOverlayFocus<HTMLDivElement>({ isOpen, onClose })

  return (
    <div
      aria-hidden={!isOpen}
      aria-label="Navigation menu"
      aria-modal="true"
      className={`fixed right-0 top-0 z-50 h-dvh w-full max-w-96 transform border-l border-border bg-background-secondary transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}
      ref={panelRef}
      role="dialog"
    >
      <div className="h-full overflow-y-auto p-6 custom-scrollbar">
        <div className="mb-8 flex items-center justify-between">
          <div className="min-w-0">
            <h2 className="text-lg font-semibold text-text">Menu</h2>
            {username && (
              <p className="truncate text-sm text-text-subdued">{username}</p>
            )}
          </div>
          <button
            aria-label="Close menu"
            className="p-2 text-text transition-opacity hover:opacity-70"
            onClick={onClose}
            type="button"
          >
            <X aria-hidden="true" className="size-5" />
          </button>
        </div>
        <div className="space-y-6">
          {isAuthenticated ? (
            <>
              <nav className="grid border-b border-border pb-6">
                <MenuLink href={ROUTES.profile} onClick={onClose}>
                  Profile
                </MenuLink>
                <MenuLink href={ROUTES.recents} onClick={onClose}>
                  Recents
                </MenuLink>
                <MenuLink href={ROUTES.settings} onClick={onClose}>
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
                onClick={logout}
                type="button"
              >
                {isLogoutPending ? 'Logging out...' : 'Log out'}
              </button>
            </>
          ) : (
            <>
              <div className="border-b border-border pb-6">
                <NavLinks />
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
  )
}

const MenuLink = ({
  children,
  href,
  onClick,
}: {
  children: string
  href: string
  onClick: () => void
}) => (
  <Link
    className="rounded px-3 py-3 text-text transition-colors hover:bg-surface"
    href={href}
    onClick={onClick}
  >
    {children}
  </Link>
)

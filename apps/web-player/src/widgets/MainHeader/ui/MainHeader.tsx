'use client'

import { MembersIcon } from '@bitrate/ui-react'
import { ThemeSwitcher } from '@features/SwitchTheme'
import { useAuth } from '@shared/hooks'
import { ROUTES } from '@shared/routes'
import { Logo } from '@shared/ui'
import Link from 'next/link'
import { AuthButtons } from './AuthButtons'
import { HeaderSearch } from './HeaderSearch'
import { HomeBtn } from './HomeBtn'
import { InstallBtn } from './InstallBtn'
import { MobileMainHeader } from './MobileMainHeader'
import { NavLinks } from './NavLinks'
import { NotificationsPopover } from './NotificationsPopover'
import { ProfileButton } from './ProfileButton'

type MainHeaderProps = {
  onCreate?: () => void
}

export const MainHeader = ({ onCreate }: MainHeaderProps) => {
  const { user, isAuthenticated, isLoading } = useAuth()

  return (
    <header className="sticky left-0 right-0 top-0 z-50 h-16 bg-background transition-colors duration-300">
      <div className="relative flex h-full w-full items-center justify-between px-4 sm:px-5">
        <div className="hidden w-full items-center justify-between xl:flex">
          <Logo href={ROUTES.main} />

          <div className="flex items-center space-x-4">
            <HomeBtn />
            <HeaderSearch />
          </div>

          <div className="flex items-center gap-8">
            <InstallBtn />

            {isLoading ? (
              <div className="h-8 w-8" />
            ) : isAuthenticated && user ? (
              <>
                <NotificationsPopover />
                <Link
                  className="transition-opacity duration-200 hover:opacity-70"
                  href="#"
                >
                  <MembersIcon />
                </Link>
                <ProfileButton
                  avatar={user.avatar}
                  username={user.username || 'User'}
                />
                <ThemeSwitcher />
              </>
            ) : (
              <>
                <NavLinks />
                <AuthButtons />
              </>
            )}
          </div>
        </div>

        <div className="h-full w-full xl:hidden">
          <MobileMainHeader onCreate={onCreate} />
        </div>
      </div>
    </header>
  )
}

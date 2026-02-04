'use client'

import React from 'react'
import { HomeBtn } from './HomeBtn'
import { HeaderSearch } from './HeaderSearch'
import { NavLinks } from './NavLinks'
import { AuthButtons } from './AuthButtons'
import { InstallBtn } from './InstallBtn'
import { BurgerMenu } from './BurgerMenu'
import Link from 'next/link'
import { ProfileButton } from './ProfileButton'
import { useAuth } from '@shared/hooks'
import { Logo } from '@shared/ui'

import { MembersIcon, NotificationIcon } from '@spotify/ui-react'

export const MainHeader = () => {
  const { user, isAuthenticated, isLoading } = useAuth()

  return (
    <header className="sticky top-0 left-0 right-0 z-50 transition-colors duration-300">
      <div className="w-full px-5 py-2 flex justify-between items-center relative">
        <Logo />

        <div className="hidden xl:flex items-center space-x-4">
          <HomeBtn />
          <HeaderSearch />
        </div>

        <div className="hidden xl:flex items-center gap-8">
          <InstallBtn />

          {isLoading ? (
            <div className="w-8 h-8"></div>
          ) : isAuthenticated && user ? (
            <>
              <Link
                className="hover:opacity-70 transition-opacity duration-200"
                href="#"
              >
                <NotificationIcon />
              </Link>
              <Link
                className="hover:opacity-70 transition-opacity duration-200"
                href="#"
              >
                <MembersIcon />
              </Link>
              <ProfileButton username={user.username || 'User'} />
              {/* пока оставляем */}
            </>
          ) : (
            <>
              <NavLinks />
              <AuthButtons />
            </>
          )}
        </div>

        <div className="xl:hidden">
          <BurgerMenu />
        </div>
      </div>
    </header>
  )
}

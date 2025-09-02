import { Logo } from '@shared/ui'
import React from 'react'
import { HomeBtn } from './HomeBtn'
import { HeaderSearch } from './HeaderSearch'
import { NavLinks } from './NavLinks'
import { AuthButtons } from './AuthButtons'
import { InstallBtn } from './InstallBtn'
import { BurgerMenu } from './BurgerMenu'
import { ROUTES } from '@shared/routes'

export const MainHeader = () => {
  return (
    <header className='sticky top-0 left-0 right-0 z-50 transition-colors duration-300'>
      <div className='w-full px-5 py-2 flex justify-between items-center relative'>
        <Logo linkProps={{ href: ROUTES.main }} />

        <div className='hidden xl:flex items-center space-x-4'>
          <HomeBtn />
          <HeaderSearch />
        </div>

        <div className='hidden xl:flex items-center gap-8'>
          <NavLinks />
          <InstallBtn />
          <AuthButtons />
        </div>

        <div className='xl:hidden'>
          <BurgerMenu />
        </div>
      </div>
    </header>
  )
}

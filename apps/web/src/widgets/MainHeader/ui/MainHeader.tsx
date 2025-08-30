import { Logo } from '@shared/ui'
import React from 'react'
import { HomeBtn } from './HomeBtn'
import { HeaderSearch } from './HeaderSearch'
import { NavLinks } from './NavLinks'
import { AuthButtons } from './AuthButtons'
import { InstallBtn } from './InstallBtn'
import { ROUTES } from '@shared/routes'

export const MainHeader = () => {
  return (
    <header className='sticky top-0 left-0 right-0 z-50 transition-colors duration-300'>
      <div className='container py-2 flex justify-between items-center relative'>
        <Logo linkProps={{ href: ROUTES.main }} />
        <div className='flex items-center space-x-4'>
          <HomeBtn />
          <HeaderSearch />
        </div>
        <div className='flex items-center space-x-8'>
          <NavLinks />
          <InstallBtn />
          <AuthButtons />
        </div>
      </div>
    </header>
  )
}

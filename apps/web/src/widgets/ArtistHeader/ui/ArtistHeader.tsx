'use client'

import { ArtistLogo } from '@shared/ui'

import { NavLinks } from './NavLink/NavLink'
import { AuthButtons } from './AuthButtons/AuthButtons'
import { SwitchLanguagesButton } from './SwitchLanguagesButton/SwitchLanguagesButton'

export const ArtistHeader = () => {
  return (
    <header className=" bg-black">
      <div className="container flex items-center justify-between px-8 py-4.5">
        <ArtistLogo />

        <section className="">
          <NavLinks />
        </section>

        <section className='flex items-center gap-2'>
          <SwitchLanguagesButton />
          <AuthButtons />
        </section>
      </div>
    </header>
  )
}

'use client'

import { useEffect, useState } from 'react'
import { Menu, X } from 'lucide-react'
import { cn } from '@spotify/ui-react'
import { ArtistLogo } from '@shared/ui'
import { NavLinks } from '../NavLink/NavLink'
import { AuthButtons } from '../AuthButtons/AuthButtons'
import { SwitchLanguagesButton } from '../../../../shared/ui/SwitchLanguages/SwitchLanguagesButton/SwitchLanguagesButton'
import { MobileSubMenu } from './MobileSubMenu'
import links from '../../config/nav-links.json'

export const BurgerMenu = () => {
  const [isOpen, setIsOpen] = useState(false)
  const [activeSubmenu, setActiveSubmenu] = useState<string | null>(null)

  const toggleMenu = () => setIsOpen(!isOpen)
  const closeMenu = () => {
    setIsOpen(false)
    setActiveSubmenu(null)
  }

  const handleSubmenuOpen = (title: string) => {
    setActiveSubmenu(title)
  }

  const handleSubmenuClose = () => {
    setActiveSubmenu(null)
  }

  const activeLink = links.find((link) => link.title === activeSubmenu)
  const submenuData = activeLink?.submenu || activeLink?.resources || null
  const submenuType = activeLink?.submenu ? 'features' : 'resources'

  useEffect(() => {
    document.body.style.overflow = isOpen || activeSubmenu ? 'hidden' : ''
    return () => {
      document.body.style.overflow = ''
    }
  }, [isOpen, activeSubmenu])

  return (
    <>
      <button
        onClick={toggleMenu}
        className=" text-white hover:opacity-70 transition-opacity relative"
        aria-label="Toggle menu"
      >
        <div className="w-8 h-8 flex items-center justify-center">
          {isOpen ? <X className="w-8 h-8" /> : <Menu className="w-8 h-8" />}
        </div>
      </button>

      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={closeMenu}
        />
      )}

      <div
        className={cn(
          'fixed top-0 right-0 h-full w-full bg-black z-1050 transform transition-transform duration-300 ease-in-out',
          isOpen ? 'translate-x-0' : 'translate-x-full',
        )}
      >
        <div className={cn("p-6 h-full flex flex-col", 'max-sm:p-4')}>
          <div className="flex justify-between items-center mb-8">
            <ArtistLogo />
            <button
              onClick={closeMenu}
              className="text-white hover:opacity-70 transition-opacity"
            >
              <div className="w-8 h-8 flex items-center justify-center">
                <X className="w-8 h-8" />
              </div>
            </button>
          </div>

          <div className="flex flex-col gap-4 h-full justify-between">
            <div className="pb-6">
              <div className="flex flex-col mb-6">
                <NavLinks 
                  variant="mobile" 
                  onLinkClick={closeMenu}
                  onSubmenuClick={handleSubmenuOpen}
                />
              </div>
              <div className='flex items-center gap-2'>
                <SwitchLanguagesButton />
                <span>
                  <p className='text-white text-base font-[700]'>English</p>
                </span>
              </div>
            </div>

            <AuthButtons variant="burger" />
          </div>
        </div>
      </div>

      <MobileSubMenu
        isOpen={!!activeSubmenu}
        title={activeSubmenu || ''}
        data={submenuData}
        type={submenuType as 'features' | 'resources'}
        onClose={handleSubmenuClose}
        onFullClose={closeMenu}
      />
    </>
  )
}

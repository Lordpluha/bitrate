'use client'

import { cn } from '@bitrate/ui-react'
import { ArtistLogo } from '@shared/ui'
import { Menu, X } from 'lucide-react'
import { useEffect, useState } from 'react'
import { SwitchLanguagesButton } from '../../../../shared/ui/SwitchLanguages/SwitchLanguagesButton/SwitchLanguagesButton'
import links from '../../config/nav-links.json'
import { AuthButtons } from '../AuthButtons/AuthButtons'
import { NavLinks } from '../NavLink/NavLink'
import { MobileSubMenu } from './MobileSubMenu'

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
        aria-label="Toggle menu"
        className=" text-white hover:opacity-70 transition-opacity relative"
        onClick={toggleMenu}
        type="button"
      >
        <div className="w-8 h-8 flex items-center justify-center">
          {isOpen ? <X className="w-8 h-8" /> : <Menu className="w-8 h-8" />}
        </div>
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
          'fixed top-0 right-0 h-full w-full bg-black z-1050 transform transition-transform duration-300 ease-in-out',
          isOpen ? 'translate-x-0' : 'translate-x-full',
        )}
      >
        <div className={cn('p-6 h-full flex flex-col', 'max-sm:p-4')}>
          <div className="flex justify-between items-center mb-8">
            <ArtistLogo />
            <button
              className="text-white hover:opacity-70 transition-opacity"
              onClick={closeMenu}
              type="button"
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
                  onLinkClick={closeMenu}
                  onSubmenuClick={handleSubmenuOpen}
                  variant="mobile"
                />
              </div>
              <div className="flex items-center gap-2">
                <SwitchLanguagesButton />
                <span>
                  <p className="text-white text-base font-bold">English</p>
                </span>
              </div>
            </div>

            <AuthButtons variant="burger" />
          </div>
        </div>
      </div>

      <MobileSubMenu
        data={submenuData}
        isOpen={!!activeSubmenu}
        onClose={handleSubmenuClose}
        onFullClose={closeMenu}
        title={activeSubmenu || ''}
        type={submenuType as 'features' | 'resources'}
      />
    </>
  )
}

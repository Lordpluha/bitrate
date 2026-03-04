'use client'

import { ArtistLogo } from '@shared/ui'
import React from 'react'
import links from '../config/nav-links.json'
import { AuthButtons } from './AuthButtons/AuthButtons'
import { NavLinks } from './NavLink/NavLink'
import { SubMenuContent } from './SubMenuContent/SubMenuContent'
import { SwitchLanguagesButton } from './SwitchLanguagesButton/SwitchLanguagesButton'

interface LinkItem {
  title: string
  href: string
  submenu?: Array<{
    title: string
    sections?: Array<{
      title: string
      href: string
    }>
  }>
  resources?: Array<{
    id: string
    title: string
    description: string
    imageSrc: string
    href: string
  }>
}

export const ArtistHeader = () => {
  const [activeSubmenu, setActiveSubmenu] = React.useState<string | null>(null)
  const [isClosing, setIsClosing] = React.useState(false)
  const timeoutRef = React.useRef<NodeJS.Timeout | null>(null)

  const typedLinks = links as LinkItem[]
  const activeLink = typedLinks.find((link) => link.title === activeSubmenu)

  const submenuData = activeLink?.submenu || activeLink?.resources || null
  const submenuType = activeLink?.submenu ? 'features' : 'resources'

  const clearTimer = React.useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
      timeoutRef.current = null
    }
  }, [])

  const handleSetActiveSubmenu = React.useCallback(
    (value: string | null) => {
      clearTimer()
      setIsClosing(false)
      setActiveSubmenu(value)
    },
    [clearTimer],
  )

  const handleCloseSubmenu = React.useCallback(() => {
    if (!activeSubmenu || isClosing) return

    clearTimer()
    setIsClosing(true)
    timeoutRef.current = setTimeout(() => {
      setActiveSubmenu(null)
      setIsClosing(false)
    }, 300)
  }, [activeSubmenu, isClosing, clearTimer])

  const handleMenuEnter = React.useCallback(() => {
    clearTimer()
    setIsClosing(false)
  }, [clearTimer])

  React.useEffect(() => {
    return () => clearTimer()
  }, [clearTimer])

  return (
    <>
      {/** biome-ignore lint/a11y/noStaticElementInteractions: header hover state controls submenu visibility */}
      <header
        className="fixed top-0 left-0 right-0 bg-black z-1052"
        onMouseEnter={handleMenuEnter}
        onMouseLeave={handleCloseSubmenu}
      >
        <div className="container flex items-center justify-between px-8 py-4.5 relative">
          <ArtistLogo />

          <NavLinks
            activeSubmenu={activeSubmenu}
            closeSubmenu={handleCloseSubmenu}
            setActiveSubmenu={handleSetActiveSubmenu}
          />

          <section className="flex items-center gap-2">
            <SwitchLanguagesButton />
            <AuthButtons />
          </section>
        </div>
      </header>

      <SubMenuContent
        activeSubmenu={activeSubmenu}
        isClosing={isClosing}
        onMouseEnter={handleMenuEnter}
        onMouseLeave={handleCloseSubmenu}
        submenuData={submenuData}
        type={submenuType as 'features' | 'resources'}
      />
    </>
  )
}

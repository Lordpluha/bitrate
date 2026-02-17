'use client'

import { useState, useCallback, useRef, useEffect, useMemo, type ReactNode } from 'react'
import { ArtistLogo, SwitchLanguagesButton } from '@shared/ui'
import { cn } from '@spotify/ui-react'

import { NavLinks } from './NavLink/NavLink'
import { AuthButtons } from './AuthButtons/AuthButtons'
import { BurgerMenu } from './BurgerMenu/BurgerMenu'
import { SubMenuContent } from './SubMenuContent/SubMenuContent'
import { SubmenuProvider } from '../model/SubmenuContext'
import links from '../config/nav-links.json'

interface ArtistHeaderProps {
  children?: ReactNode
}

export const ArtistHeader = ({ children }: ArtistHeaderProps) => {

  const [activeSubmenu, setActiveSubmenu] = useState<string | null>(null);
  const [isClosing, setIsClosing] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const rafRef = useRef<number | null>(null);

  const activeLink = links.find((link) => link.title === activeSubmenu);

  const submenuData = activeLink?.submenu || activeLink?.resources || null;
  const submenuType = activeLink?.submenu ? 'features' : 'resources';

  const clearTimer = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  }, [])

  const handleSetActiveSubmenu = useCallback(
    (value: string | null) => {
      clearTimer();
      setIsClosing(false);
      setActiveSubmenu(value);
    },
    [clearTimer],
  )

  const handleCloseSubmenu = useCallback(() => {
    if (!activeSubmenu || isClosing) return

    clearTimer();
    setIsClosing(true);
    timeoutRef.current = setTimeout(() => {
      setActiveSubmenu(null);
      setIsClosing(false);
    }, 300)
  }, [activeSubmenu, isClosing, clearTimer])

  const handleMenuEnter = useCallback(() => {
    clearTimer();
    setIsClosing(false);
  }, [clearTimer])

  useEffect(() => {
    return () => clearTimer();
  }, [clearTimer])

  useEffect(() => {
    if (typeof window === 'undefined') return

    const threshold = 10;

    const onScroll = () => {
      if (rafRef.current !== null) return

      rafRef.current = requestAnimationFrame(() => {
        const y = window.scrollY || window.pageYOffset;
        setIsScrolled(y > threshold);
        if (rafRef.current) {
          window.cancelAnimationFrame(rafRef.current);
          rafRef.current = null;
        }
      })
    }

    onScroll();
    window.addEventListener('scroll', onScroll)

    return () => {
      window.removeEventListener('scroll', onScroll);
      if (rafRef.current) {
        window.cancelAnimationFrame(rafRef.current);
      }
    }
  }, []);

  const headerIsDark = useMemo(() => {
    return Boolean(isScrolled || (activeSubmenu && submenuData) || isClosing);
  }, [isScrolled, activeSubmenu, submenuData, isClosing]);

  return (
    <SubmenuProvider activeSubmenu={activeSubmenu} isClosing={isClosing}>
      <header
        className={
          cn("fixed top-0 left-0 right-0 z-1052",
            'transition-colors duration-400 ease-out',
            headerIsDark ? 'bg-black' : 'bg-transparent')}
        onMouseEnter={handleMenuEnter}
        onMouseLeave={handleCloseSubmenu}
      >
        <div className="container flex items-center justify-between px-8 py-4.5 relative">
          <ArtistLogo />

          <NavLinks
            className='hidden lg:flex'
            activeSubmenu={activeSubmenu}
            setActiveSubmenu={handleSetActiveSubmenu}
            closeSubmenu={handleCloseSubmenu}
          />

          <section className="hidden lg:flex items-center gap-2">
            <SwitchLanguagesButton className=' transform hover:scale-110 transition duration-300 ease-in-out'/>
            <AuthButtons />
          </section>

          <div className='lg:hidden'>
            <BurgerMenu />
          </div>
        </div>
      </header>

      <SubMenuContent
        activeSubmenu={activeSubmenu}
        submenuData={submenuData}
        type={submenuType as 'features' | 'resources'}
        isClosing={isClosing}
        onMouseEnter={handleMenuEnter}
        onMouseLeave={handleCloseSubmenu}
      />

      {children}
    </SubmenuProvider>
  )
}

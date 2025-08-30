'use client'

import { useEffect, useState } from 'react'

import { ThemeSwitcher } from '@features/SwitchTheme'
import { Logo } from '@shared/ui'
import clsx from 'clsx'
import { AlignJustify, X } from 'lucide-react'

import { AuthButtons } from './AuthButtons/AuthButtons'
import { NavLinks } from './NavLink/NavLinks'

import styles from './Header.module.scss'

export const Header = () => {
  const [isScrolled, setIsScrolled] = useState(false)
  const [isNav, setIsNavActive] = useState(false)

  useEffect(() => {
    const onScroll = () => setIsScrolled(window.scrollY > 0)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const onNavToggle = () => setIsNavActive(prev => !prev)
  const onCloseNav = () => setIsNavActive(false)

  return (
    <header
      className={clsx(styles.header, isScrolled && styles['header--scrolled'])}
    >
      <div className={clsx(styles.inner, 'container')}>
        <Logo />
        <nav className={styles.nav}>
          <ul
            className={clsx(
              styles.nav__list,
              styles['mobile-layout'],
              styles['mobile--flex'],
              isNav && styles['mobile--active']
            )}
            onClick={onCloseNav}
          >
            <NavLinks />
            <ThemeSwitcher />
            <AuthButtons />
          </ul>
          <div
            onClick={onNavToggle}
            className={styles.burger}
          >
            {isNav ? <X size={40} /> : <AlignJustify size={40} />}
          </div>
        </nav>
      </div>
    </header>
  )
}

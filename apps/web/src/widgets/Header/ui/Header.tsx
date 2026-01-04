'use client';

import { ThemeSwitcher } from '@features/SwitchTheme';
import { Logo } from '@shared/ui';
import { AlignJustify, cn, X } from '@spotify/ui-react';
import { useEffect, useState } from 'react';

import { AuthButtons } from './AuthButtons/AuthButtons';
import { NavLinks } from './NavLink/NavLinks';

export const Header = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isNav, setIsNavActive] = useState(false);

  useEffect(() => {
    const onScroll = () => setIsScrolled(window.scrollY > 0);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const onNavToggle = () => setIsNavActive((prev) => !prev);
  const onCloseNav = () => setIsNavActive(false);

  return (
    <header
      className={cn(
        'sticky top-0 left-0 right-0 z-50 transition-colors duration-300',
        isScrolled &&
          'backdrop-blur border-b border-[color:var(--color-text)]/10',
        isScrolled && 'bg-[color:var(--color-bg-secondary)]',
      )}
    >
      <div className="px-8 py-8 flex justify-between items-center relative container">
        <Logo />
        <nav className="flex items-center gap-16">
          <ul
            className={cn(
              'flex items-center gap-16 transition-all duration-300',
              'max-lg:fixed max-lg:top-0 max-lg:right-0 max-lg:bottom-0 max-lg:h-screen max-lg:w-full max-lg:z-10',
              'max-lg:bg-[color:var(--color-bg)] max-lg:flex-col max-lg:justify-center',
              isNav ? 'max-lg:left-0' : 'max-lg:left-[-100%]',
            )}
            onClick={onCloseNav}
            onKeyDown={(e) => e.key === 'Escape' && onCloseNav()}
          >
            <NavLinks />
            <ThemeSwitcher />
            <AuthButtons />
          </ul>
          <button
            type="button"
            className="text-(--color-text) hidden max-lg:block absolute z-20 right-8 top-8 cursor-pointer"
            onClick={onNavToggle}
          >
            {isNav ? <X size={40} /> : <AlignJustify size={40} />}
          </button>
        </nav>
      </div>
    </header>
  );
};

import { cn, ArrowrightIcon } from '@spotify/ui-react'
import Link from 'next/link'
import links from '../../config/nav-links.json'

import '../SubMenuContent/submenu-animation.css'

interface LinkItem {
  title: string
  href?: string
  submenu?: Array<{
    title: string
    sections?: Array<{
      title: string
      href: string
    }>
  }>
  resources?: Array<{
    title: string
    sections?: Array<{
      id: string
      title: string
      description: string
      imageSrc: string
      href: string
    }>
  }>
}

interface NavLinksProps {
  variant?: 'desktop' | 'mobile'
  className?: string
  activeSubmenu?: string | null
  setActiveSubmenu?: (value: string | null) => void
  closeSubmenu?: () => void
  onLinkClick?: () => void
  onSubmenuClick?: (title: string) => void
}

export const NavLinks = ({
  variant = 'desktop',
  className,
  activeSubmenu,
  setActiveSubmenu,
  closeSubmenu,
  onLinkClick,
  onSubmenuClick,
}: NavLinksProps) => {
  const typedLinks = links as LinkItem[]
  const isMobile = variant === 'mobile'

  const handleMouseEnter = (link: LinkItem) => {
    if (isMobile) return;
    
    if (link.submenu || link.resources) {
      if (activeSubmenu !== link.title) {
        setActiveSubmenu?.(link.title)
      }
    } else {
      if (activeSubmenu) {
        closeSubmenu?.()
      }
    }
  }

  const handleClick = (link: LinkItem) => {
    if (isMobile) {
      const hasSubmenu = Boolean(link.submenu || link.resources)
      if (hasSubmenu && onSubmenuClick) {
        onSubmenuClick(link.title)
      } else if (onLinkClick) {
        onLinkClick()
      }
    }
  }

  return (
    <nav className={cn(
      'flex items-center',
      isMobile ? 'flex-col gap-4' : 'flex-row gap-8',
      className
    )}>
      {typedLinks.map((link) => {
          const isActive = activeSubmenu === link.title
          const hasSubmenu = Boolean(link.submenu || link.resources)
          
          const linkClassName = cn(
            'text-white font-bold',
            !isMobile && 'link-underline',
            !isMobile && isActive && 'before:scale-x-100',
            isMobile && 'text-6xl w-full text-left hover:opacity-70 transition-opacity',
            isMobile && 'max-sm:text-4xl',
            isMobile && hasSubmenu && 'flex items-center justify-between'
          )

          if (link.href && !hasSubmenu) {
            return (
              <Link
                key={link.title}
                href={link.href}
                className={linkClassName}
                onMouseEnter={() => handleMouseEnter(link)}
                onClick={() => handleClick(link)}
              >
                {link.title}
              </Link>
            )
          }

          return (
            <button
              className={linkClassName}
              type='button'
              key={link.title}
              onMouseEnter={() => handleMouseEnter(link)}
              onClick={() => handleClick(link)}
            >
              {link.title}
              {isMobile && hasSubmenu && (
                <ArrowrightIcon className="w-7 h-7 shrink-0" />
              )}
            </button>
          )
        })}
    </nav>
  )
}

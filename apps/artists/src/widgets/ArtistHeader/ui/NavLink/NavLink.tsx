import { cn } from '@spotify/ui-react'
import Link from 'next/link'
import links from '../../config/nav-links.json'

const linkUnderlineClasses = cn(
  'text-base text-white font-bold',
  'relative inline-block',
  'before:content-[""]',
  'before:absolute before:left-0 before:-bottom-px',
  'before:h-0.5 before:w-full before:bg-white',
  'before:origin-left before:scale-x-0',
  'before:transition-transform before:duration-300 before:ease-in-out',
  'hover:before:scale-x-100',
)

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

interface NavLinksProps {
  activeSubmenu: string | null
  setActiveSubmenu: (value: string | null) => void
  closeSubmenu: () => void
}

export const NavLinks = ({ activeSubmenu, setActiveSubmenu, closeSubmenu }: NavLinksProps) => {
  const typedLinks = links as LinkItem[]

  const handleMouseEnter = (link: LinkItem) => {
    if (link.submenu || link.resources) {
      if (activeSubmenu !== link.title) {
        setActiveSubmenu(link.title)
      }
    } else {
      if (activeSubmenu) {
        closeSubmenu()
      }
    }
  }

  return (
    <section>
      <nav className="flex items-center gap-8">
        {typedLinks.map((link) => {
          const isActive = activeSubmenu === link.title
          return (
            <Link
              className={cn(
                linkUnderlineClasses,
                isActive && 'before:scale-x-100'
              )}
              href={link.href}
              key={link.title}
              onMouseEnter={() => handleMouseEnter(link)}
            >
              {link.title}
            </Link>
          )
        })}
      </nav>
    </section>
  )
}
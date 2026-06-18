import { cn } from '@spotify/ui-react'
import Link from 'next/link'
import links from '../../config/nav-links.json'

export const NavLinks = () => (
  <>
    {links.map((link) => (
      <Link
        className={cn(
          'text-base relative transition-all duration-300 hover:opacity-70',
        )}
        href={link.href}
        key={link.title}
      >
        {link.title}
      </Link>
    ))}
  </>
)

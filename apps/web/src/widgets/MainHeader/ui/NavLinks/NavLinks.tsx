import Link from 'next/link'
import { cn } from '@spotify/ui-react'
import links from '../../config/nav-links.json'

export const NavLinks = () => (
  <>
    {links.map((link) => (
      <Link
        key={link.title}
        className={cn(
          'text-base relative transition-all duration-300 hover:opacity-70',
        )}
        href={link.href}
      >
        {link.title}
      </Link>
    ))}
  </>
)

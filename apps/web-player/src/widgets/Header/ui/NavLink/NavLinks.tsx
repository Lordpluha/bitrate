import { NAV_LINKS } from '@widgets/Header/config/nav-links'
import Link from 'next/link'

export const NavLinks = () => (
  <>
    {NAV_LINKS.map((link) => (
      <Link
        className={
          'text-xl hover:opacity-70 transition-[0.3s] relative transition-all'
        }
        href={link.href}
        key={link.title}
      >
        {link.title}
      </Link>
    ))}
  </>
)

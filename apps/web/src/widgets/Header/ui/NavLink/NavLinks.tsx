import Link from 'next/link'

import links from '../../config/nav-links.json'

export const NavLinks = () => (
  <>
    {links.map(link => (
      <Link
        key={link.title}
        className={'text-xl hover:opacity-70 transition-[0.3s] relative transition-all'}
        href={link.href}
      >
        {link.title}
      </Link>
    ))}
  </>
)

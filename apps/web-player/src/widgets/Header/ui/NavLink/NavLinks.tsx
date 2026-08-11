import links from '@widgets/Header/config/nav-links.json'
import Link from 'next/link'

export const NavLinks = () => (
  <>
    {links.map((link) => (
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

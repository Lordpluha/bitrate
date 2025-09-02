import Link from 'next/link'
import styles from './NavLink.module.scss'
import links from '../../config/nav-links.json'

interface NavLinksProps {
  isMobile?: boolean
}

export const NavLinks = ({ isMobile = false }: NavLinksProps) => (
  <>
    {links.map(link => (
      <Link
        key={link.title}
        className={isMobile
          ? 'text-white text-base hover:opacity-70 transition-all py-2 block'
          : styles.nav__link
        }
        href={link.href}
      >
        {link.title}
      </Link>
    ))}
  </>
)

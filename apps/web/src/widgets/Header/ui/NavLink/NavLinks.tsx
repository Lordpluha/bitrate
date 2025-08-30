import Link from 'next/link'

import links from '../../config/nav-links.json'

import styles from './NavLink.module.scss'

export const NavLinks = () => (
  <>
    {links.map(link => (
      <Link
        key={link.title}
        className={styles.nav__link}
        href={link.href}
      >
        {link.title}
      </Link>
    ))}
  </>
)

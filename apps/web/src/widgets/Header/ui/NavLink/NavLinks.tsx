import Link from 'next/link'
import styles from './NavLink.module.scss'
import links from '../../config/nav-links.json'

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

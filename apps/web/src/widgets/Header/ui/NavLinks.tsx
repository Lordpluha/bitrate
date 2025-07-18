import Link from 'next/link';
import styles from './NavLink.module.scss'

export const NavLinks = () => (
  <>
    <Link className={styles.nav__link} href="#">
      Premium
    </Link>
    <Link className={styles.nav__link} href="#">
      Support
    </Link>
    <Link className={styles.nav__link} href="#">
      Download
    </Link>
  </>
);

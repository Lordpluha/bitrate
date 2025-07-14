import styles from './NavLink.module.scss'

export const NavLinks = () => (
  <>
    <a className={styles.nav__link} href="#">
      Premium
    </a>
    <a className={styles.nav__link} href="#">
      Support
    </a>
    <a className={styles.nav__link} href="#">
      Download
    </a>
  </>
);

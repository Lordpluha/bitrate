import Link from 'next/link';

import links from '../../config/nav-links.json';

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
);

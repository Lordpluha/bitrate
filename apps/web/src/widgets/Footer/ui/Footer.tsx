import { FacebookIcon, InstIcon, Logo, TwitIcon } from '@shared/ui';

import Link from 'next/link';
import type { FC, HTMLAttributes } from 'react';

import footerLinks from '../config/footer-links.json';

export type FooterProps = HTMLAttributes<HTMLDivElement>;

type FooterColumn = {
  title: string;
  links: { label: string; href: string }[];
};

type SocialLink = {
  icon: string;
  alt: string;
  href: string;
};

const iconMap = {
  InstIcon,
  TwitIcon,
  FacebookIcon,
};

export const Footer: FC<FooterProps> = (props) => {
  const columns: FooterColumn[] = footerLinks.columns;
  const socials: SocialLink[] = footerLinks.socials;

  return (
    <footer {...props}>
      <div className="bg-bgSecondary py-20">
        <div className="container">
          <div className="grid grid-cols-[1fr_3fr_1fr] items-start max-md:grid-cols-1 max-md:gap-8 max-md:py-10">
            <div className="flex items-center justify-start">
              <Logo />
            </div>
            <div className="grid gap-5 grid-cols-3 max-sm:grid-cols-1">
              {columns.map((col) => (
                <div key={col.title}>
                  <ul className="flex flex-col items-start gap-2 text-lg">
                    {col.links.map(({ label, href }) => (
                      <li key={href}>
                        <Link
                          className="transition-[0.3s] hover:opacity-70"
                          href={href}
                        >
                          {label}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>

            <div className="flex items-center justify-end gap-12 max-sm:justify-start">
              {socials.map((social, _i) => {
                const _IconComponent =
                  iconMap[social.icon as keyof typeof iconMap];
                return (
                  <Link
                    className="transition-[0.3s] hover:opacity-70"
                    href={social.href}
                    key={social.href}
                  >
                    {/* <IconComponent className='text-text fill-text' /> */}
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

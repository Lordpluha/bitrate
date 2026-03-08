import Link from 'next/link'

import { FacebookIcon, InstIcon, TwitIcon } from '@spotify/ui-react'

const sections = [
  {
    title: 'Company',
    links: ['About', 'Jobs', 'For the Record'],
  },
  {
    title: 'Communities',
    links: ['For Artists', 'Developers', 'Advertising', 'Investors', 'Vendors'],
  },
  {
    title: 'Useful links',
    links: [
      'Support',
      'Free Mobile App',
      'Popular by Country',
      'Import your music',
    ],
  },
  {
    title: 'Spotify Plans',
    links: [
      'Premium Individual',
      'Premium Duo',
      'Premium Family',
      'Premium Student',
      'Spotify Free',
    ],
  },
]

const bottomLinks = [
  'Legal',
  'Safety & Privacy Center',
  'Privacy Policy',
  'Cookies',
  'About Ads',
  'Accessibility',
]

function Footer() {
  return (
    <footer className="mt-16 pt-16 pb-8">
      <div className="grid grid-cols-5 gap-8 mb-8">
        {sections.map((section) => (
          <div key={section.title}>
            <h3 className="text-text font-semibold text-base mb-4">
              {section.title}
            </h3>
            <ul className="space-y-3">
              {section.links.map((link) => (
                <li key={link}>
                  <Link
                    href="#"
                    className="text-text-subdued hover:text-text text-sm transition-[0.3s]"
                  >
                    {link}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
        <div className="flex justify-end mb-8">
          <div className="flex items-start space-x-4">
            <Link
              href="#"
              className="w-10 h-10 bg-surface hover:opacity-[0.7] rounded-full flex items-center justify-center transition-[0.3s]"
            >
              <FacebookIcon width={50} height={50} />
            </Link>
            <Link
              href="#"
              className="w-10 h-10 bg-surface hover:opacity-[0.7] rounded-full flex items-center justify-center transition-[0.3s]"
            >
              <TwitIcon width={50} height={50} />
            </Link>
            <Link
              href="#"
              className="w-10 h-10 bg-surface hover:opacity-[0.7] rounded-full flex items-center justify-center transition-[0.3s]"
            >
              <InstIcon width={50} height={50} />
            </Link>
          </div>
        </div>
      </div>
      <div className="flex flex-wrap items-center justify-between pt-8 border-t border-border">
        <div className="flex flex-wrap items-center space-x-6 text-xs text-text-subdued mb-4 md:mb-0">
          {bottomLinks.map((link) => (
            <Link
              key={link}
              href="#"
              className="hover:text-text transition-[0.3s]"
            >
              {link}
            </Link>
          ))}
        </div>
        <div className="text-xs text-text-subdued">© 2025 Spotify AB</div>
      </div>
    </footer>
  )
}

export { Footer }

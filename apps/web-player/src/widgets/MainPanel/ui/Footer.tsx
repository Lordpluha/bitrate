import { Facebook, InstIcon, TwitIcon } from '@spotify/ui-react'
import Link from 'next/link'

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
    <footer className="mt-12 pb-8 pt-12 sm:mt-16 sm:pt-16">
      <div className="mb-8 grid grid-cols-2 gap-8 lg:grid-cols-4 xl:grid-cols-5 max-[420px]:grid-cols-1">
        {sections.map((section) => (
          <div key={section.title}>
            <h3 className="text-text font-semibold text-base mb-4">
              {section.title}
            </h3>
            <ul className="space-y-3">
              {section.links.map((link) => (
                <li key={link}>
                  <Link
                    className="text-text-subdued hover:text-text text-sm transition-[0.3s]"
                    href="#"
                  >
                    {link}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
        <div className="mb-8 flex justify-start lg:col-span-4 xl:col-span-1 xl:justify-end">
          <div className="flex items-start space-x-4">
            <Link
              className="w-10 h-10 bg-surface hover:opacity-[0.7] rounded-full flex items-center justify-center transition-[0.3s]"
              href="#"
            >
              <Facebook height={50} width={50} />
            </Link>
            <Link
              className="w-10 h-10 bg-surface hover:opacity-[0.7] rounded-full flex items-center justify-center transition-[0.3s]"
              href="#"
            >
              <TwitIcon height={50} width={50} />
            </Link>
            <Link
              className="w-10 h-10 bg-surface hover:opacity-[0.7] rounded-full flex items-center justify-center transition-[0.3s]"
              href="#"
            >
              <InstIcon height={50} width={50} />
            </Link>
          </div>
        </div>
      </div>
      <div className="flex flex-wrap items-center justify-between gap-4 border-t border-border pt-8">
        <div className="mb-4 flex flex-wrap items-center gap-x-6 gap-y-3 text-xs text-text-subdued md:mb-0">
          {bottomLinks.map((link) => (
            <Link
              className="hover:text-text transition-[0.3s]"
              href="#"
              key={link}
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

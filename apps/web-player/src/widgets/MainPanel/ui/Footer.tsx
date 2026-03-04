import { FacebookIcon, InstIcon, TwitIcon } from '@spotify/ui-react'
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
    <footer className="mt-16 pt-16 pb-8">
      <div className="grid grid-cols-5 gap-8 mb-8">
        {sections.map((section) => (
          <div key={section.title}>
            <h3 className="text-white font-semibold text-base mb-4">
              {section.title}
            </h3>
            <ul className="space-y-3">
              {section.links.map((link) => (
                <li key={link}>
                  <Link
                    className="text-gray-400 hover:text-white text-sm transition-[0.3s]"
                    href="#"
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
              className=" bg-surface hover:opacity-[0.7] rounded-full flex items-center justify-center transition-[0.3s]"
              href="#"
            >
              <FacebookIcon />
            </Link>
            <Link
              className=" bg-surface hover:opacity-[0.7] rounded-full flex items-center justify-center transition-[0.3s]"
              href="#"
            >
              <TwitIcon />
            </Link>
            <Link
              className=" bg-surface hover:opacity-[0.7] rounded-full flex items-center justify-center transition-[0.3s]"
              href="#"
            >
              <InstIcon />
            </Link>
          </div>
        </div>
      </div>
      <div className="flex flex-wrap items-center justify-between pt-8 border-t border-gray-700">
        <div className="flex flex-wrap items-center space-x-6 text-xs text-gray-400 mb-4 md:mb-0">
          {bottomLinks.map((link) => (
            <Link
              className="hover:text-white transition-[0.3s]"
              href="#"
              key={link}
            >
              {link}
            </Link>
          ))}
        </div>
        <div className="text-xs text-gray-400">© 2025 Spotify AB</div>
      </div>
    </footer>
  )
}

export { Footer }

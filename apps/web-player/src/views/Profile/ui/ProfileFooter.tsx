import Link from 'next/link'

const footerColumns = [
  { title: 'Company', links: ['About', 'Jobs', 'For the Record'] },
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

export const ProfileFooter = () => (
  <footer className="mt-28 border-t border-white/10 pb-8 pt-12">
    <div className="grid grid-cols-4 gap-8 max-[900px]:grid-cols-2">
      {footerColumns.map((column) => (
        <div key={column.title}>
          <h3 className="mb-3 text-sm font-bold text-text">{column.title}</h3>
          <div className="grid gap-2">
            {column.links.map((link) => (
              <Link
                className="text-sm text-text-subdued hover:text-text"
                href="#"
                key={link}
              >
                {link}
              </Link>
            ))}
          </div>
        </div>
      ))}
    </div>
    <div className="mt-12 flex flex-wrap items-center justify-between gap-4 border-t border-white/10 pt-8 text-xs text-text-subdued">
      <div className="flex flex-wrap gap-5">
        {bottomLinks.map((link) => (
          <Link className="hover:text-text" href="#" key={link}>
            {link}
          </Link>
        ))}
      </div>
      <span>© 2026 Spotify AB</span>
    </div>
  </footer>
)

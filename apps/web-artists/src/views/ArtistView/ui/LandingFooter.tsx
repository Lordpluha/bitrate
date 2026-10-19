import { ROUTES } from '@shared/routes/routes'

const LEGAL_LINKS = [
  { label: 'Terms of Use', href: ROUTES.terms },
  { label: 'Artist Agreement', href: ROUTES.artistAgreement },
  { label: 'Privacy Policy', href: ROUTES.privacy },
  { label: 'Community Guidelines', href: ROUTES.community },
  { label: 'Copyright', href: ROUTES.copyright },
] as const

export const LandingFooter = () => {
  return (
    <footer className="border-t border-border">
      <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-8 text-sm text-text-secondary sm:px-8 lg:flex-row lg:items-center lg:justify-between">
        <nav aria-label="Legal">
          <ul className="flex flex-wrap gap-x-6 gap-y-2">
            {LEGAL_LINKS.map((link) => (
              <li key={link.href}>
                <a className="hover:text-foreground" href={link.href}>
                  {link.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>
        <p>© {new Date().getFullYear()} Bitrate</p>
      </div>
    </footer>
  )
}

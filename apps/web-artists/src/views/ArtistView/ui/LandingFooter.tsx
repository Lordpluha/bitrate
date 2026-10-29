import { useI18n } from '@shared/i18n'
import { ROUTES } from '@shared/routes/routes'

const LEGAL_LINKS = [
  { label: 'landing.legal.terms', href: ROUTES.terms },
  { label: 'landing.legal.artistAgreement', href: ROUTES.artistAgreement },
  { label: 'landing.legal.privacy', href: ROUTES.privacy },
  { label: 'landing.legal.community', href: ROUTES.community },
  { label: 'landing.legal.copyright', href: ROUTES.copyright },
] as const

export const LandingFooter = () => {
  const { t } = useI18n()
  return (
    <footer className="border-t border-border">
      <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-8 text-sm text-text-secondary sm:px-8 lg:flex-row lg:items-center lg:justify-between">
        <nav aria-label={t('landing.legal')}>
          <ul className="flex flex-wrap gap-x-6 gap-y-2">
            {LEGAL_LINKS.map((link) => (
              <li key={link.href}>
                <a className="hover:text-foreground" href={link.href}>
                  {t(link.label)}
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

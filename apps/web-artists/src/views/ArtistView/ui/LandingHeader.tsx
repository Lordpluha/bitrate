import { useI18n } from '@shared/i18n'
import { ROUTES } from '@shared/routes/routes'
import { ArtistLogo } from '@shared/ui'
import { Link } from '@tanstack/react-router'
import { ArrowRight, Menu } from 'lucide-react'
import { useState } from 'react'
import { magneticHandlers } from '../lib/landingInteractions'
import {
  LANDING_NAV_ITEMS,
  type LandingSection,
} from '../lib/landingNavigation'
import { LandingMobileMenu } from './LandingMobileMenu'
import { LandingPreferences } from './LandingPreferences'

export const LandingHeader = () => {
  const { t } = useI18n()
  const [activeNav, setActiveNav] = useState<LandingSection>('product')
  const [menuOpen, setMenuOpen] = useState(false)
  return (
    <header className="artist-landing-header">
      <div className="artist-landing-header-inner">
        <div className="artist-landing-brand">
          <ArtistLogo />
          <span className="artist-landing-brand-name">Bitrate</span>
          <span aria-hidden="true" className="artist-landing-brand-divider">
            /
          </span>
          <span className="artist-landing-brand-badge">FOR ARTISTS</span>
        </div>
        <nav
          aria-label={t('landing.nav.sections')}
          className="artist-landing-header-nav artist-landing-dock"
        >
          {LANDING_NAV_ITEMS.map((item) => (
            <a
              aria-current={activeNav === item.id ? 'location' : undefined}
              className="artist-landing-dock-pill artist-magnetic-item"
              data-active={activeNav === item.id ? 'true' : undefined}
              href={item.href}
              key={item.id}
              onClick={() => setActiveNav(item.id)}
              {...magneticHandlers}
            >
              {t(item.label)}
            </a>
          ))}
        </nav>
        <div className="artist-landing-header-actions">
          <LandingPreferences />
          <nav
            aria-label={t('landing.account')}
            className="artist-landing-account-nav"
          >
            <Link className="artist-landing-login" to={ROUTES.auth.login}>
              {t('landing.logIn')}
            </Link>
            <Link
              className="artist-landing-signup artist-moving-border artist-moving-border-cta artist-magnetic-item"
              to={ROUTES.auth.registration}
              {...magneticHandlers}
            >
              <span>{t('landing.signUp')}</span>
              <ArrowRight aria-hidden="true" />
            </Link>
          </nav>
          <button
            aria-controls="landing-mobile-menu"
            aria-expanded={menuOpen}
            aria-haspopup="dialog"
            aria-label={t('landing.nav.open')}
            className="artist-landing-mobile-menu artist-landing-preference-trigger"
            onClick={() => setMenuOpen(true)}
            type="button"
          >
            <Menu aria-hidden="true" />
          </button>
          <LandingMobileMenu
            activeNav={activeNav}
            onNavigate={setActiveNav}
            onOpenChange={setMenuOpen}
            open={menuOpen}
          />
        </div>
      </div>
      <div
        aria-hidden="true"
        className="artist-landing-header-hairline mx-auto max-w-7xl"
      />
    </header>
  )
}

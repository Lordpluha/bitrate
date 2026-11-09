import { useI18n } from '@shared/i18n'
import { ROUTES } from '@shared/routes/routes'
import { Link } from '@tanstack/react-router'
import { ArrowRight, X } from 'lucide-react'
import { useEffect, useId, useRef } from 'react'
import {
  LANDING_NAV_ITEMS,
  type LandingSection,
} from '../lib/landingNavigation'

interface LandingMobileMenuProps {
  open: boolean
  activeNav: LandingSection
  onOpenChange: (open: boolean) => void
  onNavigate: (section: LandingSection) => void
}

export function LandingMobileMenu({
  open,
  activeNav,
  onOpenChange,
  onNavigate,
}: LandingMobileMenuProps) {
  const { t } = useI18n()
  const titleId = useId()
  const dialogRef = useRef<HTMLDialogElement>(null)
  useEffect(() => {
    const dialog = dialogRef.current
    if (!open || !dialog) return
    dialog.showModal()
    dialog
      .querySelector<HTMLButtonElement>('button')
      ?.focus({ preventScroll: true })
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    const desktop = window.matchMedia('(min-width: 1280px)')
    const closeOnDesktop = () => {
      if (desktop.matches) onOpenChange(false)
    }
    desktop.addEventListener('change', closeOnDesktop)
    return () => {
      desktop.removeEventListener('change', closeOnDesktop)
      document.body.style.overflow = previousOverflow
      dialog.close()
    }
  }, [open, onOpenChange])

  return (
    <dialog
      aria-labelledby={titleId}
      className="artist-dashboard artist-landing-menu-sheet"
      id="landing-mobile-menu"
      onCancel={(event) => {
        event.preventDefault()
        onOpenChange(false)
      }}
      onKeyDown={(event) => {
        if (event.key !== 'Tab') return
        const controls = event.currentTarget.querySelectorAll<HTMLElement>(
          'a[href], button:not([disabled])',
        )
        const first = controls[0]
        const last = controls[controls.length - 1]
        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault()
          last?.focus()
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault()
          first?.focus()
        }
      }}
      ref={dialogRef}
    >
      <div className="artist-landing-menu-top">
        <span className="artist-landing-menu-brand">
          <img alt="" height={32} src="/bitrate-logo.svg" width={32} />
          Bitrate <span>FOR ARTISTS</span>
        </span>
        <h2 className="sr-only" id={titleId}>
          {t('landing.nav.sections')}
        </h2>
        <button
          aria-label={t('landing.nav.close')}
          className="artist-landing-menu-close"
          onClick={() => onOpenChange(false)}
          type="button"
        >
          <X aria-hidden="true" />
        </button>
      </div>
      <nav
        aria-label={t('landing.nav.sections')}
        className="artist-landing-menu-links"
      >
        {LANDING_NAV_ITEMS.map((item) => (
          <a
            aria-current={activeNav === item.id ? 'location' : undefined}
            href={item.href}
            key={item.id}
            onClick={() => {
              onNavigate(item.id)
              onOpenChange(false)
            }}
          >
            <span>{t(item.label)}</span>
            <ArrowRight aria-hidden="true" />
          </a>
        ))}
      </nav>
      <div className="artist-landing-menu-account">
        <Link
          className="artist-landing-menu-register artist-moving-border artist-moving-border-cta"
          onClick={() => onOpenChange(false)}
          to={ROUTES.auth.registration}
        >
          {t('landing.createAccount')}
          <ArrowRight aria-hidden="true" />
        </Link>
        <Link
          className="artist-landing-menu-login"
          onClick={() => onOpenChange(false)}
          to={ROUTES.auth.login}
        >
          {t('landing.logIn')}
        </Link>
      </div>
    </dialog>
  )
}

import { useI18n } from '@shared/i18n'
import { tiltHandlers } from '@shared/lib/tilt'
import { ROUTES } from '@shared/routes/routes'
import { Link } from '@tanstack/react-router'
import { ArrowRight, Plus } from 'lucide-react'
import { type CSSProperties, useEffect, useRef } from 'react'
import { magneticHandlers } from '../lib/landingInteractions'

const SLEEVE_CONTOUR =
  'M24 12 H216 A12 12 0 0 1 228 24 V216 A12 12 0 0 1 216 228 H24 A12 12 0 0 1 12 216 V24 A12 12 0 0 1 24 12 Z'

const COVER_STROKES = Array.from({ length: 64 }, (_, index) => {
  const side = Math.floor(index / 16)
  return {
    id: `sleeve-stroke-${index}`,
    offset: -index,
    style: {
      '--stroke-x': `${side < 2 ? 140 + (index % 7) * 18 : -140 - (index % 7) * 18}px`,
      '--stroke-y': `${((index % 9) - 4) * 22}px`,
      '--stroke-turn': `${((index % 5) - 2) * 12}deg`,
      '--stroke-delay': `${(index % 16) * 14 + side * 55}ms`,
    } as CSSProperties,
  }
})

const SIGNAL_PATHS = [
  { id: 'left-high', d: 'M0 70 C130 70 150 190 250 170 S350 100 396 140' },
  { id: 'left-middle', d: 'M0 145 C110 210 195 65 285 130 S355 170 396 140' },
  { id: 'left-low', d: 'M0 230 C145 230 170 100 270 150 S350 170 396 140' },
  { id: 'right-high', d: 'M1000 70 C870 70 850 190 750 170 S650 100 604 140' },
  {
    id: 'right-middle',
    d: 'M1000 145 C890 210 805 65 715 130 S645 170 604 140',
  },
  { id: 'right-low', d: 'M1000 230 C855 230 830 100 730 150 S650 170 604 140' },
] as const

export function LandingFinale() {
  const { t } = useI18n()
  const sectionRef = useRef<HTMLElement>(null)
  const coverRef = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const section = sectionRef.current
    const cover = coverRef.current
    if (!section || !cover) return
    if (!('IntersectionObserver' in window)) {
      section.dataset.entered = 'true'
      section.dataset.visible = 'true'
      return
    }
    const observer = new IntersectionObserver(
      ([entry]) => {
        const visible = entry?.isIntersecting ?? false
        section.dataset.visible = String(visible)
        if (visible) section.dataset.entered = 'true'
      },
      { threshold: 0.3 },
    )
    observer.observe(cover)
    return () => observer.disconnect()
  }, [])

  return (
    <section
      aria-labelledby="landing-finale-heading"
      className="artist-landing-finale"
      data-entered="false"
      id="landing-create-release"
      ref={sectionRef}
    >
      <div className="artist-finale-content">
        <p className="artist-finale-eyebrow">{t('landing.finale.eyebrow')}</p>
        <h2
          aria-label={`${t('landing.finale.title')} ${t('landing.finale.titleAccent')}`}
          id="landing-finale-heading"
        >
          {t('landing.finale.title')}
          <span>{t('landing.finale.titleAccent')}</span>
        </h2>
        <p className="artist-finale-lead">{t('landing.finale.lead')}</p>
        <div className="artist-finale-visual">
          <svg
            aria-hidden="true"
            className="artist-finale-waves"
            preserveAspectRatio="xMidYMid meet"
            viewBox="0 0 1000 280"
          >
            {SIGNAL_PATHS.map((path, index) => (
              <g
                key={path.id}
                style={
                  { '--signal-delay': `${index * -430}ms` } as CSSProperties
                }
              >
                <path className="artist-finale-wave-track" d={path.d} />
                <path
                  className="artist-finale-wave-light"
                  d={path.d}
                  pathLength="1"
                />
              </g>
            ))}
          </svg>
          <span aria-hidden="true" className="artist-finale-platform" />
          <div
            className="artist-finale-cover-stage"
            onPointerLeave={tiltHandlers.onPointerLeave}
            onPointerMove={tiltHandlers.onPointerMove}
            ref={coverRef}
          >
            <span
              aria-hidden="true"
              className="artist-finale-ghost artist-finale-ghost-back"
            />
            <span
              aria-hidden="true"
              className="artist-finale-ghost artist-finale-ghost-front"
            />
            <div className="artist-finale-sleeve">
              <Link
                aria-label={t('landing.finale.coverAction')}
                className="artist-finale-cover"
                to={ROUTES.auth.registration}
              >
                <span className="artist-finale-cover-top">
                  <img alt="" height={18} src="/bitrate-logo.svg" width={18} />
                  <span>FOR ARTISTS</span>
                </span>
                <span aria-hidden="true" className="artist-finale-plus">
                  <Plus />
                </span>
                <span className="artist-finale-cover-bottom">
                  <span>{t('landing.finale.placeholder')}</span>
                  <ArrowRight aria-hidden="true" />
                </span>
              </Link>
              <svg
                aria-hidden="true"
                className="artist-finale-assembly"
                viewBox="0 0 240 240"
              >
                {COVER_STROKES.map(({ id, style, offset }) => (
                  <path
                    d={SLEEVE_CONTOUR}
                    key={id}
                    pathLength={64}
                    strokeDasharray="0.6 63.4"
                    strokeDashoffset={offset}
                    style={style}
                  />
                ))}
              </svg>
              <span aria-hidden="true" className="artist-finale-cover-shine" />
            </div>
          </div>
        </div>
        <Link
          className="artist-finale-primary artist-moving-border artist-moving-border-cta artist-magnetic-item"
          to={ROUTES.auth.registration}
          {...magneticHandlers}
        >
          <span>{t('landing.finale.create')}</span>
          <ArrowRight aria-hidden="true" />
        </Link>
        <p className="artist-finale-login">
          {t('landing.finale.existing')}{' '}
          <Link to={ROUTES.auth.login}>{t('landing.logIn')}</Link>
        </p>
      </div>
    </section>
  )
}

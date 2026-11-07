import { useI18n } from '@shared/i18n'
import { ROUTES } from '@shared/routes/routes'
import { Link } from '@tanstack/react-router'
import { ArrowRight, AudioLines, Headphones } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { isMotionReduced } from '../lib/landingInteractions'
import {
  LISTENING_PERIODS,
  LISTENING_PREVIEWS,
  type ListeningPeriod,
} from '../lib/listeningPreview'
import { useListeningReorder } from '../model/useListeningReorder'
import { ListeningChart } from './ListeningChart'
import { ListeningField } from './ListeningField'
import { ListeningSpotlight } from './ListeningSpotlight'
import { ListeningTracks } from './ListeningTracks'
import { ResponseNumber } from './ResponseNumber'

export function ListeningResponse() {
  const { t, tp } = useI18n()
  const [period, setPeriod] = useState<ListeningPeriod>(28)
  const [entered, setEntered] = useState(false)
  const visualRef = useRef<HTMLElement>(null)
  const plotRef = useRef<HTMLDivElement>(null)
  const preview = LISTENING_PREVIEWS[period]
  const { listRef, capture } = useListeningReorder(period)
  useEffect(() => {
    if (isMotionReduced()) setEntered(true)
    if (!('IntersectionObserver' in window)) {
      setEntered(true)
      return
    }
    const node = visualRef.current
    if (!node) return
    const observer = new IntersectionObserver(
      ([entry]) => {
        const visible = entry?.isIntersecting ?? false
        node.dataset.visible = String(visible)
        if (visible) setEntered(true)
      },
      { threshold: 0.15 },
    )
    observer.observe(node)
    return () => observer.disconnect()
  }, [])

  return (
    <section
      aria-labelledby="listening-response-heading"
      className="artist-listening-response"
      data-entered={entered}
      id="landing-features"
    >
      <div className="artist-response-copy">
        <p className="artist-response-eyebrow">
          {t('landing.response.eyebrow')}
        </p>
        <h2
          aria-label={`${t('landing.response.title')} ${t('landing.response.titleAccent')}`}
          id="listening-response-heading"
        >
          {t('landing.response.title')}{' '}
          <span className="artist-response-title-accent">
            {t('landing.response.titleAccent')}
          </span>
        </h2>
        <p className="artist-response-lead">{t('landing.response.lead')}</p>
      </div>

      <section
        aria-label={t('landing.response.preview')}
        className="artist-response-visual"
        ref={visualRef}
      >
        <ListeningField containerRef={visualRef} />
        <div aria-hidden="true" className="artist-response-scene-light" />
        <div className="artist-response-chart-card artist-response-glass">
          <div className="artist-response-toolbar">
            <span>
              <AudioLines aria-hidden="true" />
              {t('landing.response.listening')}
            </span>
            <span className="artist-response-demo">
              {t('landing.response.demo')}
            </span>
          </div>
          <div className="artist-response-chart-summary">
            <dl className="artist-response-stats">
              <div className="artist-response-primary-stat">
                <dt>
                  <Headphones aria-hidden="true" />
                  {t('analytics.plays')}
                </dt>
                <dd>
                  <ResponseNumber entered={entered} value={preview.plays} />
                </dd>
              </div>
            </dl>
            <fieldset className="artist-response-periods">
              <legend className="sr-only">{t('analytics.period')}</legend>
              {LISTENING_PERIODS.map((days) => (
                <button
                  aria-pressed={days === period}
                  key={days}
                  onClick={() => {
                    capture()
                    setPeriod(days)
                    setEntered(true)
                  }}
                  type="button"
                >
                  {tp({ count: days, key: 'analytics.days' })}
                </button>
              ))}
            </fieldset>
          </div>
          <div className="artist-response-chart-shell">
            <ListeningChart
              entered={entered}
              preview={preview}
              triggerRef={plotRef}
            />
          </div>
        </div>
        <ListeningSpotlight entered={entered} preview={preview} />
        <ListeningTracks
          entered={entered}
          listRef={listRef}
          preview={preview}
        />
      </section>
      <div className="artist-response-footer">
        <p className="artist-response-invite">{t('landing.response.try')}</p>
        <Link className="artist-response-cta" to={ROUTES.auth.registration}>
          {t('landing.response.start')}
          <ArrowRight aria-hidden="true" />
        </Link>
        <p className="artist-response-scope">{t('landing.response.scope')}</p>
      </div>
    </section>
  )
}

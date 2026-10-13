'use client'

import { ROUTES } from '@shared/routes'
import Link from 'next/link'
import { useLandingCopy } from '../../model/useLandingCopy'
import { ServiceStatus } from '../ServiceStatus'
import type { SceneProps } from './scene.types'

/** Scene "Start" — ported from the motion prototype; the landing engine animates it after mount. */
export const SceneStart = ({ signedIn }: SceneProps) => {
  const c = useLandingCopy()
  return (
    <section
      aria-label={c('cta.pick_up_where_the_last_track_left_off')}
      className="scene"
      data-label="Start"
      id="cta"
    >
      <div className="board">
        <div
          className="abs d-only"
          style={{
            '--x': '70',
            '--y': '404',
            '--w': '1300',
            '--h': '378',
            opacity: '.55',
          }}
        >
          <canvas className="spec" data-bars="90" data-tall="1"></canvas>
        </div>
        <div
          className="abs d-only"
          style={{ '--x': '205', '--y': '555', '--w': '1030', '--h': '227' }}
        >
          <div className="dome" style={{ height: '100%' }}></div>
        </div>
        <div
          className="abs"
          style={{
            '--x': '160',
            '--y': '64',
            '--w': '1120',
            textAlign: 'center',
          }}
        >
          <div
            data-a="up"
            style={{ display: 'flex', justifyContent: 'center' }}
          >
            <span
              className="pill"
              style={{
                padding: '11px 16px',
                fontSize: '12px',
                letterSpacing: '.14em',
                fontFamily: 'var(--font-data)',
              }}
            >
              {c('cta.ready_when_you_are')}
            </span>
          </div>
          <h2 className="h h80" style={{ marginTop: '26px' }}>
            <span className="line">
              <span>{c('cta.pick_up_where_the')}</span>
            </span>
            <span className="line">
              <span>
                {c('cta.last_track')}{' '}
                <span className="hl">{c('cta.left_off')}</span>
              </span>
            </span>
          </h2>
          <p className="lede" data-a="up" style={{ marginTop: '20px' }}>
            {c('cta.open_bitrate_in_the_browser_and_make_the')}
          </p>
          <div
            className="ctas"
            data-a="up"
            style={{ justifyContent: 'center', marginTop: '26px' }}
          >
            <Link
              className="btn btn-primary magnetic"
              href={ROUTES.main}
              style={{ height: '60px', padding: '0 30px', fontSize: '16px' }}
            >
              {c('cta.open_web_player')}{' '}
              <svg aria-hidden="true" className="i">
                <use href="#i-arrow" />
              </svg>
            </Link>
          </div>
        </div>
        <div
          aria-hidden="true"
          className="abs"
          id="cradleSlot"
          style={{ '--x': '520', '--y': '470', '--w': '400', '--h': '250' }}
        ></div>
        <p
          className="abs mono"
          data-a="up"
          style={{
            '--x': '420',
            '--y': '738',
            '--w': '600',
            textAlign: 'center',
          }}
        >
          {c('cta.energy_carries_on_so_does_your_queue')}
        </p>
        <div
          className="abs"
          data-a="up"
          style={{ '--x': '0', '--y': '782', '--w': '1440', '--h': '118' }}
        >
          <div className="footer">
            <span className="row">
              <b
                style={{
                  font: '600 20px/1 var(--font-display)',
                  color: 'var(--fg)',
                }}
              >
                {c('cta.bitrate')}
              </b>
              <span className="d-only">{c('cta.playback_is_the_product')}</span>
            </span>
            <span className="sig d-only">{c('cta.music_lives_on')}</span>
            <span className="row" style={{ gap: '24px' }}>
              {!signedIn && (
                <Link className="ulink" href={ROUTES.auth.login}>
                  {c('cta.log_in')}
                </Link>
              )}
              {!signedIn && (
                <Link className="ulink u-right" href={ROUTES.auth.registration}>
                  {c('cta.create_account')}
                </Link>
              )}
              <Link className="ulink u-center d-only" href={ROUTES.main}>
                {c('cta.player_preview')}
              </Link>
              <Link className="ulink d-only" href={ROUTES.terms}>
                {c('cta.legal')}
              </Link>
              <ServiceStatus />
            </span>
          </div>
          <svg
            aria-hidden="true"
            height="0"
            style={{ position: 'absolute' }}
            width="0"
          >
            <filter id="goo">
              <feGaussianBlur in="SourceGraphic" result="b" stdDeviation="9" />
              <feColorMatrix
                in="b"
                mode="matrix"
                result="g"
                values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 22 -10"
              />
              <feComposite in="SourceGraphic" in2="g" operator="atop" />
            </filter>
          </svg>
        </div>
      </div>
    </section>
  )
}

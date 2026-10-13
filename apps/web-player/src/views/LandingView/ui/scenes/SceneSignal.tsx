'use client'

import { ROUTES } from '@shared/routes'
import Link from 'next/link'
import { useLandingCopy } from '../../model/useLandingCopy'
import type { SceneProps } from './scene.types'

/** Scene "Signal" — ported from the motion prototype; the landing engine animates it after mount. */
export const SceneSignal = ({ signedIn }: SceneProps) => {
  const c = useLandingCopy()
  return (
    <section
      aria-label={c('hero.your_music_already_where_you_are')}
      className="scene is-active"
      data-label="Signal"
      id="hero"
    >
      <div className="board">
        <div
          className="abs"
          style={{ '--x': '54', '--y': '262', '--w': '540' }}
        >
          <div className="col" style={{ gap: '26px' }}>
            <div className="eyebrow" data-a="up">
              {c('hero.web_player')}
            </div>
            <h1 className="h h72">
              <span className="line">
                <span>{c('hero.your_music')}</span>
              </span>
              <span className="line">
                <span>{c('hero.already_where')}</span>
              </span>
              <span className="line">
                <span className="hl">{c('hero.you_are')}</span>
              </span>
            </h1>
            <p className="lede" data-a="up">
              {c('hero.instant_access_in_your_browser')}
              <br />
              {c('hero.listen_save_and_return_to_your_library')}
            </p>
            <div className="ctas" data-a="up">
              <Link className="btn btn-primary magnetic" href={ROUTES.main}>
                {c('hero.open_web_player')}{' '}
                <svg aria-hidden="true" className="i">
                  <use href="#i-arrow" />
                </svg>
              </Link>
              {!signedIn && (
                <Link
                  className="btn btn-ghost magnetic"
                  href={ROUTES.auth.registration}
                >
                  {c('hero.create_account')}
                </Link>
              )}
            </div>
            <div className="row mono" data-a="up">
              <svg
                aria-hidden="true"
                className="i"
                style={{
                  width: '15px',
                  height: '15px',
                  color: 'var(--accent)',
                }}
              >
                <use href="#i-signal" />
              </svg>
              {c('hero.interactive_player_preview')}
            </div>
          </div>
        </div>
        <div
          className="abs persp d-only"
          style={{ '--x': '610', '--y': '170', '--w': '786' }}
        >
          <div className="win" data-a="win" id="heroWin">
            <div className="wbar">
              <span className="live">
                <i></i>
                <span className="glitch glitch-auto" data-text="NOW PLAYING">
                  {c('hero.now_playing')}
                </span>
              </span>
              <span className="grow"></span>
              <span className="d-only">{c('hero.preview_session')}</span>
              <span className="live ok d-only">
                <i></i>
                <span className="glitch glitch-auto" data-text="SIGNAL STABLE">
                  {c('hero.signal_stable')}
                </span>
              </span>
            </div>
            <div
              className="row m-fit"
              style={{ alignItems: 'stretch', gap: '0', height: '520px' }}
            >
              <div
                className="col d-only"
                style={{
                  width: '56px',
                  alignItems: 'center',
                  padding: '16px 0',
                  gap: '18px',
                  borderRight: '1px solid var(--border)',
                  color: 'var(--muted)',
                }}
              >
                <svg
                  aria-hidden="true"
                  className="i"
                  style={{ color: 'var(--fg)' }}
                >
                  <use href="#i-home" />
                </svg>
                <svg aria-hidden="true" className="i">
                  <use href="#i-search" />
                </svg>
                <svg aria-hidden="true" className="i">
                  <use href="#i-lib" />
                </svg>
                <span className="grow"></span>
                <span className="av" style={{ background: '#7c3aed' }}>
                  {c('hero.dj')}
                </span>
              </div>
              <div
                className="col"
                style={{
                  width: '410px',
                  padding: '20px',
                  gap: '16px',
                  boxSizing: 'border-box',
                }}
              >
                <div className="art" style={{ height: '300px' }}></div>
                <div className="row">
                  <div className="grow">
                    <p
                      className="t-title"
                      style={{ font: '600 22px/1.1 var(--font-display)' }}
                    >
                      {c('hero.night_signal')}
                    </p>
                    <p className="t-meta">{c('hero.demo_artist')}</p>
                  </div>
                  <svg
                    aria-hidden="true"
                    className="i"
                    style={{ color: 'var(--accent)' }}
                  >
                    <use href="#i-heart" />
                  </svg>
                </div>
                <div>
                  <div className="prog">
                    <i id="heroProg"></i>
                  </div>
                  <div className="times">
                    <span>{'1:38'}</span>
                    <span>{'3:56'}</span>
                  </div>
                </div>
                <div className="transport">
                  <svg aria-hidden="true" className="i">
                    <use href="#i-shuffle" />
                  </svg>
                  <svg aria-hidden="true" className="i">
                    <use href="#i-prev" />
                  </svg>
                  <span className="playbtn">
                    <svg aria-hidden="true" className="i">
                      <use href="#i-pause" />
                    </svg>
                  </span>
                  <svg aria-hidden="true" className="i">
                    <use href="#i-next" />
                  </svg>
                  <svg aria-hidden="true" className="i">
                    <use href="#i-repeat" />
                  </svg>
                </div>
              </div>
              <div
                className="col grow d-only"
                style={{
                  padding: '18px 18px 18px 6px',
                  gap: '4px',
                  borderLeft: '1px solid var(--border)',
                }}
              >
                <div
                  className="row label"
                  style={{
                    justifyContent: 'space-between',
                    padding: '4px 10px 10px',
                  }}
                >
                  <span>{c('hero.up_next')}</span>
                  <span style={{ letterSpacing: '.04em' }}>
                    {c('hero.clear')}
                  </span>
                </div>
                <div className="qrow">
                  <span className="cv s cv2"></span>
                  <div className="grow">
                    <p className="t-title">{c('hero.echoes_in_motion')}</p>
                    <p className="t-meta">{c('hero.lumen_choir')}</p>
                  </div>
                  <span className="mono">{'4:21'}</span>
                </div>
                <div className="qrow">
                  <span className="cv s cv3"></span>
                  <div className="grow">
                    <p className="t-title">{c('hero.static_lines')}</p>
                    <p className="t-meta">{c('hero.kite_harbor')}</p>
                  </div>
                  <span className="mono">{'3:47'}</span>
                </div>
                <div className="qrow">
                  <span className="cv s cv4"></span>
                  <div className="grow">
                    <p className="t-title">{c('hero.drift_control')}</p>
                    <p className="t-meta">{c('hero.mira_sol')}</p>
                  </div>
                  <span className="mono">{'3:12'}</span>
                </div>
                <div className="qrow">
                  <span className="cv s cv1"></span>
                  <div className="grow">
                    <p className="t-title">{c('hero.afterglow')}</p>
                    <p className="t-meta">{c('hero.nova_the_static')}</p>
                  </div>
                  <span className="mono">{'3:42'}</span>
                </div>
                <span className="grow"></span>
                <div
                  className="row"
                  style={{ padding: '0 10px', color: 'var(--muted)' }}
                >
                  <svg aria-hidden="true" className="i">
                    <use href="#i-vol" />
                  </svg>
                  <div className="prog grow">
                    <i style={{ transform: 'scaleX(.7)' }}></i>
                  </div>
                </div>
              </div>
            </div>
            <div className="tech d-only">
              <div>
                <span className="label">{c('hero.source')}</span>
                <b>{c('hero.bitrate')}</b>
              </div>
              <div>
                <span className="label">{c('hero.output')}</span>
                <b>{c('hero.web')}</b>
              </div>
              <div>
                <span className="label">{c('hero.mode')}</span>
                <b>{c('hero.preview')}</b>
              </div>
              <div className="grow" style={{ height: '32px' }}>
                <canvas className="spec" data-bars="48"></canvas>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

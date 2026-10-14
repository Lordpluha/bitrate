'use client'

import { ROUTES } from '@shared/routes'
import Link from 'next/link'
import { lc } from '../../lib/styles/lc'
import { useLandingCopy } from '../../model/useLandingCopy'
import { ServiceStatus } from '../ServiceStatus'
import type { SceneProps } from './scene.types'

/** Scene "Start" — ported from the motion prototype; the landing engine animates it after mount. */
export const SceneStart = ({ signedIn }: SceneProps) => {
  const c = useLandingCopy()
  return (
    <section
      aria-label={c('cta.pick_up_where_the_last_track_left_off')}
      className={lc('scene')}
      data-label="Start"
      id="cta"
    >
      <div className={lc('board')}>
        <div
          className={lc('abs d-only', 'opacity-[.55]')}
          style={{ '--x': '70', '--y': '404', '--w': '1300', '--h': '378' }}
        >
          <canvas className={lc('spec')} data-bars="90" data-tall="1"></canvas>
        </div>
        <div
          className={lc('abs d-only')}
          style={{ '--x': '205', '--y': '555', '--w': '1030', '--h': '227' }}
        >
          <div className={lc('dome', 'h-full')}></div>
        </div>
        <div
          className={lc('abs', 'text-center')}
          style={{ '--x': '160', '--y': '64', '--w': '1120' }}
        >
          <div className="flex justify-center" data-a="up">
            <span
              className={lc(
                'pill',
                'p-[11px_16px] [font-size:12px] tracking-[.14em] font-[family-name:var(--font-data)]',
              )}
            >
              {c('cta.ready_when_you_are')}
            </span>
          </div>
          <h2 className={lc('h h80', 'mt-[26px]')}>
            <span className={lc('line')}>
              <span>{c('cta.pick_up_where_the')}</span>
            </span>
            <span className={lc('line')}>
              <span>
                {c('cta.last_track')}{' '}
                <span className={lc('hl')}>{c('cta.left_off')}</span>
              </span>
            </span>
          </h2>
          <p className={lc('lede', 'mt-[20px]')} data-a="up">
            {c('cta.open_bitrate_in_the_browser_and_make_the')}
          </p>
          <div className={lc('ctas', 'justify-center mt-[26px]')} data-a="up">
            <Link
              className={lc(
                'btn btn-primary magnetic',
                'h-[60px]! p-[0_30px]! [font-size:16px]',
              )}
              href={signedIn ? ROUTES.main : ROUTES.auth.registration}
            >
              {c(signedIn ? 'cta.open_web_player' : 'cta.create_account')}{' '}
              <svg aria-hidden="true" className={lc('i')}>
                <use href="#i-arrow" />
              </svg>
            </Link>
          </div>
        </div>
        <div
          aria-hidden="true"
          className={lc('abs #cradleSlot')}
          id="cradleSlot"
          style={{ '--x': '520', '--y': '470', '--w': '400', '--h': '250' }}
        ></div>
        <p
          className={lc('abs mono', 'text-center')}
          data-a="up"
          style={{ '--x': '420', '--y': '738', '--w': '600' }}
        >
          {c('cta.energy_carries_on_so_does_your_queue')}
        </p>
        <div
          className={lc('abs')}
          data-a="up"
          style={{ '--x': '0', '--y': '782', '--w': '1440', '--h': '118' }}
        >
          <div className={lc('footer')}>
            <span className={lc('row')}>
              <b className="font-[600] [font-size:20px] leading-[1] font-[family-name:var(--font-display)] text-foreground">
                {c('cta.bitrate')}
              </b>
              <span className={lc('d-only')}>
                {c('cta.playback_is_the_product')}
              </span>
            </span>
            <span className={lc('sig d-only')}>{c('cta.music_lives_on')}</span>
            <span className={lc('row', 'gap-[24px]')}>
              {!signedIn && (
                <Link className={lc('ulink')} href={ROUTES.auth.login}>
                  {c('cta.log_in')}
                </Link>
              )}
              {!signedIn && (
                <Link
                  className={lc('ulink u-right')}
                  href={ROUTES.auth.registration}
                >
                  {c('cta.create_account')}
                </Link>
              )}
              {signedIn && (
                <Link
                  className={lc('ulink u-center d-only')}
                  href={ROUTES.main}
                >
                  {c('cta.player_preview')}
                </Link>
              )}
              <Link className={lc('ulink d-only')} href={ROUTES.terms}>
                {c('cta.legal')}
              </Link>
              <ServiceStatus />
            </span>
          </div>
          <svg aria-hidden="true" className="absolute" height="0" width="0">
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

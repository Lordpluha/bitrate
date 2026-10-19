'use client'

import { ROUTES } from '@shared/routes'
import Link from 'next/link'
import { lc } from '../../lib/styles/lc'
import { useLandingCopy } from '../../model/useLandingCopy'
import type { SceneProps } from './scene.types'

/** Scene "Signal" — ported from the motion prototype; the landing engine animates it after mount. */
export const SceneSignal = ({ signedIn }: SceneProps) => {
  const c = useLandingCopy()
  return (
    <section
      aria-label={c('hero.your_music_already_where_you_are')}
      className={lc('scene is-active')}
      data-label="Signal"
      id="hero"
    >
      <div className={lc('board')}>
        <div
          className={lc('abs')}
          style={{ '--x': '54', '--y': '262', '--w': '540' }}
        >
          <div className={lc('col', 'gap-[26px]')}>
            <div className={lc('eyebrow')} data-a="up">
              {c('hero.web_player')}
            </div>
            <h1 className={lc('h h72')}>
              <span className={lc('line')}>
                <span>{c('hero.your_music')}</span>
              </span>
              <span className={lc('line')}>
                <span>{c('hero.already_where')}</span>
              </span>
              <span className={lc('line')}>
                <span className={lc('hl')}>{c('hero.you_are')}</span>
              </span>
            </h1>
            <p className={lc('lede')} data-a="up">
              {c('hero.instant_access_in_your_browser')}
              <br />
              {c('hero.listen_save_and_return_to_your_library')}
            </p>
            <div className={lc('ctas')} data-a="up">
              {/* the player needs an account: guests are offered one instead of a login redirect */}
              <Link
                className={lc('btn btn-primary magnetic')}
                href={signedIn ? ROUTES.main : ROUTES.auth.registration}
              >
                {c(signedIn ? 'hero.open_web_player' : 'hero.create_account')}{' '}
                <svg aria-hidden="true" className={lc('i')}>
                  <use href="#i-arrow" />
                </svg>
              </Link>
              {!signedIn && (
                <Link
                  className={lc('btn btn-ghost magnetic')}
                  href={ROUTES.auth.login}
                >
                  {c('hero.log_in')}
                </Link>
              )}
            </div>
            <div className={lc('row mono')} data-a="up">
              <svg
                aria-hidden="true"
                className={lc('i', 'w-[15px]! h-[15px]! text-accent')}
              >
                <use href="#i-signal" />
              </svg>
              {c('hero.interactive_player_preview')}
            </div>
          </div>
        </div>
        <div
          className={lc('abs persp d-only')}
          style={{ '--x': '610', '--y': '170', '--w': '786' }}
        >
          <div className={lc('win')} data-a="win" id="heroWin">
            <div className={lc('wbar')}>
              <span className={lc('live')}>
                <i></i>
                <span
                  className={lc('glitch glitch-auto')}
                  data-text="NOW PLAYING"
                >
                  {c('hero.now_playing')}
                </span>
              </span>
              <span className={lc('grow')}></span>
              <span className={lc('d-only')}>{c('hero.preview_session')}</span>
              <span className={lc('live ok d-only')}>
                <i></i>
                <span
                  className={lc('glitch glitch-auto')}
                  data-text="SIGNAL STABLE"
                >
                  {c('hero.signal_stable')}
                </span>
              </span>
            </div>
            <div className={lc('row m-fit', 'items-stretch gap-0 h-[520px]')}>
              <div
                className={lc(
                  'col d-only',
                  'w-[56px] items-center p-[16px_0] gap-[18px] [border-right:1px_solid_var(--border)] text-muted-foreground',
                )}
              >
                <svg aria-hidden="true" className={lc('i', 'text-foreground')}>
                  <use href="#i-home" />
                </svg>
                <svg aria-hidden="true" className={lc('i')}>
                  <use href="#i-search" />
                </svg>
                <svg aria-hidden="true" className={lc('i')}>
                  <use href="#i-lib" />
                </svg>
                <span className={lc('grow')}></span>
                <span className={lc('av', 'bg-purple-500 bg-none')}>
                  {c('hero.dj')}
                </span>
              </div>
              <div
                className={lc(
                  'col',
                  'w-[410px] p-[20px] gap-[16px] box-border',
                )}
              >
                <div className={lc('art', 'h-[300px]')}></div>
                <div className={lc('row')}>
                  <div className={lc('grow')}>
                    <p
                      className={lc(
                        't-title',
                        'font-[600] [font-size:22px] leading-[1.1] font-[family-name:var(--font-display)]',
                      )}
                    >
                      {c('hero.night_signal')}
                    </p>
                    <p className={lc('t-meta')}>{c('hero.demo_artist')}</p>
                  </div>
                  <svg aria-hidden="true" className={lc('i', 'text-accent')}>
                    <use href="#i-heart" />
                  </svg>
                </div>
                <div>
                  <div className={lc('prog')}>
                    <i id="heroProg"></i>
                  </div>
                  <div className={lc('times')}>
                    <span>{'1:38'}</span>
                    <span>{'3:56'}</span>
                  </div>
                </div>
                <div className={lc('transport')}>
                  <svg aria-hidden="true" className={lc('i')}>
                    <use href="#i-shuffle" />
                  </svg>
                  <svg aria-hidden="true" className={lc('i')}>
                    <use href="#i-prev" />
                  </svg>
                  <span className={lc('playbtn')}>
                    <svg aria-hidden="true" className={lc('i')}>
                      <use href="#i-pause" />
                    </svg>
                  </span>
                  <svg aria-hidden="true" className={lc('i')}>
                    <use href="#i-next" />
                  </svg>
                  <svg aria-hidden="true" className={lc('i')}>
                    <use href="#i-repeat" />
                  </svg>
                </div>
              </div>
              <div
                className={lc(
                  'col grow d-only',
                  'p-[18px_18px_18px_6px] gap-[4px] [border-left:1px_solid_var(--border)]',
                )}
              >
                <div
                  className={lc(
                    'row label',
                    'justify-between p-[4px_10px_10px]',
                  )}
                >
                  <span>{c('hero.up_next')}</span>
                  <span className="tracking-[.04em]">{c('hero.clear')}</span>
                </div>
                <div className={lc('qrow')}>
                  <span className={lc('cv s cv2')}></span>
                  <div className={lc('grow')}>
                    <p className={lc('t-title')}>
                      {c('hero.echoes_in_motion')}
                    </p>
                    <p className={lc('t-meta')}>{c('hero.lumen_choir')}</p>
                  </div>
                  <span className={lc('mono')}>{'4:21'}</span>
                </div>
                <div className={lc('qrow')}>
                  <span className={lc('cv s cv3')}></span>
                  <div className={lc('grow')}>
                    <p className={lc('t-title')}>{c('hero.static_lines')}</p>
                    <p className={lc('t-meta')}>{c('hero.kite_harbor')}</p>
                  </div>
                  <span className={lc('mono')}>{'3:47'}</span>
                </div>
                <div className={lc('qrow')}>
                  <span className={lc('cv s cv4')}></span>
                  <div className={lc('grow')}>
                    <p className={lc('t-title')}>{c('hero.drift_control')}</p>
                    <p className={lc('t-meta')}>{c('hero.mira_sol')}</p>
                  </div>
                  <span className={lc('mono')}>{'3:12'}</span>
                </div>
                <div className={lc('qrow')}>
                  <span className={lc('cv s cv1')}></span>
                  <div className={lc('grow')}>
                    <p className={lc('t-title')}>{c('hero.afterglow')}</p>
                    <p className={lc('t-meta')}>{c('hero.nova_the_static')}</p>
                  </div>
                  <span className={lc('mono')}>{'3:42'}</span>
                </div>
                <span className={lc('grow')}></span>
                <div className={lc('row', 'p-[0_10px] text-muted-foreground')}>
                  <svg aria-hidden="true" className={lc('i')}>
                    <use href="#i-vol" />
                  </svg>
                  <div className={lc('prog grow')}>
                    <i className="[transform:scaleX(.7)]!"></i>
                  </div>
                </div>
              </div>
            </div>
            <div className={lc('tech d-only')}>
              <div>
                <span className={lc('label')}>{c('hero.source')}</span>
                <b>{c('hero.bitrate')}</b>
              </div>
              <div>
                <span className={lc('label')}>{c('hero.output')}</span>
                <b>{c('hero.web')}</b>
              </div>
              <div>
                <span className={lc('label')}>{c('hero.mode')}</span>
                <b>{c('hero.preview')}</b>
              </div>
              <div className={lc('grow', 'h-[32px]')}>
                <canvas className={lc('spec')} data-bars="48"></canvas>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

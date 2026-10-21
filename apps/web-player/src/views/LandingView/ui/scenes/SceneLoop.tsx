'use client'

import { lc } from '../../lib/styles/lc'
import { DEMO_TRACKS } from '../../model/demoTracks'
import { useLandingCopy } from '../../model/useLandingCopy'

/** Scene "Loop" — ported from the motion prototype; the landing engine animates it after mount. */
export const SceneLoop = () => {
  const c = useLandingCopy()
  return (
    <section
      aria-label={c('loop.play_save_return')}
      className={lc('scene')}
      data-label="Loop"
      id="loop"
    >
      <div className={lc('board')}>
        <div
          className={lc('abs')}
          style={{ '--x': '60', '--y': '64', '--w': '900' }}
        >
          <h2 className={lc('h h80')}>
            <span className={lc('line')}>
              <span>
                {c('loop.play')}{' '}
                <span className={lc('hl')}>{c('loop.save')}</span>{' '}
                {c('loop.return')}
              </span>
            </span>
          </h2>
          <p className={lc('lede', 'mt-[18px]')} data-a="up">
            {c('loop.one_listening_loop_built_around_the_musi')}
          </p>
        </div>
        <div
          className={lc('abs label d-only', 'text-right')}
          data-a="up"
          style={{ '--x': '1196', '--y': '72', '--w': '200' }}
        >
          {c('loop.interface_preview')}
        </div>
        <div
          className={lc('abs card tiltable')}
          data-a="win"
          style={{ '--x': '60', '--y': '254', '--w': '424', '--h': '542' }}
        >
          <div className={lc('col', 'p-[24px] gap-[18px] h-full! box-border')}>
            <div className={lc('row', 'items-start')}>
              <span className={lc('medal')}>
                <svg aria-hidden="true" className={lc('i')}>
                  <use href="#i-play" />
                </svg>
              </span>
              <div>
                <span className={lc('num')}>{'01'}</span>
                <p
                  className={lc(
                    't-title',
                    'font-[600] [font-size:20px] leading-[1.2] font-[family-name:var(--font-display)] mt-[6px]',
                  )}
                >
                  {c('loop.play_without_losing_focus')}
                </p>
                <p className={lc('t-meta')}>
                  {c('loop.the_controls_you_need_within_reach')}
                </p>
              </div>
            </div>
            <div className={lc('soft col grow', 'p-[16px] gap-[14px]')}>
              <div className={lc('row')}>
                <span
                  className={lc(
                    'art',
                    'w-[76px] h-[76px] rounded-[10px] flex-[none]',
                  )}
                ></span>
                <div className={lc('grow')}>
                  <p className={lc('t-title')}>{DEMO_TRACKS.nightSignal}</p>
                  <p className={lc('t-meta')}>{c('common.demo_artist')}</p>
                </div>
                <svg aria-hidden="true" className={lc('i', 'text-accent')}>
                  <use href="#i-heart" />
                </svg>
              </div>
              <div>
                <div className={lc('prog')}>
                  <i className={lc('anim-prog')}></i>
                </div>
                <div className={lc('times')}>
                  <span>{'1:38'}</span>
                  <span>{'3:56'}</span>
                </div>
              </div>
              <div className={lc('transport', 'gap-[22px]')}>
                <svg aria-hidden="true" className={lc('i')}>
                  <use href="#i-prev" />
                </svg>
                <span className={lc('playbtn', 'w-[44px] h-[44px]')}>
                  <svg aria-hidden="true" className={lc('i')}>
                    <use href="#i-pause" />
                  </svg>
                </span>
                <svg aria-hidden="true" className={lc('i')}>
                  <use href="#i-next" />
                </svg>
              </div>
              <span className={lc('grow')}></span>
              <div className={lc('row', 'gap-[18px]')}>
                <div>
                  <span className={lc('label')}>{c('loop.bitrate')}</span>
                  <br />
                  <b className={lc('mono', 'text-foreground')}>{'320 KBPS'}</b>
                </div>
                <div className={lc('grow', 'h-[28px]')}>
                  <canvas className={lc('spec')} data-bars="26"></canvas>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div
          className={lc('abs card tiltable d-only')}
          data-a="win"
          style={{ '--x': '508', '--y': '254', '--w': '424', '--h': '542' }}
        >
          <div className={lc('col', 'p-[24px] gap-[18px] h-full! box-border')}>
            <div className={lc('row', 'items-start')}>
              <span className={lc('medal')}>
                <svg aria-hidden="true" className={lc('i')}>
                  <use href="#i-heart" />
                </svg>
              </span>
              <div>
                <span className={lc('num')}>{'02'}</span>
                <p
                  className={lc(
                    't-title',
                    'font-[600] [font-size:20px] leading-[1.2] font-[family-name:var(--font-display)] mt-[6px]',
                  )}
                >
                  {c('loop.save_what_matters')}
                </p>
                <p className={lc('t-meta')}>
                  {c('loop.build_a_library_that_sounds_more_like_yo')}
                </p>
              </div>
            </div>
            <div className={lc('soft col grow', 'p-[16px] gap-[10px]')}>
              <div className={lc('row')}>
                <span
                  className={lc(
                    'cv',
                    'bg-[image:linear-gradient(135deg,var(--color-purple-500),var(--color-magenta-500))] grid place-items-center text-white',
                  )}
                >
                  <svg aria-hidden="true" className={lc('i')}>
                    <use href="#i-heart" />
                  </svg>
                </span>
                <div className={lc('grow')}>
                  <p className={lc('t-title')}>{c('loop.liked_songs')}</p>
                  <p className={lc('t-meta')}>
                    {c('loop.ready_for_your_next_visit_128')}
                  </p>
                </div>
              </div>
              <div className={lc('qrow')}>
                <span className={lc('cv s cv1')}></span>
                <div className={lc('grow')}>
                  <p className={lc('t-title')}>{DEMO_TRACKS.nightSignal}</p>
                  <p className={lc('t-meta')}>{c('common.demo_artist')}</p>
                </div>
                <svg
                  aria-hidden="true"
                  className={lc('i like-pop', 'text-magenta-500')}
                >
                  <use href="#i-heart" />
                </svg>
              </div>
              <div className={lc('qrow')}>
                <span className={lc('cv s cv3')}></span>
                <div className={lc('grow')}>
                  <p className={lc('t-title')}>{DEMO_TRACKS.staticLines}</p>
                  <p className={lc('t-meta')}>{c('loop.kite_harbor')}</p>
                </div>
                <svg
                  aria-hidden="true"
                  className={lc('i like-pop', 'text-magenta-500')}
                >
                  <use href="#i-heart" />
                </svg>
              </div>
              <div className={lc('qrow')}>
                <span className={lc('cv s cv5')}></span>
                <div className={lc('grow')}>
                  <p className={lc('t-title')}>{c('loop.low_orbit')}</p>
                  <p className={lc('t-meta')}>{c('loop.luma_vale')}</p>
                </div>
                <svg
                  aria-hidden="true"
                  className={lc('i like-pop', 'text-magenta-500')}
                >
                  <use href="#i-heart" />
                </svg>
              </div>
            </div>
          </div>
        </div>
        <div
          className={lc('abs card tiltable d-only')}
          data-a="win"
          style={{ '--x': '956', '--y': '254', '--w': '424', '--h': '542' }}
        >
          <div className={lc('col', 'p-[24px] gap-[18px] h-full! box-border')}>
            <div className={lc('row', 'items-start')}>
              <span className={lc('medal')}>
                <svg aria-hidden="true" className={lc('i')}>
                  <use href="#i-history" />
                </svg>
              </span>
              <div>
                <span className={lc('num')}>{'03'}</span>
                <p
                  className={lc(
                    't-title',
                    'font-[600] [font-size:20px] leading-[1.2] font-[family-name:var(--font-display)] mt-[6px]',
                  )}
                >
                  {c('loop.find_your_way_back')}
                </p>
                <p className={lc('t-meta')}>
                  {c('loop.your_returns_together_in_recents')}
                </p>
              </div>
            </div>
            <div className={lc('soft col grow', 'p-[16px] gap-[6px]')}>
              <div className={lc('row label', 'justify-between')}>
                <span>{c('loop.recents')}</span>
                <span className="tracking-[.04em]">{c('loop.see_all')}</span>
              </div>
              <span className={lc('mono', 'mt-[8px]')}>{c('loop.today')}</span>
              <div className={lc('qrow')}>
                <span className={lc('cv s cv1')}></span>
                <div className={lc('grow')}>
                  <p className={lc('t-title')}>{DEMO_TRACKS.nightSignal}</p>
                  <p className={lc('t-meta')}>{c('loop.played_3')}</p>
                </div>
                <span className={lc('mono')}>{'21:40'}</span>
              </div>
              <div className={lc('qrow')}>
                <span className={lc('cv s cv4')}></span>
                <div className={lc('grow')}>
                  <p className={lc('t-title')}>{DEMO_TRACKS.driftControl}</p>
                  <p className={lc('t-meta')}>{c('loop.from_night_drive')}</p>
                </div>
                <span className={lc('mono')}>{'20:12'}</span>
              </div>
              <span className={lc('mono', 'mt-[8px]')}>
                {c('loop.yesterday')}
              </span>
              <div className={lc('qrow')}>
                <span className={lc('cv s cv2')}></span>
                <div className={lc('grow')}>
                  <p className={lc('t-title')}>{DEMO_TRACKS.echoesInMotion}</p>
                  <p className={lc('t-meta')}>{c('loop.album')}</p>
                </div>
                <span className={lc('mono')}>{'23:05'}</span>
              </div>
            </div>
          </div>
        </div>
        <div
          className={lc('abs row d-only', 'justify-between')}
          style={{ '--x': '60', '--y': '830', '--w': '1320' }}
        >
          <span className={lc('disc')}>
            {c('loop.product_preview_demonstration_library')}
          </span>
          <span className={lc('sig')}>{c('common.music_lives_on')}</span>
        </div>
      </div>
    </section>
  )
}

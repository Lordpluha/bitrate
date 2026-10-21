'use client'

import { lc } from '../../lib/styles/lc'
import { DEMO_TRACKS } from '../../model/demoTracks'
import { useLandingCopy } from '../../model/useLandingCopy'

/** Scene "Devices" — ported from the motion prototype; the landing engine animates it after mount. */
export const SceneDevices = () => {
  const c = useLandingCopy()
  return (
    <section
      aria-label={c('devices.same_queue_new_scene')}
      className={lc('scene')}
      data-label="Devices"
      id="devices"
    >
      <div className={lc('board')}>
        <div
          className={lc('abs d-only')}
          style={{ '--x': '0', '--y': '626', '--w': '380', '--h': '274' }}
        >
          <div className={lc('horizon', 'h-full')}></div>
        </div>
        <div
          className={lc('abs')}
          style={{ '--x': '48', '--y': '120', '--w': '380' }}
        >
          <div className={lc('eyebrow', 'mb-[18px]')} data-a="up">
            {c('devices.keep_the_session_going')}
          </div>
          <h2 className={lc('h h54')}>
            <span className={lc('line')}>
              <span>{c('devices.same_queue')}</span>
            </span>
            <span className={lc('line')}>
              <span className={lc('hl')}>{c('devices.new_scene')}</span>
            </span>
          </h2>
          <p className={lc('lede s', 'mt-[22px]')} data-a="up">
            {c('devices.move_playback_between_devices_with_bitra')}
          </p>
          <div className={lc('col d-only', 'mt-[34px] gap-[20px]')}>
            <div className={lc('row')} data-a="up">
              <svg aria-hidden="true" className={lc('i', 'text-accent')}>
                <use href="#i-phone" />
              </svg>
              <div>
                <p className={lc('t-title')}>{c('devices.bitrate_connect')}</p>
                <p className={lc('t-meta')}>
                  {c('devices.move_playback_to_any_device')}
                </p>
              </div>
            </div>
            <div className={lc('row')} data-a="up">
              <svg aria-hidden="true" className={lc('i', 'text-accent')}>
                <use href="#i-users" />
              </svg>
              <div>
                <p className={lc('t-title')}>{c('devices.jam')}</p>
                <p className={lc('t-meta')}>{c('devices.listen_together')}</p>
              </div>
            </div>
          </div>
        </div>
        <div
          className={lc('abs persp d-only')}
          style={{ '--x': '553', '--y': '116', '--w': '855' }}
        >
          <div className={lc('win', 'h-[716px]')} data-a="win">
            <div className={lc('wbar')}>
              <span className={lc('dots3')}>
                <i></i>
                <i></i>
                <i></i>
              </span>
              <span className={lc('grow')}></span>
              <span className={lc('live')}>
                <i></i>
                <span
                  className={lc('glitch glitch-auto')}
                  data-text={c('devices.jam_live')}
                >
                  {c('devices.jam_live')}
                </span>
              </span>
            </div>
            <div
              className={lc(
                'row',
                'items-stretch gap-[18px] p-[0_18px_18px] h-[648px]! box-border',
              )}
            >
              <div
                className={lc(
                  'col',
                  'w-[126px] gap-[16px] pt-[18px] [font-size:12px] text-muted-foreground',
                )}
              >
                <span className={lc('row', 'gap-[8px] text-foreground')}>
                  <svg aria-hidden="true" className={lc('i')}>
                    <use href="#i-home" />
                  </svg>
                  {c('devices.home')}
                </span>
                <span className={lc('row', 'gap-[8px]')}>
                  <svg aria-hidden="true" className={lc('i')}>
                    <use href="#i-lib" />
                  </svg>
                  {c('devices.library')}
                </span>
                <span className={lc('row', 'gap-[8px]')}>
                  <svg aria-hidden="true" className={lc('i')}>
                    <use href="#i-users" />
                  </svg>
                  {c('devices.jam')}
                </span>
              </div>
              <div
                className={lc('col grow', 'pt-[18px] gap-[14px] pl-[120px]')}
              >
                <div className={lc('row')}>
                  <div className={lc('grow')}>
                    <span className={lc('label', 'text-accent')}>
                      {c('devices.jam_2')}
                    </span>
                    <p
                      className={lc(
                        't-title',
                        'font-[700] [font-size:30px] leading-[1.1] font-[family-name:var(--font-display)] mt-[6px]',
                      )}
                    >
                      {c('devices.jam_after_hours')}
                    </p>
                  </div>
                  <div className={lc('avs listeners')}>
                    <span className={lc('av', 'bg-purple-500 bg-none')}>
                      {c('devices.mr')}
                    </span>
                    <span className={lc('av', 'bg-magenta-500 bg-none')}>
                      {c('devices.jp')}
                    </span>
                    <span className={lc('av', 'bg-blue-400 bg-none')}>
                      {c('devices.as')}
                    </span>
                    <span className={lc('av', 'bg-neutral-700 bg-none')}>
                      {'+2'}
                    </span>
                  </div>
                </div>
                <div className={lc('row', 'gap-[18px] items-stretch')}>
                  <div
                    className={lc('art', 'w-[200px] h-[200px] flex-[none]')}
                  ></div>
                  <div className={lc('col grow', 'gap-[10px]')}>
                    <span className={lc('label')}>
                      {c('devices.now_playing_in_sync')}
                    </span>
                    <p
                      className={lc(
                        't-title',
                        'font-[600] [font-size:24px] leading-[1.1] font-[family-name:var(--font-display)]',
                      )}
                    >
                      {DEMO_TRACKS.nightSignal}
                    </p>
                    <p className={lc('t-meta')}>{c('common.demo_artist')}</p>
                    <span className={lc('grow')}></span>
                    <div className={lc('prog')}>
                      <i className={lc('sync-bar')}></i>
                    </div>
                    <div className={lc('times')}>
                      <span>{'1:38'}</span>
                      <span>{'3:56'}</span>
                    </div>
                  </div>
                </div>
                <span className={lc('label')}>
                  {c('devices.up_next_shared_queue')}
                </span>
                <div className={lc('qrow')}>
                  <span className={lc('cv s cv2')}></span>
                  <div className={lc('grow')}>
                    <p className={lc('t-title')}>
                      {DEMO_TRACKS.echoesInMotion}
                    </p>
                    <p className={lc('t-meta')}>{c('devices.added_by_maya')}</p>
                  </div>
                  <span className={lc('mono')}>{'4:21'}</span>
                </div>
                <div className={lc('qrow')}>
                  <span className={lc('cv s cv3')}></span>
                  <div className={lc('grow')}>
                    <p className={lc('t-title')}>{DEMO_TRACKS.staticLines}</p>
                    <p className={lc('t-meta')}>
                      {c('devices.added_by_jonah')}
                    </p>
                  </div>
                  <span className={lc('mono')}>{'3:47'}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
        <svg
          aria-hidden="true"
          className={lc('abs d-only', 'overflow-visible')}
          height="160"
          style={{ '--x': '560', '--y': '578', '--w': '130' }}
          viewBox="0 0 130 160"
          width="130"
        >
          <path
            d="M8 150 C 40 140, 70 90, 122 6"
            fill="none"
            id="devLink"
            stroke="var(--accent)"
            strokeDasharray="4 6"
            strokeWidth="2"
          />
        </svg>
        <div
          className={lc('abs persp d-only')}
          style={{ '--x': '379', '--y': '196', '--w': '245' }}
        >
          <div className={lc('phone', 'h-[595px] box-border')} data-a="win">
            <div className={lc('row mono', 'justify-between')}>
              <span className="text-foreground">{'9:41'}</span>
              <span>{'\u25cf\u25cf\u25cf'}</span>
            </div>
            <div className={lc('row', 'mt-[22px] gap-[8px]')}>
              <b className="font-[600] [font-size:14px] leading-[1] font-[family-name:var(--font-display)]">
                {c('devices.bitrate')}
              </b>
            </div>
            <span className={lc('pill', 'inline-block mt-[14px]')}>
              {c('devices.jam_after_hours')}
            </span>
            <div className={lc('art', 'h-[190px] mt-[16px]')}></div>
            <p
              className={lc(
                't-title',
                'font-[600] [font-size:18px] leading-[1.1] font-[family-name:var(--font-display)] mt-[16px]',
              )}
            >
              {DEMO_TRACKS.nightSignal}
            </p>
            <p className={lc('t-meta')}>{c('common.demo_artist')}</p>
            <div className={lc('prog', 'mt-[16px]')}>
              <i className={lc('sync-bar')}></i>
            </div>
            <div className={lc('times')}>
              <span>{'1:38'}</span>
              <span>{'3:56'}</span>
            </div>
            <div className={lc('transport', 'mt-[16px] gap-[20px]')}>
              <svg aria-hidden="true" className={lc('i')}>
                <use href="#i-prev" />
              </svg>
              <span className={lc('playbtn', 'w-[46px] h-[46px]')}>
                <svg aria-hidden="true" className={lc('i')}>
                  <use href="#i-pause" />
                </svg>
              </span>
              <svg aria-hidden="true" className={lc('i')}>
                <use href="#i-next" />
              </svg>
            </div>
          </div>
        </div>
        <div
          className={lc('abs card')}
          data-a="win"
          style={{ '--x': '365', '--y': '682', '--w': '272' }}
        >
          <div className={lc('col', 'p-[16px] gap-[10px]')}>
            <p
              className={lc(
                't-title',
                'font-[600] [font-size:16px] leading-[1] font-[family-name:var(--font-display)]',
              )}
            >
              {c('devices.bitrate_connect')}
            </p>
            <div className={lc('row')}>
              <svg aria-hidden="true" className={lc('i', 'text-accent')}>
                <use href="#i-phone" />
              </svg>
              <div className={lc('grow')}>
                <p className={lc('t-title', '[font-size:12px]')}>
                  {c('devices.this_phone')}
                </p>
                <p className={lc('t-meta', '[font-size:10px]')}>
                  {c('devices.ready_to_play')}
                </p>
              </div>
            </div>
            <div className={lc('row')}>
              <svg
                aria-hidden="true"
                className={lc('i', 'text-muted-foreground')}
              >
                <use href="#i-laptop" />
              </svg>
              <div className={lc('grow')}>
                <p className={lc('t-title', '[font-size:12px]')}>
                  {c('devices.desktop_playing')}
                </p>
              </div>
              <span className={lc('live ok')}>
                <i></i>
              </span>
            </div>
            <a
              className={lc('btn btn-primary btn-sm magnetic')}
              href="#devices"
            >
              {c('devices.move_playback_to_this_phone')}
            </a>
          </div>
        </div>
        <div
          className={lc('abs row d-only', 'justify-between')}
          style={{ '--x': '48', '--y': '854', '--w': '1360' }}
        >
          <span className={lc('sig')}>{c('common.music_lives_on')}</span>
          <span className={lc('disc')}>
            {c('common.feature_concept_demo_content')}
          </span>
        </div>
      </div>
    </section>
  )
}

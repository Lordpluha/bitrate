'use client'

import { lc } from '../../lib/styles/lc'
import { useLandingCopy } from '../../model/useLandingCopy'

/** Scene "Library" — ported from the motion prototype; the landing engine animates it after mount. */
export const SceneLibrary = () => {
  const c = useLandingCopy()
  return (
    <section
      aria-label={c('library.a_library_with_a_memory')}
      className={lc('scene')}
      data-label="Library"
      id="library"
    >
      <div className={lc('board')}>
        <div
          className={lc('abs')}
          style={{ '--x': '48', '--y': '104', '--w': '700' }}
        >
          <div className={lc('eyebrow', 'mb-[14px]')} data-a="up">
            {c('library.your_collection_connected')}
          </div>
          <h2 className={lc('h h56')}>
            <span className={lc('line')}>
              <span>
                {c('library.a_library_with')}{' '}
                <span className={lc('hl')}>{c('library.a_memory')}</span>
              </span>
            </span>
          </h2>
          <p className={lc('lede', 'mt-[12px]')} data-a="up">
            {c('library.find_it_faster_keep_it_organised_bring_a')}
          </p>
        </div>
        <div
          className={lc('abs persp')}
          style={{ '--x': '32', '--y': '270', '--w': '1376' }}
        >
          <div className={lc('win')} data-a="win">
            <div className={lc('row', 'items-stretch gap-0 h-[570px]!')}>
              <div
                className={lc(
                  'col d-only',
                  'w-[224px] p-[18px] gap-[6px] [border-right:1px_solid_var(--border)] box-border',
                )}
              >
                <span className={lc('label')}>{c('library.your_library')}</span>
                <div className={lc('row', 'gap-[6px] m-[6px_0_4px]')}>
                  <span className={lc('chip on')}>
                    {c('library.playlists')}
                  </span>
                  <span className={lc('chip')}>{c('library.artists')}</span>
                </div>
                <div className={lc('qrow now')}>
                  <span className={lc('cv s cv2')}></span>
                  <div>
                    <p className={lc('t-title')}>{c('library.night_drive')}</p>
                    <p className={lc('t-meta')}>{c('library.24_tracks')}</p>
                  </div>
                </div>
                <div className={lc('qrow')}>
                  <span
                    className={lc(
                      'cv s',
                      'bg-[image:linear-gradient(135deg,var(--color-purple-500),var(--color-magenta-500))]',
                    )}
                  ></span>
                  <div>
                    <p className={lc('t-title')}>{c('library.liked_songs')}</p>
                    <p className={lc('t-meta')}>{c('library.128_tracks')}</p>
                  </div>
                </div>
                <div className={lc('qrow')}>
                  <span className={lc('cv s cv3')}></span>
                  <div>
                    <p className={lc('t-title')}>{c('library.rain_drive')}</p>
                    <p className={lc('t-meta')}>{c('library.31_tracks')}</p>
                  </div>
                </div>
                <div className={lc('qrow')}>
                  <span className={lc('cv s cv4')}></span>
                  <div>
                    <p className={lc('t-title')}>
                      {c('library.ambient_mornings')}
                    </p>
                    <p className={lc('t-meta')}>{c('library.18_tracks')}</p>
                  </div>
                </div>
                <span className={lc('grow')}></span>
                <p className={lc('t-meta', '[font-size:11px]')}>
                  {c('library.browse_previous_versions_bring_the_right')}
                </p>
              </div>
              <div className={lc('col grow d-only', 'p-[18px_22px] gap-[4px]')}>
                <div className={lc('row', 'mb-[8px]')}>
                  <div
                    className={lc(
                      'soft row grow',
                      'p-[10px_14px] gap-[10px] rounded-[10px]',
                    )}
                  >
                    <svg
                      aria-hidden="true"
                      className={lc('i', 'w-[15px]! text-muted-foreground')}
                    >
                      <use href="#i-search" />
                    </svg>
                    <span id="libQ">{c('library.night')}</span>
                    <span className="text-accent">{'\u258d'}</span>
                  </div>
                  <span className={lc('chip on')}>{c('library.tracks')}</span>
                  <span className={lc('chip')}>{c('library.albums')}</span>
                </div>
                <div className={lc('lrow hd')}>
                  <span>{'#'}</span>
                  <span></span>
                  <span>{c('library.title')}</span>
                  <span>{c('library.album')}</span>
                  <span>{c('library.time')}</span>
                </div>
                <div className={lc('lrow lres')}>
                  <span className={lc('mono')}>{'1'}</span>
                  <span className={lc('cv s cv1')}></span>
                  <span>
                    <b>{c('library.night_signal')}</b>
                    <br />
                    <span className={lc('t-meta')}>
                      {c('library.mira_sol')}
                    </span>
                  </span>
                  <span className={lc('t-meta')}>
                    {c('library.night_signal')}
                  </span>
                  <span className={lc('mono')}>{'3:56'}</span>
                </div>
                <div className={lc('lrow lres')}>
                  <span className={lc('mono')}>{'2'}</span>
                  <span className={lc('cv s cv2')}></span>
                  <span>
                    <b>{c('library.night_drive_theme')}</b>
                    <br />
                    <span className={lc('t-meta')}>
                      {c('library.kite_harbor')}
                    </span>
                  </span>
                  <span className={lc('t-meta')}>
                    {c('library.harbor_lights')}
                  </span>
                  <span className={lc('mono')}>{'4:02'}</span>
                </div>
                <div className={lc('lrow lres')}>
                  <span className={lc('mono')}>{'3'}</span>
                  <span className={lc('cv s cv4')}></span>
                  <span>
                    <b>{c('library.nightfall_static')}</b>
                    <br />
                    <span className={lc('t-meta')}>
                      {c('library.nova_the_static')}
                    </span>
                  </span>
                  <span className={lc('t-meta')}>{c('library.afterglow')}</span>
                  <span className={lc('mono')}>{'3:21'}</span>
                </div>
                <div className={lc('lrow lres')}>
                  <span className={lc('mono')}>{'4'}</span>
                  <span className={lc('cv s cv3')}></span>
                  <span>
                    <b>{c('library.midnight_echoes')}</b>
                    <br />
                    <span className={lc('t-meta')}>
                      {c('library.lumen_choir')}
                    </span>
                  </span>
                  <span className={lc('t-meta')}>
                    {c('library.echoes_in_motion')}
                  </span>
                  <span className={lc('mono')}>{'4:48'}</span>
                </div>
                <div className={lc('lrow lres')}>
                  <span className={lc('mono')}>{'5'}</span>
                  <span className={lc('cv s cv5')}></span>
                  <span>
                    <b>{c('library.low_orbit_night_mix')}</b>
                    <br />
                    <span className={lc('t-meta')}>
                      {c('library.luma_vale')}
                    </span>
                  </span>
                  <span className={lc('t-meta')}>{c('library.low_orbit')}</span>
                  <span className={lc('mono')}>{'3:30'}</span>
                </div>
              </div>
              <div
                className={lc(
                  'col',
                  'w-[318px] p-[20px] gap-[6px] [border-left:1px_solid_var(--border)] box-border',
                )}
              >
                <div className={lc('row')}>
                  <svg aria-hidden="true" className={lc('i', 'text-accent')}>
                    <use href="#i-history" />
                  </svg>
                  <div>
                    <p className={lc('t-title')}>{c('library.night_drive')}</p>
                    <p className={lc('t-meta')}>
                      {c('library.playlist_history')}
                    </p>
                  </div>
                </div>
                <div className="relative mt-[8px]">
                  <span className={lc('vline')}></span>
                  <div className={lc('vrow')}>
                    <span className={lc('dot')}></span>
                    <div>
                      <p className={lc('t-title')}>{c('library.today')}</p>
                      <p className={lc('t-meta')}>{c('library.24_tracks')}</p>
                    </div>
                    <span className={lc('pill')}>{c('library.current')}</span>
                  </div>
                  <div className={lc('vrow sel')}>
                    <span className={lc('dot')}></span>
                    <div>
                      <p className={lc('t-title')}>{c('library.yesterday')}</p>
                      <p className={lc('t-meta')}>{c('library.21_tracks')}</p>
                    </div>
                    <span className={lc('pill acc')}>
                      {c('library.selected')}
                    </span>
                  </div>
                  <div className={lc('vrow')}>
                    <span className={lc('dot')}></span>
                    <div>
                      <p className={lc('t-title')}>{c('library.sep_02')}</p>
                      <p className={lc('t-meta')}>{c('library.18_tracks')}</p>
                    </div>
                    <span className={lc('pill')}>{c('library.saved')}</span>
                  </div>
                </div>
                <div
                  className={lc(
                    'soft',
                    'p-[12px] [font-size:12px] text-muted-foreground',
                  )}
                >
                  {c('library.changes_in_this_version')}
                  <br />
                  <b className="text-success">{c('library.3_tracks_added')}</b>{' '}
                  {'\u00b7'}{' '}
                  <b className="text-magenta-500">{c('library.1_removed')}</b>
                </div>
                <span className={lc('grow')}></span>
                <a
                  className={lc('btn btn-primary btn-sm magnetic')}
                  href="#library"
                >
                  {c('library.restore_this_version')}
                </a>
                <p className={lc('t-meta', 'text-center')}>
                  {c('library.your_current_version_stays_in_history')}
                </p>
              </div>
            </div>
          </div>
        </div>
        <div
          className={lc('abs row d-only', 'justify-between')}
          style={{ '--x': '48', '--y': '854', '--w': '1360' }}
        >
          <span className={lc('sig')}>{c('library.music_lives_on')}</span>
          <span className={lc('disc')}>
            {c('library.feature_concept_demo_content')}
          </span>
        </div>
      </div>
    </section>
  )
}

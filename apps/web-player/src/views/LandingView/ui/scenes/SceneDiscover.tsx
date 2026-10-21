'use client'

import { lc } from '../../lib/styles/lc'
import { DEMO_TRACKS } from '../../model/demoTracks'
import { useLandingCopy } from '../../model/useLandingCopy'

/** Scene "Discover" — ported from the motion prototype; the landing engine animates it after mount. */
export const SceneDiscover = () => {
  const c = useLandingCopy()
  return (
    <section
      aria-label={c('discover.follow_the_sound')}
      className={lc('scene')}
      data-label="Discover"
      id="discover"
    >
      <div className={lc('board')}>
        <div
          className={lc('abs card d-only')}
          data-a="win"
          style={{ '--x': '24', '--y': '112', '--w': '82', '--h': '600' }}
        >
          <div className={lc('rail-nav')}>
            <span>
              <svg aria-hidden="true" className={lc('i')}>
                <use href="#i-home" />
              </svg>
              {c('discover.home')}
            </span>
            <span className={lc('on')}>
              <svg aria-hidden="true" className={lc('i', 'text-accent')}>
                <use href="#i-compass" />
              </svg>
              {c('discover.discover')}
            </span>
            <span>
              <svg aria-hidden="true" className={lc('i')}>
                <use href="#i-lib" />
              </svg>
              {c('discover.library')}
            </span>
            <span>
              <svg aria-hidden="true" className={lc('i')}>
                <use href="#i-layers" />
              </svg>
              {c('discover.playlists')}
            </span>
            <span>
              <svg aria-hidden="true" className={lc('i')}>
                <use href="#i-user" />
              </svg>
              {c('discover.profile')}
            </span>
          </div>
        </div>
        <div
          className={lc('abs')}
          style={{ '--x': '144', '--y': '98', '--w': '640' }}
        >
          <div className={lc('eyebrow', 'mb-[14px]')} data-a="up">
            {c('discover.discover_the_connections')}
          </div>
          <h2 className={lc('h h54')}>
            <span className={lc('line')}>
              <span>
                {c('discover.follow_the')}{' '}
                <span className={lc('hl')}>{c('discover.sound')}</span>
              </span>
            </span>
          </h2>
          <p className={lc('lede s', 'mt-[12px]')} data-a="up">
            {c('discover.explore_the_artists_influences_and_scene')}
          </p>
        </div>
        <div
          className={lc('abs legend d-only')}
          data-a="up"
          style={{ '--x': '666', '--y': '228', '--w': '420' }}
        >
          <span>
            <i className="bg-accent! bg-none!"></i>
            {c('discover.influenced_by')}
          </span>
          <span>
            <i className="bg-magenta-500! bg-none!"></i>
            {c('discover.similar_sound')}
          </span>
          <span>
            <i className="bg-info! bg-none!"></i>
            {c('discover.shared_scene')}
          </span>
        </div>
        <div
          className={lc('abs graph d-only')}
          style={{ '--x': '132', '--y': '262', '--w': '932', '--h': '447' }}
        >
          <svg
            aria-hidden="true"
            className="absolute inset-0!"
            height="447"
            viewBox="0 0 932 447"
            width="932"
          >
            <path
              className={lc('p-inf')}
              d="M540 261 C 470 160, 400 90, 336 38"
            />
            <path
              className={lc('p-scn')}
              d="M540 261 C 650 170, 760 90, 798 38"
            />
            <path
              className={lc('p-sim')}
              d="M540 261 C 400 230, 250 200, 113 182"
            />
            <path
              className={lc('p-sim')}
              d="M540 261 C 420 300, 260 340, 127 353"
            />
            <path
              className={lc('p-sim')}
              d="M540 261 C 660 220, 760 160, 828 142"
            />
            <path
              className={lc('p-scn')}
              d="M540 261 C 650 280, 760 300, 829 305"
            />
            <path
              className={lc('p-scn')}
              d="M540 261 C 530 320, 500 380, 486 408"
            />
            <path
              className={lc('p-sim')}
              d="M540 261 C 640 330, 760 390, 822 407"
            />
          </svg>
          <span className={lc('node', 'left-[216px] top-0')}>
            <span
              className={lc(
                'av',
                'bg-[image:linear-gradient(135deg,var(--color-purple-500),var(--color-blue-500))]',
              )}
            >
              {c('discover.ms')}
            </span>
            <span>
              <b>{c('discover.mira_sol')}</b>
              <small>{c('discover.influence_dream_pop')}</small>
            </span>
          </span>
          <span className={lc('node', 'left-[668px] top-0')}>
            <span
              className={lc(
                'av',
                'bg-[image:linear-gradient(135deg,var(--color-blue-500),var(--color-blue-400))]',
              )}
            >
              {c('discover.np')}
            </span>
            <span>
              <b>{c('discover.night_pulse_collective')}</b>
              <small>{c('discover.shared_scene')}</small>
            </span>
          </span>
          <span className={lc('node', 'left-0 top-[144px]')}>
            <span
              className={lc(
                'av',
                'bg-[image:linear-gradient(135deg,var(--color-magenta-500),var(--color-purple-500))]',
              )}
            >
              {c('discover.sb')}
            </span>
            <span>
              <b>{c('discover.static_bloom')}</b>
              <small>{c('discover.similar_sound')}</small>
            </span>
          </span>
          <span className={lc('node', 'left-[14px] top-[315px]')}>
            <span
              className={lc(
                'av',
                'bg-[image:linear-gradient(135deg,var(--color-magenta-500),var(--color-amber-500))]',
              )}
            >
              {c('discover.as')}
            </span>
            <span>
              <b>{c('discover.auren_sky')}</b>
              <small>{c('discover.similar_sound')}</small>
            </span>
          </span>
          <span className={lc('node', 'left-[724px] top-[104px]')}>
            <span
              className={lc(
                'av',
                'bg-[image:linear-gradient(135deg,var(--color-magenta-500),var(--color-purple-800))]',
              )}
            >
              {c('discover.vc')}
            </span>
            <span>
              <b>{c('discover.velvet_coast')}</b>
              <small>{c('discover.similar_sound')}</small>
            </span>
          </span>
          <span className={lc('node', 'left-[726px] top-[267px]')}>
            <span
              className={lc(
                'av',
                'bg-[image:linear-gradient(135deg,var(--color-blue-400),var(--color-purple-900))]',
              )}
            >
              {c('discover.kh')}
            </span>
            <span>
              <b>{c('discover.kite_halo')}</b>
              <small>{c('discover.shared_scene')}</small>
            </span>
          </span>
          <span className={lc('node', 'left-[357px] top-[370px]')}>
            <span
              className={lc(
                'av',
                'bg-[image:linear-gradient(135deg,var(--color-blue-700),var(--color-purple-500))]',
              )}
            >
              {c('discover.ad')}
            </span>
            <span>
              <b>{c('discover.afterhours_district')}</b>
              <small>{c('discover.shared_scene')}</small>
            </span>
          </span>
          <span className={lc('node', 'left-[712px] top-[369px]')}>
            <span
              className={lc(
                'av',
                'bg-[image:linear-gradient(135deg,var(--color-purple-600),var(--color-magenta-500))]',
              )}
            >
              {c('discover.gh')}
            </span>
            <span>
              <b>{c('discover.glass_harbour')}</b>
              <small>{c('discover.similar_sound')}</small>
            </span>
          </span>
          <span
            className={lc(
              'node focus',
              'left-[468px] top-[174px] w-[144px] h-[174px] box-border',
            )}
          >
            <span
              className={lc(
                'av',
                'bg-[image:linear-gradient(135deg,var(--color-purple-400),var(--color-magenta-500))]',
              )}
            >
              {c('discover.lv')}
            </span>
            <b>{c('discover.luma_vale')}</b>
            <small>{c('discover.you_are_here')}</small>
          </span>
          <span className={lc('tag', 'left-[344px] top-[100px]')}>
            {c('discover.influenced_by')}
          </span>
          <span className={lc('tag', 'left-[248px] top-[210px]')}>
            {c('discover.similar_sound')}
          </span>
          <span className={lc('tag', 'left-[619px] top-[313px]')}>
            {c('discover.shared_scene')}
          </span>
          <span className={lc('tag', 'left-[599px] top-[147px]')}>
            {c('discover.similar_sound')}
          </span>
        </div>
        <div
          className={lc('abs card')}
          data-a="win"
          style={{ '--x': '1090', '--y': '104', '--w': '318' }}
        >
          <div className={lc('col', 'p-[20px] gap-[12px]')}>
            <div className={lc('art d-only', 'h-[170px]')}></div>
            <p
              className={lc(
                't-title',
                'font-[700] [font-size:29px] leading-[1] font-[family-name:var(--font-display)]',
              )}
            >
              {c('discover.luma_vale')}
            </p>
            <div className={lc('row', 'gap-[8px]')}>
              <span className={lc('chip')}>{c('discover.electronic')}</span>
              <span className={lc('chip')}>{c('discover.dream_pop')}</span>
              <span className={lc('chip')}>{c('discover.night')}</span>
            </div>
            <p className={lc('mono', 'text-accent')}>
              {c('discover.illustrative_connection')}
            </p>
            <p className={lc('t-title')}>{c('discover.why_this_connection')}</p>
            <p className={lc('t-meta', '[font-size:14px]')}>
              {c('discover.dreamlike_synth_textures_spacious_vocals')}
            </p>
            <p className={lc('t-title d-only', 'mt-[6px]')}>
              {c('discover.top_tracks')}
            </p>
            <div className={lc('qrow d-only', 'p-[6px_0]')}>
              <span className={lc('cv s cv1')}></span>
              <div className={lc('grow')}>
                <p className={lc('t-title', '[font-size:12px]')}>
                  {DEMO_TRACKS.nightSignal}
                </p>
                <p className={lc('t-meta')}>{'3:56'}</p>
              </div>
            </div>
            <div className={lc('qrow d-only', 'p-[6px_0]')}>
              <span className={lc('cv s cv3')}></span>
              <div className={lc('grow')}>
                <p className={lc('t-title', '[font-size:12px]')}>
                  {c('discover.glass_horizon')}
                </p>
                <p className={lc('t-meta')}>{'4:28'}</p>
              </div>
            </div>
            <a
              className={lc('btn btn-primary btn-sm magnetic d-only')}
              href="#discover"
            >
              {c('discover.explore_this_artist')}{' '}
              <svg aria-hidden="true" className={lc('i')}>
                <use href="#i-arrow" />
              </svg>
            </a>
          </div>
        </div>
        <div
          className={lc('abs card route d-only')}
          data-a="win"
          style={{ '--x': '132', '--y': '736', '--w': '932', '--h': '75' }}
        >
          <div>
            <p className={lc('t-title')}>{c('discover.your_explored_route')}</p>
            <p className={lc('t-meta')}>
              {c('discover.3_steps_follow_the_journey')}
            </p>
          </div>
          <span className={lc('grow')}></span>
          <span className={lc('n')}>{'1'}</span>
          <b>{c('discover.luma_vale')}</b>
          <svg aria-hidden="true" className={lc('i', 'text-text-subdued')}>
            <use href="#i-arrow" />
          </svg>
          <span className={lc('n')}>{'2'}</span>
          <b>{c('discover.mira_sol')}</b>
          <svg aria-hidden="true" className={lc('i', 'text-text-subdued')}>
            <use href="#i-arrow" />
          </svg>
          <span className={lc('n')}>{'3'}</span>
          <b>{c('discover.night_pulse_collective')}</b>
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

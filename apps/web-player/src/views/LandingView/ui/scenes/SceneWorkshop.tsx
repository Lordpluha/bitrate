'use client'

import { lc } from '../../lib/styles/lc'
import { useLandingCopy } from '../../model/useLandingCopy'

/** Scene "Workshop" — ported from the motion prototype; the landing engine animates it after mount. */
export const SceneWorkshop = () => {
  const c = useLandingCopy()
  return (
    <section
      aria-label={c('workshop.start_with_a_feeling_finish_with_your_pl')}
      className={lc('scene')}
      data-label="Workshop"
      id="workshop"
    >
      <div className={lc('board')}>
        <div
          className={lc(
            'abs row d-only',
            '[border-bottom:1px_solid_var(--border)] pb-[14px]',
          )}
          data-a="up"
          style={{ '--x': '60', '--y': '96', '--w': '1320' }}
        >
          <span className={lc('mono', 'text-foreground')}>
            {c('workshop.bitrate')}
          </span>
          <span className={lc('t-meta grow')}>
            {c('workshop.more_music_more_you')}
          </span>
          <span className={lc('label')}>
            {c('workshop.playlist_builder_concept')}
          </span>
        </div>
        <div
          className={lc('abs')}
          style={{ '--x': '60', '--y': '186', '--w': '380' }}
        >
          <h2 className={lc('h h48')}>
            <span className={lc('line')}>
              <span>{c('workshop.start_with_a')}</span>
            </span>
            <span className={lc('line')}>
              <span>{c('workshop.feeling_finish')}</span>
            </span>
            <span className={lc('line')}>
              <span className={lc('hl')}>
                {c('workshop.with_your_playlist')}
              </span>
            </span>
          </h2>
          <p className={lc('lede s', 'mt-[22px]')} data-a="up">
            {c('workshop.describe_the_session_compare_a_few_track')}
          </p>
          <div className={lc('col d-only', 'mt-[34px] gap-[20px]')}>
            <div className={lc('row', 'items-start')} data-a="up">
              <span className={lc('medal', 'w-[44px] h-[44px] rounded-[12px]')}>
                <svg aria-hidden="true" className={lc('i')}>
                  <use href="#i-zap" />
                </svg>
              </span>
              <div>
                <p className={lc('t-title')}>
                  {c('workshop.turn_intent_into_music')}
                </p>
                <p className={lc('t-meta')}>
                  {c('workshop.describe_the_mood_the_activity_or_the_mo')}
                </p>
              </div>
            </div>
            <div className={lc('row', 'items-start')} data-a="up">
              <span className={lc('medal', 'w-[44px] h-[44px] rounded-[12px]')}>
                <svg aria-hidden="true" className={lc('i')}>
                  <use href="#i-layers" />
                </svg>
              </span>
              <div>
                <p className={lc('t-title')}>
                  {c('workshop.compare_and_refine')}
                </p>
                <p className={lc('t-meta')}>
                  {c('workshop.rank_a_few_tracks_swap_the_ones_that_do')}
                </p>
              </div>
            </div>
            <div className={lc('row', 'items-start')} data-a="up">
              <span className={lc('medal', 'w-[44px] h-[44px] rounded-[12px]')}>
                <svg aria-hidden="true" className={lc('i')}>
                  <use href="#i-sliders" />
                </svg>
              </span>
              <div>
                <p className={lc('t-title')}>
                  {c('workshop.you_stay_in_control')}
                </p>
                <p className={lc('t-meta')}>
                  {c('workshop.approve_reorder_or_replace_nothing_is_fi')}
                </p>
              </div>
            </div>
          </div>
        </div>
        <div
          className={lc('abs persp')}
          style={{ '--x': '466', '--y': '166', '--w': '934' }}
        >
          <div className={lc('win')} data-a="win">
            <div className={lc('wbar d-only', 'h-[62px]')}>
              <span className={lc('dots3')}>
                <i></i>
                <i></i>
                <i></i>
              </span>
              <span
                className={lc(
                  'grow',
                  'text-foreground tracking-[.04em] [font-size:12px]',
                )}
              >
                {c('workshop.workshop_untitled_session')}
              </span>
              <span className={lc('pill')}>{c('workshop.draft')}</span>
            </div>
            <div
              className={lc(
                'd-only',
                'p-[18px_60px] [border-bottom:1px_solid_var(--border)]',
              )}
            >
              <div className={lc('steps', 'grid-cols-[repeat(4,1fr)]')}>
                <span className={lc('track')}></span>
                <span
                  className={lc('fill', '[transform:scaleX(.66)]!')}
                  id="wsFill"
                ></span>
                <div className={lc('step done')}>
                  <b>{'\u2713'}</b>
                  {c('workshop.describe')}
                </div>
                <div className={lc('step done')}>
                  <b>{'\u2713'}</b>
                  {c('workshop.shape')}
                </div>
                <div className={lc('step now')}>
                  <b>{'3'}</b>
                  {c('workshop.compare')}
                </div>
                <div className={lc('step')}>
                  <b>{'4'}</b>
                  {c('workshop.approve')}
                </div>
              </div>
            </div>
            <div className={lc('row', 'items-stretch gap-[18px] p-[20px]')}>
              <div className={lc('col d-only', 'w-[300px] gap-[12px]')}>
                <span className={lc('label')}>
                  {c('workshop.your_session')}
                </span>
                <div
                  className={lc(
                    'soft',
                    'p-[14px] [font-size:14px] min-h-[96px]',
                  )}
                >
                  <span id="typed">{c('workshop.prompt')}</span>
                  <span className="text-accent">{'\u258d'}</span>
                </div>
                <div className={lc('row', 'flex-wrap gap-[8px]')}>
                  <span className={lc('chip on')}>{c('workshop.calm')}</span>
                  <span className={lc('chip')}>{c('workshop.late_night')}</span>
                  <span className={lc('chip on')}>{'45 min'}</span>
                  <span className={lc('chip')}>
                    {c('workshop.from_liked_songs')}
                  </span>
                </div>
                <span className={lc('label', 'mt-[6px]')}>
                  {c('workshop.signals')}
                </span>
                <div className={lc('meter')}>
                  <div className={lc('row t-meta', 'justify-between')}>
                    <span>{c('workshop.energy')}</span>
                    <span>{c('workshop.low')}</span>
                  </div>
                  <div className={lc('prog')}>
                    <i className="[transform:scaleX(.28)]!"></i>
                  </div>
                </div>
                <div className={lc('meter')}>
                  <div className={lc('row t-meta', 'justify-between')}>
                    <span>{c('workshop.tempo')}</span>
                    <span>{'88 BPM'}</span>
                  </div>
                  <div className={lc('prog')}>
                    <i className="[transform:scaleX(.46)]!"></i>
                  </div>
                </div>
                <div className={lc('meter')}>
                  <div className={lc('row t-meta', 'justify-between')}>
                    <span>{c('workshop.mood')}</span>
                    <span>{c('workshop.warm')}</span>
                  </div>
                  <div className={lc('prog')}>
                    <i className="[transform:scaleX(.72)]!"></i>
                  </div>
                </div>
              </div>
              <div className={lc('col grow', 'gap-[10px]')}>
                <div className={lc('row label', 'justify-between')}>
                  <span>{c('workshop.candidates')}</span>
                  <span>{c('workshop.ranked_by_fit')}</span>
                </div>
                <div className={lc('col', 'gap-[8px]')} id="stack">
                  <div className={lc('cand')}>
                    <span className={lc('r')}>{'#1'}</span>
                    <span className={lc('cv s cv1')}></span>
                    <div className={lc('grow')}>
                      <p className={lc('t-title')}>{c('workshop.afterglow')}</p>
                      <p className={lc('t-meta')}>
                        {c('workshop.nova_the_static_3_42')}
                      </p>
                    </div>
                    <span className={lc('pill ok')}>{'96% fit'}</span>
                  </div>
                  <div className={lc('cand')}>
                    <span className={lc('r')}>{'#2'}</span>
                    <span className={lc('cv s cv2')}></span>
                    <div className={lc('grow')}>
                      <p className={lc('t-title')}>
                        {c('workshop.night_signal')}
                      </p>
                      <p className={lc('t-meta')}>
                        {c('workshop.mira_sol_3_56')}
                      </p>
                    </div>
                    <span className={lc('pill')}>{'91% fit'}</span>
                  </div>
                  <div className={lc('cand')}>
                    <span className={lc('r')}>{'#3'}</span>
                    <span className={lc('cv s cv3')}></span>
                    <div className={lc('grow')}>
                      <p className={lc('t-title')}>
                        {c('workshop.static_lines')}
                      </p>
                      <p className={lc('t-meta')}>
                        {c('workshop.kite_harbor_3_47')}
                      </p>
                    </div>
                    <span className={lc('pill')}>{'88% fit'}</span>
                  </div>
                  <div className={lc('cand')}>
                    <span className={lc('r')}>{'#4'}</span>
                    <span className={lc('cv s cv4')}></span>
                    <div className={lc('grow')}>
                      <p className={lc('t-title')}>
                        {c('workshop.echoes_in_motion')}
                      </p>
                      <p className={lc('t-meta')}>
                        {c('workshop.lumen_choir_4_21')}
                      </p>
                    </div>
                    <span className={lc('pill')}>{'84% fit'}</span>
                  </div>
                </div>
              </div>
            </div>
            <div
              className={lc(
                'row d-only',
                'h-[56px] p-[0_20px] [border-top:1px_solid_var(--border)] gap-[10px]',
              )}
            >
              <span className={lc('mono')}>
                {c('workshop.12_tracks_44_min')}
              </span>
              <span className={lc('grow')}></span>
              <a className={lc('btn btn-ghost btn-xs')} href="#workshop">
                {c('workshop.swap_two')}
              </a>
              <a className={lc('btn btn-primary btn-xs')} href="#workshop">
                {c('workshop.approve_playlist')}
              </a>
            </div>
          </div>
        </div>
        <div
          className={lc('abs row d-only', 'justify-between')}
          style={{ '--x': '60', '--y': '846', '--w': '1320' }}
        >
          <span className={lc('disc')}>
            {c('workshop.playlist_workshop_concept_demonstration')}
          </span>
          <span className="font-[500] [font-size:16px] leading-[1] font-[family-name:var(--font-display)] text-muted-foreground">
            {c('workshop.your_mood_your_order_your_playlist')}
          </span>
        </div>
      </div>
    </section>
  )
}

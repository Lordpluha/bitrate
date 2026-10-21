'use client'

import { lc } from '../../lib/styles/lc'
import { DEMO_TRACKS } from '../../model/demoTracks'
import { useLandingCopy } from '../../model/useLandingCopy'

/** Scene "Social" — ported from the motion prototype; the landing engine animates it after mount. */
export const SceneSocial = () => {
  const c = useLandingCopy()
  return (
    <section
      aria-label={c('social.beyond_the_play_button')}
      className={lc('scene')}
      data-label="Social"
      id="social"
    >
      <div className={lc('board')}>
        <div
          className={lc('abs')}
          style={{ '--x': '48', '--y': '120', '--w': '330' }}
        >
          <div className={lc('eyebrow', 'mb-[18px]')} data-a="up">
            {c('social.music_is_a_conversation')}
          </div>
          <h2 className={lc('h h54')}>
            <span className={lc('line')}>
              <span>{c('social.beyond_the')}</span>
            </span>
            <span className={lc('line')}>
              <span className={lc('hl')}>{c('social.play_button')}</span>
            </span>
          </h2>
          <p className={lc('lede s', 'mt-[20px]')} data-a="up">
            {c('social.share_the_moment_follow_a_friend_s_taste')}
          </p>
        </div>
        <div
          className={lc('abs card')}
          data-a="win"
          style={{ '--x': '43', '--y': '410', '--w': '317' }}
        >
          <div className={lc('col', 'p-[20px] gap-[12px]')}>
            <div className={lc('row')}>
              <span
                className={lc(
                  'av',
                  'w-[60px] h-[60px] [font-size:16px] bg-[image:linear-gradient(135deg,var(--color-magenta-500),var(--color-purple-500))] border-0! border-none!',
                )}
              >
                {c('social.mr')}
              </span>
              <div>
                <p
                  className={lc(
                    't-title',
                    'font-[600] [font-size:19px] leading-[1.1] font-[family-name:var(--font-display)]',
                  )}
                >
                  {c('social.maya_s_listening')}
                </p>
                <p className={lc('t-meta')}>{c('social.her_music_lately')}</p>
              </div>
            </div>
            <div className={lc('row', 'gap-[8px]')}>
              <span className={lc('chip')}>{c('social.electronic')}</span>
              <span className={lc('chip')}>{c('social.ambient')}</span>
              <span className={lc('chip')}>{c('social.uk_garage')}</span>
            </div>
            <p className={lc('t-title d-only', 'mt-[4px]')}>
              {c('social.taste_history')}
            </p>
            <div
              className={lc('d-only t-meta', '[font-size:13px] grid gap-[8px]')}
            >
              <span>
                <b className="text-foreground">{c('social.this_month')}</b>{' '}
                {c('social.broken_beat')}
              </span>
              <span>
                <b className="text-foreground">{c('social.last_month')}</b>{' '}
                {c('social.ambient')}
              </span>
            </div>
            <div className={lc('row', 'justify-between mt-[6px]')}>
              <span className={lc('t-meta')}>{c('social.recently_saved')}</span>
              <a className={lc('btn btn-ghost btn-xs magnetic')} href="#social">
                {c('social.explore_profile')}
              </a>
            </div>
          </div>
        </div>
        <div
          className={lc('abs persp d-only')}
          style={{ '--x': '394', '--y': '109', '--w': '1014' }}
        >
          <div className={lc('win', 'h-[723px]')} data-a="win">
            <div
              className={lc(
                'row',
                'items-stretch gap-[18px] p-[18px] h-full! box-border',
              )}
            >
              <div
                className={lc(
                  'col',
                  'w-[146px] gap-[14px] [font-size:12px] text-muted-foreground pt-[30px]',
                )}
              >
                <span className={lc('label')}>{c('social.friends')}</span>
                <span className={lc('row', 'gap-[8px]')}>
                  <span
                    className={lc(
                      'av',
                      'w-[26px] h-[26px] bg-magenta-500 bg-none',
                    )}
                  >
                    {c('social.mr')}
                  </span>
                  {c('social.maya')}{' '}
                  <i className="w-[7px]! h-[7px]! rounded-[50%] bg-accent! bg-none!"></i>
                </span>
                <span className={lc('row', 'gap-[8px]')}>
                  <span
                    className={lc(
                      'av',
                      'w-[26px] h-[26px] bg-blue-400 bg-none',
                    )}
                  >
                    {c('social.jp')}
                  </span>
                  {c('social.jonah')}{' '}
                  <i className="w-[7px]! h-[7px]! rounded-[50%] bg-success! bg-none!"></i>
                </span>
                <span className={lc('row', 'gap-[8px]')}>
                  <span
                    className={lc(
                      'av',
                      'w-[26px] h-[26px] bg-neutral-700 bg-none',
                    )}
                  >
                    {c('social.as')}
                  </span>
                  {c('social.ana')}
                </span>
              </div>
              <div className={lc('col grow', 'gap-[14px] pt-[30px]')}>
                <div className={lc('row')}>
                  <span
                    className={lc('art', 'w-[96px] h-[96px] flex-[none]')}
                  ></span>
                  <div className={lc('grow')}>
                    <span className={lc('label', 'text-accent')}>
                      {c('social.track_discussion')}
                    </span>
                    <p
                      className={lc(
                        't-title',
                        'font-[700] [font-size:30px] leading-[1.05] font-[family-name:var(--font-display)] mt-[6px]',
                      )}
                    >
                      {DEMO_TRACKS.nightSignal}
                    </p>
                    <p className={lc('t-meta')}>
                      {c('social.demo_artist_3_56_24_comments')}
                    </p>
                  </div>
                  <span className={lc('pill ok')}>
                    {c('social.artist_replied')}
                  </span>
                </div>
                <div className="relative h-[60px]! mt-[10px]">
                  <canvas className={lc('wave')} data-seed="7"></canvas>
                  <span className={lc('cmark', 'left-[18%]')}></span>
                  <span className={lc('cmark', 'left-[41%]')}></span>
                  <span
                    className={lc('cmark', 'left-[63%] bg-accent bg-none')}
                  ></span>
                  <span className={lc('cmark', 'left-[82%]')}></span>
                </div>
                <div className={lc('col', 'gap-0')}>
                  <div className={lc('cmt')}>
                    <span className={lc('av', 'bg-magenta-500 bg-none')}>
                      {c('social.mr')}
                    </span>
                    <div>
                      <p className={lc('t-title')}>
                        <span className={lc('ts')}>{'0:42'}</span>
                        {c('social.maya')}
                      </p>
                      <p className={lc('t-meta', '[font-size:13px]')}>
                        {c('social.that_synth_swell_this_is_the_moment_it_o')}
                      </p>
                    </div>
                  </div>
                  <div className={lc('cmt')}>
                    <span className={lc('av', 'bg-blue-400 bg-none')}>
                      {c('social.jp')}
                    </span>
                    <div>
                      <p className={lc('t-title')}>
                        <span className={lc('ts')}>{'1:36'}</span>
                        {c('social.jonah')}
                      </p>
                      <p className={lc('t-meta', '[font-size:13px]')}>
                        {c('social.sounds_like_the_whole_city_at_2_am')}
                      </p>
                    </div>
                  </div>
                  <div className={lc('cmt')}>
                    <span
                      className={lc(
                        'av',
                        'bg-[image:linear-gradient(135deg,var(--color-purple-400),var(--color-magenta-500))]',
                      )}
                    >
                      {c('social.da')}
                    </span>
                    <div>
                      <p className={lc('t-title')}>
                        <span className={lc('ts')}>{'2:28'}</span>
                        {c('common.demo_artist')}{' '}
                        <span
                          className={lc(
                            'pill acc',
                            'p-[3px_7px] [font-size:10px]',
                          )}
                        >
                          {c('social.artist')}
                        </span>
                      </p>
                      <p className={lc('t-meta', '[font-size:13px]')}>
                        {c('social.recorded_that_part_in_one_take_glad_it_l')}
                      </p>
                    </div>
                  </div>
                </div>
                <span className={lc('grow')}></span>
                <div className={lc('soft row', 'p-[12px_14px]')}>
                  <svg
                    aria-hidden="true"
                    className={lc('i', 'text-muted-foreground')}
                  >
                    <use href="#i-msg" />
                  </svg>
                  <span className={lc('t-meta grow')}>
                    {c('social.comment_at_1_38')}
                  </span>
                  <a className={lc('btn btn-primary btn-xs')} href="#social">
                    {c('social.post')}
                  </a>
                </div>
              </div>
            </div>
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

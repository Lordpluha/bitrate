import { lc } from '../../lib/styles/lc'
import { DEMO_TRACKS } from '../../model/demoTracks'
import { useLandingCopy } from '../../model/useLandingCopy'
import { Abs, SceneShell } from './parts'

/** Scene "Your rules" — ported from the motion prototype; the landing engine animates it after mount. */
export const SceneRules = () => {
  const c = useLandingCopy()
  return (
    <SceneShell id="rules" labelKey="rules.your_player_your_rules">
      <Abs h={340} markers="d-only" w={360} x={0} y={560}>
        <div className={lc('horizon', 'h-full')}></div>
      </Abs>
      <Abs extra="opacity-[.7]" h={120} markers="d-only" w={300} x={40} y={110}>
        <div className={lc('bands')} id="bands"></div>
      </Abs>
      <Abs w={320} x={50} y={236}>
        <div className={lc('eyebrow', 'mb-[18px]')} data-a="up">
          {c('rules.make_it_yours')}
        </div>
        <h2 className={lc('h h56')}>
          <span className={lc('line')}>
            <span>{c('rules.your_player')}</span>
          </span>
          <span className={lc('line')}>
            <span className={lc('hl')}>{c('rules.your_rules')}</span>
          </span>
        </h2>
        <p className={lc('lede', 'mt-[26px] text-foreground')} data-a="up">
          {c('rules.less_clutter_more_of_what_you_use')}
        </p>
        <p className={lc('lede s', 'mt-[14px]')} data-a="up">
          {c('rules.change_the_layout_choose_your_tools_find')}
        </p>
      </Abs>
      <span
        className={lc('abs sig d-only')}
        style={{ '--x': '72', '--y': '834', '--w': '200' }}
      >
        {c('common.music_lives_on')}
      </span>
      <Abs
        data-a="up"
        extra="rounded-[24px] bg-[image:linear-gradient(135deg,color-mix(in_srgb,var(--color-purple-500)_25%,transparent),color-mix(in_srgb,var(--color-magenta-500)_12%,transparent))]! border border-solid border-border"
        h={718}
        markers="d-only"
        w={1024}
        x={378}
        y={110}
      />
      <Abs markers="persp" w={1008} x={392} y={126}>
        <div className={lc('win m-fit', 'relative h-[690px]')} data-a="win">
          <div
            className={lc(
              'row d-only',
              'h-[56px] p-[0_22px] gap-[22px] [font-size:12px] text-muted-foreground',
            )}
          >
            <b className="font-[600] [font-size:16px] leading-[1] font-[family-name:var(--font-display)] text-foreground">
              {c('rules.bitrate')}
            </b>
            <span className="text-foreground">{c('rules.home')}</span>
            <span>{c('rules.library')}</span>
            <span>{c('rules.discover')}</span>
            <span
              className={lc(
                'soft row',
                'p-[8px_12px] gap-[8px] w-[190px] rounded-[999px]',
              )}
            >
              <svg
                aria-hidden="true"
                className={lc('i', 'w-[14px]! h-[14px]!')}
              >
                <use href="#i-search" />
              </svg>
              {c('rules.search')}
            </span>
          </div>
          <div
            className={lc(
              'pos d-only',
              'left-[14px] top-[70px] w-[246px] h-[604px]',
            )}
          >
            <div
              className={lc(
                'card col',
                'h-full p-[14px] gap-[14px] box-border',
              )}
            >
              <span className={lc('label')}>{c('rules.now_playing')}</span>
              <div className={lc('art', 'h-[218px]')}></div>
              <p
                className={lc(
                  't-title',
                  'font-[600] [font-size:18px] leading-[1] font-[family-name:var(--font-display)]',
                )}
              >
                {DEMO_TRACKS.nightSignal}
              </p>
              <p className={lc('t-meta', 'mt-[-8px]')}>
                {c('common.demo_artist')}
              </p>
              <div className={lc('prog')}>
                <i className={lc('anim-prog')}></i>
              </div>
              <div className={lc('transport', 'gap-[18px]')}>
                <svg aria-hidden="true" className={lc('i')}>
                  <use href="#i-prev" />
                </svg>
                <span className={lc('playbtn', 'w-[42px] h-[42px]')}>
                  <svg aria-hidden="true" className={lc('i')}>
                    <use href="#i-pause" />
                  </svg>
                </span>
                <svg aria-hidden="true" className={lc('i')}>
                  <use href="#i-next" />
                </svg>
              </div>
              <span className={lc('grow')}></span>
              <div className="h-[44px]!">
                <canvas className={lc('spec')} data-bars="20"></canvas>
              </div>
            </div>
          </div>
          <div
            className={lc(
              'pos d-only',
              'left-[268px] top-[70px] w-[238px] h-[425px]',
            )}
          >
            <div
              className={lc('card col', 'h-full p-[14px] gap-[6px] box-border')}
            >
              <span className={lc('label')}>{c('rules.library_2')}</span>
              <div className={lc('qrow')}>
                <span
                  className={lc(
                    'cv s',
                    'bg-[image:linear-gradient(135deg,var(--color-purple-500),var(--color-magenta-500))]',
                  )}
                ></span>
                <div>
                  <p className={lc('t-title')}>{c('rules.liked_songs')}</p>
                  <p className={lc('t-meta')}>{c('rules.128_tracks')}</p>
                </div>
              </div>
              <div className={lc('qrow')}>
                <span className={lc('cv s cv2')}></span>
                <div>
                  <p className={lc('t-title')}>{c('rules.night_drive')}</p>
                  <p className={lc('t-meta')}>{c('rules.playlist')}</p>
                </div>
              </div>
              <div className={lc('qrow')}>
                <span className={lc('cv s cv3')}></span>
                <div>
                  <p className={lc('t-title')}>{c('rules.rain_drive')}</p>
                  <p className={lc('t-meta')}>{c('rules.playlist')}</p>
                </div>
              </div>
              <div className={lc('qrow')}>
                <span className={lc('cv s cv5')}></span>
                <div>
                  <p className={lc('t-title')}>{c('rules.luma_vale')}</p>
                  <p className={lc('t-meta')}>{c('rules.artist')}</p>
                </div>
              </div>
              <div className={lc('qrow')}>
                <span className={lc('cv s cv4')}></span>
                <div>
                  <p className={lc('t-title')}>{c('rules.ambient_mornings')}</p>
                  <p className={lc('t-meta')}>{c('rules.playlist')}</p>
                </div>
              </div>
            </div>
          </div>
          <div
            className={lc(
              'pos d-only',
              'left-[268px] top-[507px] w-[238px] h-[167px]',
            )}
          >
            <div className={lc('drop', 'h-full box-border')}>
              {c('rules.drop_a_panel_here')}
              <br />
              {c('rules.lyrics_credits_visualizer')}
            </div>
          </div>
          <div
            className={lc(
              'pos d-only',
              'left-[514px] top-[70px] w-[188px] h-[604px]',
            )}
          >
            <div
              className={lc(
                'card col',
                'h-full p-[14px] gap-[6px] box-border opacity-[.55]',
              )}
            >
              <span className={lc('label')}>{c('rules.queue_dock')}</span>
              <div className={lc('drop', 'h-[150px] mt-[6px]')}>
                {c('rules.queue_moved')}
              </div>
            </div>
          </div>
          <div
            className={lc('pos', 'left-[714px] top-[2px] w-[280px] h-[674px]')}
          >
            <div
              className={lc(
                'card col',
                'h-full p-[20px] gap-[16px] box-border',
              )}
            >
              <div className={lc('row')}>
                <svg aria-hidden="true" className={lc('i', 'text-accent')}>
                  <use href="#i-sliders" />
                </svg>
                <p
                  className={lc(
                    't-title',
                    'font-[600] [font-size:18px] leading-[1] font-[family-name:var(--font-display)]',
                  )}
                >
                  {c('rules.make_it_yours')}
                </p>
              </div>
              <span className={lc('label')}>{c('rules.layout')}</span>
              <div className={lc('row', 'gap-[8px]')}>
                <span className={lc('chip on')}>{c('rules.focus')}</span>
                <span className={lc('chip')}>{c('rules.studio')}</span>
                <span className={lc('chip')}>{c('rules.mini')}</span>
              </div>
              <span className={lc('label')}>{c('rules.panels')}</span>
              <div className={lc('row t-title', 'font-[500]')}>
                <span className={lc('grow')}>{c('rules.lyrics')}</span>
                <span className={lc('toggle on')}></span>
              </div>
              <div className={lc('row t-title', 'font-[500]')}>
                <span className={lc('grow')}>{c('rules.floating_queue')}</span>
                <span className={lc('toggle')} id="tgQueue"></span>
              </div>
              <div className={lc('row t-title', 'font-[500]')}>
                <span className={lc('grow')}>{c('rules.visualizer')}</span>
                <span className={lc('toggle')}></span>
              </div>
              <div className={lc('row t-title', 'font-[500]')}>
                <span className={lc('grow')}>{c('rules.credits')}</span>
                <span className={lc('toggle')}></span>
              </div>
              <span className={lc('label')}>{c('rules.accent')}</span>
              <div className={lc('row', 'gap-[10px]')}>
                <span
                  className={lc(
                    'av',
                    'bg-purple-500 bg-none border-foreground',
                  )}
                ></span>
                <span className={lc('av', 'bg-magenta-500 bg-none')}></span>
                <span className={lc('av', 'bg-blue-500 bg-none')}></span>
                <span className={lc('av', 'bg-green-500 bg-none')}></span>
              </div>
              <span className={lc('grow')}></span>
              <p className={lc('t-meta')}>
                {c('rules.saved_to_this_device_reset_any_time')}
              </p>
            </div>
          </div>
          <div
            className={lc(
              'pos d-only',
              'left-[544px] top-[246px] w-[192px] h-[328px]',
            )}
            id="floatQ"
          >
            <div
              className={lc(
                'card col',
                'h-full p-[12px] gap-[4px] box-border [box-shadow:0_30px_60px_-20px_var(--shadow)] border-accent',
              )}
            >
              <div className={lc('row label', 'justify-between')}>
                <span>{c('rules.floating_queue_2')}</span>
                <svg aria-hidden="true" className={lc('i', 'w-[14px]!')}>
                  <use href="#i-grip" />
                </svg>
              </div>
              <div className={lc('qrow', 'p-[8px_4px]')}>
                <span className={lc('cv s cv2', 'w-[32px]! h-[32px]!')}></span>
                <p className={lc('t-title', '[font-size:12px]')}>
                  {DEMO_TRACKS.echoesInMotion}
                </p>
              </div>
              <div className={lc('qrow', 'p-[8px_4px]')}>
                <span className={lc('cv s cv3', 'w-[32px]! h-[32px]!')}></span>
                <p className={lc('t-title', '[font-size:12px]')}>
                  {DEMO_TRACKS.staticLines}
                </p>
              </div>
              <div className={lc('qrow', 'p-[8px_4px]')}>
                <span className={lc('cv s cv4', 'w-[32px]! h-[32px]!')}></span>
                <p className={lc('t-title', '[font-size:12px]')}>
                  {DEMO_TRACKS.driftControl}
                </p>
              </div>
              <div className={lc('qrow', 'p-[8px_4px]')}>
                <span className={lc('cv s cv1', 'w-[32px]! h-[32px]!')}></span>
                <p className={lc('t-title', '[font-size:12px]')}>
                  {DEMO_TRACKS.afterglow}
                </p>
              </div>
            </div>
          </div>
        </div>
      </Abs>
      <span
        className={lc('abs disc d-only', 'text-right')}
        style={{ '--x': '1196', '--y': '844', '--w': '220' }}
      >
        {c('common.feature_concept_demo_content')}
      </span>
    </SceneShell>
  )
}

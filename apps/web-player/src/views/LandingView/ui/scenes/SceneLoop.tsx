'use client'

import { useLandingCopy } from '../../model/useLandingCopy'

/** Scene "Loop" — ported from the motion prototype; the landing engine animates it after mount. */
export const SceneLoop = () => {
  const c = useLandingCopy()
  return (
    <section
      aria-label={c('loop.play_save_return')}
      className="scene"
      data-label="Loop"
      id="loop"
    >
      <div className="board">
        <div className="abs" style={{ '--x': '60', '--y': '64', '--w': '900' }}>
          <h2 className="h h80">
            <span className="line">
              <span>
                {c('loop.play')} <span className="hl">{c('loop.save')}</span>{' '}
                {c('loop.return')}
              </span>
            </span>
          </h2>
          <p className="lede" data-a="up" style={{ marginTop: '18px' }}>
            {c('loop.one_listening_loop_built_around_the_musi')}
          </p>
        </div>
        <div
          className="abs label d-only"
          data-a="up"
          style={{
            '--x': '1196',
            '--y': '72',
            '--w': '200',
            textAlign: 'right',
          }}
        >
          {c('loop.interface_preview')}
        </div>
        <div
          className="abs card tiltable"
          data-a="win"
          style={{ '--x': '60', '--y': '254', '--w': '424', '--h': '542' }}
        >
          <div
            className="col"
            style={{
              padding: '24px',
              gap: '18px',
              height: '100%',
              boxSizing: 'border-box',
            }}
          >
            <div className="row" style={{ alignItems: 'flex-start' }}>
              <span className="medal">
                <svg aria-hidden="true" className="i">
                  <use href="#i-play" />
                </svg>
              </span>
              <div>
                <span className="num">{'01'}</span>
                <p
                  className="t-title"
                  style={{
                    font: '600 20px/1.2 var(--font-display)',
                    marginTop: '6px',
                  }}
                >
                  {c('loop.play_without_losing_focus')}
                </p>
                <p className="t-meta">
                  {c('loop.the_controls_you_need_within_reach')}
                </p>
              </div>
            </div>
            <div
              className="soft col grow"
              style={{ padding: '16px', gap: '14px' }}
            >
              <div className="row">
                <span
                  className="art"
                  style={{
                    width: '76px',
                    height: '76px',
                    borderRadius: '10px',
                    flex: 'none',
                  }}
                ></span>
                <div className="grow">
                  <p className="t-title">{c('loop.night_signal')}</p>
                  <p className="t-meta">{c('loop.demo_artist')}</p>
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
                  <i className="anim-prog"></i>
                </div>
                <div className="times">
                  <span>{'1:38'}</span>
                  <span>{'3:56'}</span>
                </div>
              </div>
              <div className="transport" style={{ gap: '22px' }}>
                <svg aria-hidden="true" className="i">
                  <use href="#i-prev" />
                </svg>
                <span
                  className="playbtn"
                  style={{ width: '44px', height: '44px' }}
                >
                  <svg aria-hidden="true" className="i">
                    <use href="#i-pause" />
                  </svg>
                </span>
                <svg aria-hidden="true" className="i">
                  <use href="#i-next" />
                </svg>
              </div>
              <span className="grow"></span>
              <div className="row" style={{ gap: '18px' }}>
                <div>
                  <span className="label">{c('loop.bitrate')}</span>
                  <br />
                  <b className="mono" style={{ color: 'var(--fg)' }}>
                    {'320 KBPS'}
                  </b>
                </div>
                <div className="grow" style={{ height: '28px' }}>
                  <canvas className="spec" data-bars="26"></canvas>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div
          className="abs card tiltable d-only"
          data-a="win"
          style={{ '--x': '508', '--y': '254', '--w': '424', '--h': '542' }}
        >
          <div
            className="col"
            style={{
              padding: '24px',
              gap: '18px',
              height: '100%',
              boxSizing: 'border-box',
            }}
          >
            <div className="row" style={{ alignItems: 'flex-start' }}>
              <span className="medal">
                <svg aria-hidden="true" className="i">
                  <use href="#i-heart" />
                </svg>
              </span>
              <div>
                <span className="num">{'02'}</span>
                <p
                  className="t-title"
                  style={{
                    font: '600 20px/1.2 var(--font-display)',
                    marginTop: '6px',
                  }}
                >
                  {c('loop.save_what_matters')}
                </p>
                <p className="t-meta">
                  {c('loop.build_a_library_that_sounds_more_like_yo')}
                </p>
              </div>
            </div>
            <div
              className="soft col grow"
              style={{ padding: '16px', gap: '10px' }}
            >
              <div className="row">
                <span
                  className="cv"
                  style={{
                    background: 'linear-gradient(135deg,#7c3aed,#ec4899)',
                    display: 'grid',
                    placeItems: 'center',
                    color: '#fff',
                  }}
                >
                  <svg aria-hidden="true" className="i">
                    <use href="#i-heart" />
                  </svg>
                </span>
                <div className="grow">
                  <p className="t-title">{c('loop.liked_songs')}</p>
                  <p className="t-meta">
                    {c('loop.ready_for_your_next_visit_128')}
                  </p>
                </div>
              </div>
              <div className="qrow">
                <span className="cv s cv1"></span>
                <div className="grow">
                  <p className="t-title">{c('loop.night_signal')}</p>
                  <p className="t-meta">{c('loop.demo_artist')}</p>
                </div>
                <svg
                  aria-hidden="true"
                  className="i like-pop"
                  style={{ color: 'var(--magenta)' }}
                >
                  <use href="#i-heart" />
                </svg>
              </div>
              <div className="qrow">
                <span className="cv s cv3"></span>
                <div className="grow">
                  <p className="t-title">{c('loop.static_lines')}</p>
                  <p className="t-meta">{c('loop.kite_harbor')}</p>
                </div>
                <svg
                  aria-hidden="true"
                  className="i like-pop"
                  style={{ color: 'var(--magenta)' }}
                >
                  <use href="#i-heart" />
                </svg>
              </div>
              <div className="qrow">
                <span className="cv s cv5"></span>
                <div className="grow">
                  <p className="t-title">{c('loop.low_orbit')}</p>
                  <p className="t-meta">{c('loop.luma_vale')}</p>
                </div>
                <svg
                  aria-hidden="true"
                  className="i like-pop"
                  style={{ color: 'var(--magenta)' }}
                >
                  <use href="#i-heart" />
                </svg>
              </div>
            </div>
          </div>
        </div>
        <div
          className="abs card tiltable d-only"
          data-a="win"
          style={{ '--x': '956', '--y': '254', '--w': '424', '--h': '542' }}
        >
          <div
            className="col"
            style={{
              padding: '24px',
              gap: '18px',
              height: '100%',
              boxSizing: 'border-box',
            }}
          >
            <div className="row" style={{ alignItems: 'flex-start' }}>
              <span className="medal">
                <svg aria-hidden="true" className="i">
                  <use href="#i-history" />
                </svg>
              </span>
              <div>
                <span className="num">{'03'}</span>
                <p
                  className="t-title"
                  style={{
                    font: '600 20px/1.2 var(--font-display)',
                    marginTop: '6px',
                  }}
                >
                  {c('loop.find_your_way_back')}
                </p>
                <p className="t-meta">
                  {c('loop.your_returns_together_in_recents')}
                </p>
              </div>
            </div>
            <div
              className="soft col grow"
              style={{ padding: '16px', gap: '6px' }}
            >
              <div
                className="row label"
                style={{ justifyContent: 'space-between' }}
              >
                <span>{c('loop.recents')}</span>
                <span style={{ letterSpacing: '.04em' }}>
                  {c('loop.see_all')}
                </span>
              </div>
              <span className="mono" style={{ marginTop: '8px' }}>
                {c('loop.today')}
              </span>
              <div className="qrow">
                <span className="cv s cv1"></span>
                <div className="grow">
                  <p className="t-title">{c('loop.night_signal')}</p>
                  <p className="t-meta">{c('loop.played_3')}</p>
                </div>
                <span className="mono">{'21:40'}</span>
              </div>
              <div className="qrow">
                <span className="cv s cv4"></span>
                <div className="grow">
                  <p className="t-title">{c('loop.drift_control')}</p>
                  <p className="t-meta">{c('loop.from_night_drive')}</p>
                </div>
                <span className="mono">{'20:12'}</span>
              </div>
              <span className="mono" style={{ marginTop: '8px' }}>
                {c('loop.yesterday')}
              </span>
              <div className="qrow">
                <span className="cv s cv2"></span>
                <div className="grow">
                  <p className="t-title">{c('loop.echoes_in_motion')}</p>
                  <p className="t-meta">{c('loop.album')}</p>
                </div>
                <span className="mono">{'23:05'}</span>
              </div>
            </div>
          </div>
        </div>
        <div
          className="abs row d-only"
          style={{
            '--x': '60',
            '--y': '830',
            '--w': '1320',
            justifyContent: 'space-between',
          }}
        >
          <span className="disc">
            {c('loop.product_preview_demonstration_library')}
          </span>
          <span className="sig">{c('loop.music_lives_on')}</span>
        </div>
      </div>
    </section>
  )
}

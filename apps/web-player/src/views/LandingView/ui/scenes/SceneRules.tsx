'use client'

import { useLandingCopy } from '../../model/useLandingCopy'

/** Scene "Your rules" — ported from the motion prototype; the landing engine animates it after mount. */
export const SceneRules = () => {
  const c = useLandingCopy()
  return (
    <section
      aria-label={c('rules.your_player_your_rules')}
      className="scene"
      data-label="Your rules"
      id="rules"
    >
      <div className="board">
        <div
          className="abs d-only"
          style={{ '--x': '0', '--y': '560', '--w': '360', '--h': '340' }}
        >
          <div className="horizon" style={{ height: '100%' }}></div>
        </div>
        <div
          className="abs d-only"
          style={{
            '--x': '40',
            '--y': '110',
            '--w': '300',
            '--h': '120',
            opacity: '.7',
          }}
        >
          <div className="bands" id="bands"></div>
        </div>
        <div
          className="abs"
          style={{ '--x': '50', '--y': '236', '--w': '320' }}
        >
          <div className="eyebrow" data-a="up" style={{ marginBottom: '18px' }}>
            {c('rules.make_it_yours')}
          </div>
          <h2 className="h h56">
            <span className="line">
              <span>{c('rules.your_player')}</span>
            </span>
            <span className="line">
              <span className="hl">{c('rules.your_rules')}</span>
            </span>
          </h2>
          <p
            className="lede"
            data-a="up"
            style={{ marginTop: '26px', color: 'var(--fg)' }}
          >
            {c('rules.less_clutter_more_of_what_you_use')}
          </p>
          <p className="lede s" data-a="up" style={{ marginTop: '14px' }}>
            {c('rules.change_the_layout_choose_your_tools_find')}
          </p>
        </div>
        <span
          className="abs sig d-only"
          style={{ '--x': '72', '--y': '834', '--w': '200' }}
        >
          {c('rules.music_lives_on')}
        </span>
        <div
          className="abs d-only"
          data-a="up"
          style={{
            '--x': '378',
            '--y': '110',
            '--w': '1024',
            '--h': '718',
            borderRadius: '24px',
            background:
              'linear-gradient(135deg,rgba(124,58,237,.25),rgba(236,72,153,.12))',
            border: '1px solid var(--border)',
          }}
        ></div>
        <div
          className="abs persp"
          style={{ '--x': '392', '--y': '126', '--w': '1008' }}
        >
          <div
            className="win m-fit"
            data-a="win"
            style={{ position: 'relative', height: '690px' }}
          >
            <div
              className="row d-only"
              style={{
                height: '56px',
                padding: '0 22px',
                gap: '22px',
                fontSize: '12px',
                color: 'var(--muted)',
              }}
            >
              <b
                style={{
                  font: '600 16px/1 var(--font-display)',
                  color: 'var(--fg)',
                }}
              >
                {c('rules.bitrate')}
              </b>
              <span style={{ color: 'var(--fg)' }}>{c('rules.home')}</span>
              <span>{c('rules.library')}</span>
              <span>{c('rules.discover')}</span>
              <span
                className="soft row"
                style={{
                  padding: '8px 12px',
                  gap: '8px',
                  width: '190px',
                  borderRadius: '999px',
                }}
              >
                <svg
                  aria-hidden="true"
                  className="i"
                  style={{ width: '14px', height: '14px' }}
                >
                  <use href="#i-search" />
                </svg>
                {c('rules.search')}
              </span>
            </div>
            <div
              className="pos d-only"
              style={{
                left: '14px',
                top: '70px',
                width: '246px',
                height: '604px',
              }}
            >
              <div
                className="card col"
                style={{
                  height: '100%',
                  padding: '14px',
                  gap: '14px',
                  boxSizing: 'border-box',
                }}
              >
                <span className="label">{c('rules.now_playing')}</span>
                <div className="art" style={{ height: '218px' }}></div>
                <p
                  className="t-title"
                  style={{ font: '600 18px/1 var(--font-display)' }}
                >
                  {c('rules.night_signal')}
                </p>
                <p className="t-meta" style={{ marginTop: '-8px' }}>
                  {c('rules.demo_artist')}
                </p>
                <div className="prog">
                  <i className="anim-prog"></i>
                </div>
                <div className="transport" style={{ gap: '18px' }}>
                  <svg aria-hidden="true" className="i">
                    <use href="#i-prev" />
                  </svg>
                  <span
                    className="playbtn"
                    style={{ width: '42px', height: '42px' }}
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
                <div style={{ height: '44px' }}>
                  <canvas className="spec" data-bars="20"></canvas>
                </div>
              </div>
            </div>
            <div
              className="pos d-only"
              style={{
                left: '268px',
                top: '70px',
                width: '238px',
                height: '425px',
              }}
            >
              <div
                className="card col"
                style={{
                  height: '100%',
                  padding: '14px',
                  gap: '6px',
                  boxSizing: 'border-box',
                }}
              >
                <span className="label">{c('rules.library_2')}</span>
                <div className="qrow">
                  <span
                    className="cv s"
                    style={{
                      background: 'linear-gradient(135deg,#7c3aed,#ec4899)',
                    }}
                  ></span>
                  <div>
                    <p className="t-title">{c('rules.liked_songs')}</p>
                    <p className="t-meta">{c('rules.128_tracks')}</p>
                  </div>
                </div>
                <div className="qrow">
                  <span className="cv s cv2"></span>
                  <div>
                    <p className="t-title">{c('rules.night_drive')}</p>
                    <p className="t-meta">{c('rules.playlist')}</p>
                  </div>
                </div>
                <div className="qrow">
                  <span className="cv s cv3"></span>
                  <div>
                    <p className="t-title">{c('rules.rain_drive')}</p>
                    <p className="t-meta">{c('rules.playlist')}</p>
                  </div>
                </div>
                <div className="qrow">
                  <span className="cv s cv5"></span>
                  <div>
                    <p className="t-title">{c('rules.luma_vale')}</p>
                    <p className="t-meta">{c('rules.artist')}</p>
                  </div>
                </div>
                <div className="qrow">
                  <span className="cv s cv4"></span>
                  <div>
                    <p className="t-title">{c('rules.ambient_mornings')}</p>
                    <p className="t-meta">{c('rules.playlist')}</p>
                  </div>
                </div>
              </div>
            </div>
            <div
              className="pos d-only"
              style={{
                left: '268px',
                top: '507px',
                width: '238px',
                height: '167px',
              }}
            >
              <div
                className="drop"
                style={{ height: '100%', boxSizing: 'border-box' }}
              >
                {c('rules.drop_a_panel_here')}
                <br />
                {c('rules.lyrics_credits_visualizer')}
              </div>
            </div>
            <div
              className="pos d-only"
              style={{
                left: '514px',
                top: '70px',
                width: '188px',
                height: '604px',
              }}
            >
              <div
                className="card col"
                style={{
                  height: '100%',
                  padding: '14px',
                  gap: '6px',
                  boxSizing: 'border-box',
                  opacity: '.55',
                }}
              >
                <span className="label">{c('rules.queue_dock')}</span>
                <div
                  className="drop"
                  style={{ height: '150px', marginTop: '6px' }}
                >
                  {c('rules.queue_moved')}
                </div>
              </div>
            </div>
            <div
              className="pos"
              style={{
                left: '714px',
                top: '2px',
                width: '280px',
                height: '674px',
              }}
            >
              <div
                className="card col"
                style={{
                  height: '100%',
                  padding: '20px',
                  gap: '16px',
                  boxSizing: 'border-box',
                }}
              >
                <div className="row">
                  <svg
                    aria-hidden="true"
                    className="i"
                    style={{ color: 'var(--accent)' }}
                  >
                    <use href="#i-sliders" />
                  </svg>
                  <p
                    className="t-title"
                    style={{ font: '600 18px/1 var(--font-display)' }}
                  >
                    {c('rules.make_it_yours')}
                  </p>
                </div>
                <span className="label">{c('rules.layout')}</span>
                <div className="row" style={{ gap: '8px' }}>
                  <span className="chip on">{c('rules.focus')}</span>
                  <span className="chip">{c('rules.studio')}</span>
                  <span className="chip">{c('rules.mini')}</span>
                </div>
                <span className="label">{c('rules.panels')}</span>
                <div className="row t-title" style={{ fontWeight: '500' }}>
                  <span className="grow">{c('rules.lyrics')}</span>
                  <span className="toggle on"></span>
                </div>
                <div className="row t-title" style={{ fontWeight: '500' }}>
                  <span className="grow">{c('rules.floating_queue')}</span>
                  <span className="toggle" id="tgQueue"></span>
                </div>
                <div className="row t-title" style={{ fontWeight: '500' }}>
                  <span className="grow">{c('rules.visualizer')}</span>
                  <span className="toggle"></span>
                </div>
                <div className="row t-title" style={{ fontWeight: '500' }}>
                  <span className="grow">{c('rules.credits')}</span>
                  <span className="toggle"></span>
                </div>
                <span className="label">{c('rules.accent')}</span>
                <div className="row" style={{ gap: '10px' }}>
                  <span
                    className="av"
                    style={{ background: '#7c3aed', borderColor: 'var(--fg)' }}
                  ></span>
                  <span className="av" style={{ background: '#ec4899' }}></span>
                  <span className="av" style={{ background: '#3b82f6' }}></span>
                  <span className="av" style={{ background: '#10b981' }}></span>
                </div>
                <span className="grow"></span>
                <p className="t-meta">
                  {c('rules.saved_to_this_device_reset_any_time')}
                </p>
              </div>
            </div>
            <div
              className="pos d-only"
              id="floatQ"
              style={{
                left: '544px',
                top: '246px',
                width: '192px',
                height: '328px',
              }}
            >
              <div
                className="card col"
                style={{
                  height: '100%',
                  padding: '12px',
                  gap: '4px',
                  boxSizing: 'border-box',
                  boxShadow: '0 30px 60px -20px var(--shadow)',
                  borderColor: 'var(--accent)',
                }}
              >
                <div
                  className="row label"
                  style={{ justifyContent: 'space-between' }}
                >
                  <span>{c('rules.floating_queue_2')}</span>
                  <svg
                    aria-hidden="true"
                    className="i"
                    style={{ width: '14px' }}
                  >
                    <use href="#i-grip" />
                  </svg>
                </div>
                <div className="qrow" style={{ padding: '8px 4px' }}>
                  <span
                    className="cv s cv2"
                    style={{ width: '32px', height: '32px' }}
                  ></span>
                  <p className="t-title" style={{ fontSize: '12px' }}>
                    {c('rules.echoes_in_motion')}
                  </p>
                </div>
                <div className="qrow" style={{ padding: '8px 4px' }}>
                  <span
                    className="cv s cv3"
                    style={{ width: '32px', height: '32px' }}
                  ></span>
                  <p className="t-title" style={{ fontSize: '12px' }}>
                    {c('rules.static_lines')}
                  </p>
                </div>
                <div className="qrow" style={{ padding: '8px 4px' }}>
                  <span
                    className="cv s cv4"
                    style={{ width: '32px', height: '32px' }}
                  ></span>
                  <p className="t-title" style={{ fontSize: '12px' }}>
                    {c('rules.drift_control')}
                  </p>
                </div>
                <div className="qrow" style={{ padding: '8px 4px' }}>
                  <span
                    className="cv s cv1"
                    style={{ width: '32px', height: '32px' }}
                  ></span>
                  <p className="t-title" style={{ fontSize: '12px' }}>
                    {c('rules.afterglow')}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
        <span
          className="abs disc d-only"
          style={{
            '--x': '1196',
            '--y': '844',
            '--w': '220',
            textAlign: 'right',
          }}
        >
          {c('rules.feature_concept_demo_content')}
        </span>
      </div>
    </section>
  )
}

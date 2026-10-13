'use client'

import { useLandingCopy } from '../../model/useLandingCopy'

/** Scene "Devices" — ported from the motion prototype; the landing engine animates it after mount. */
export const SceneDevices = () => {
  const c = useLandingCopy()
  return (
    <section
      aria-label={c('devices.same_queue_new_scene')}
      className="scene"
      data-label="Devices"
      id="devices"
    >
      <div className="board">
        <div
          className="abs d-only"
          style={{ '--x': '0', '--y': '626', '--w': '380', '--h': '274' }}
        >
          <div className="horizon" style={{ height: '100%' }}></div>
        </div>
        <div
          className="abs"
          style={{ '--x': '48', '--y': '120', '--w': '380' }}
        >
          <div className="eyebrow" data-a="up" style={{ marginBottom: '18px' }}>
            {c('devices.keep_the_session_going')}
          </div>
          <h2 className="h h54">
            <span className="line">
              <span>{c('devices.same_queue')}</span>
            </span>
            <span className="line">
              <span className="hl">{c('devices.new_scene')}</span>
            </span>
          </h2>
          <p className="lede s" data-a="up" style={{ marginTop: '22px' }}>
            {c('devices.move_playback_between_devices_with_bitra')}
          </p>
          <div
            className="col d-only"
            style={{ marginTop: '34px', gap: '20px' }}
          >
            <div className="row" data-a="up">
              <svg
                aria-hidden="true"
                className="i"
                style={{ color: 'var(--accent)' }}
              >
                <use href="#i-phone" />
              </svg>
              <div>
                <p className="t-title">{c('devices.bitrate_connect')}</p>
                <p className="t-meta">
                  {c('devices.move_playback_to_any_device')}
                </p>
              </div>
            </div>
            <div className="row" data-a="up">
              <svg
                aria-hidden="true"
                className="i"
                style={{ color: 'var(--accent)' }}
              >
                <use href="#i-users" />
              </svg>
              <div>
                <p className="t-title">{c('devices.jam')}</p>
                <p className="t-meta">{c('devices.listen_together')}</p>
              </div>
            </div>
          </div>
        </div>
        <div
          className="abs persp d-only"
          style={{ '--x': '553', '--y': '116', '--w': '855' }}
        >
          <div className="win" data-a="win" style={{ height: '716px' }}>
            <div className="wbar">
              <span className="dots3">
                <i></i>
                <i></i>
                <i></i>
              </span>
              <span className="grow"></span>
              <span className="live">
                <i></i>
                <span className="glitch glitch-auto" data-text="JAM LIVE">
                  {c('devices.jam_live')}
                </span>
              </span>
            </div>
            <div
              className="row"
              style={{
                alignItems: 'stretch',
                gap: '18px',
                padding: '0 18px 18px',
                height: '648px',
                boxSizing: 'border-box',
              }}
            >
              <div
                className="col"
                style={{
                  width: '126px',
                  gap: '16px',
                  paddingTop: '18px',
                  fontSize: '12px',
                  color: 'var(--muted)',
                }}
              >
                <span
                  className="row"
                  style={{ gap: '8px', color: 'var(--fg)' }}
                >
                  <svg aria-hidden="true" className="i">
                    <use href="#i-home" />
                  </svg>
                  {c('devices.home')}
                </span>
                <span className="row" style={{ gap: '8px' }}>
                  <svg aria-hidden="true" className="i">
                    <use href="#i-lib" />
                  </svg>
                  {c('devices.library')}
                </span>
                <span className="row" style={{ gap: '8px' }}>
                  <svg aria-hidden="true" className="i">
                    <use href="#i-users" />
                  </svg>
                  {c('devices.jam')}
                </span>
              </div>
              <div
                className="col grow"
                style={{
                  paddingTop: '18px',
                  gap: '14px',
                  paddingLeft: '120px',
                }}
              >
                <div className="row">
                  <div className="grow">
                    <span className="label" style={{ color: 'var(--accent)' }}>
                      {c('devices.jam_2')}
                    </span>
                    <p
                      className="t-title"
                      style={{
                        font: '700 30px/1.1 var(--font-display)',
                        marginTop: '6px',
                      }}
                    >
                      {c('devices.jam_after_hours')}
                    </p>
                  </div>
                  <div className="avs listeners">
                    <span className="av" style={{ background: '#7c3aed' }}>
                      {c('devices.mr')}
                    </span>
                    <span className="av" style={{ background: '#db2777' }}>
                      {c('devices.jp')}
                    </span>
                    <span className="av" style={{ background: '#0ea5e9' }}>
                      {c('devices.as')}
                    </span>
                    <span className="av" style={{ background: '#334155' }}>
                      {'+2'}
                    </span>
                  </div>
                </div>
                <div
                  className="row"
                  style={{ gap: '18px', alignItems: 'stretch' }}
                >
                  <div
                    className="art"
                    style={{ width: '200px', height: '200px', flex: 'none' }}
                  ></div>
                  <div className="col grow" style={{ gap: '10px' }}>
                    <span className="label">
                      {c('devices.now_playing_in_sync')}
                    </span>
                    <p
                      className="t-title"
                      style={{ font: '600 24px/1.1 var(--font-display)' }}
                    >
                      {c('devices.night_signal')}
                    </p>
                    <p className="t-meta">{c('devices.demo_artist')}</p>
                    <span className="grow"></span>
                    <div className="prog">
                      <i className="sync-bar"></i>
                    </div>
                    <div className="times">
                      <span>{'1:38'}</span>
                      <span>{'3:56'}</span>
                    </div>
                  </div>
                </div>
                <span className="label">
                  {c('devices.up_next_shared_queue')}
                </span>
                <div className="qrow">
                  <span className="cv s cv2"></span>
                  <div className="grow">
                    <p className="t-title">{c('devices.echoes_in_motion')}</p>
                    <p className="t-meta">{c('devices.added_by_maya')}</p>
                  </div>
                  <span className="mono">{'4:21'}</span>
                </div>
                <div className="qrow">
                  <span className="cv s cv3"></span>
                  <div className="grow">
                    <p className="t-title">{c('devices.static_lines')}</p>
                    <p className="t-meta">{c('devices.added_by_jonah')}</p>
                  </div>
                  <span className="mono">{'3:47'}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
        <svg
          aria-hidden="true"
          className="abs d-only"
          height="160"
          style={{
            '--x': '560',
            '--y': '578',
            '--w': '130',
            overflow: 'visible',
          }}
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
          className="abs persp d-only"
          style={{ '--x': '379', '--y': '196', '--w': '245' }}
        >
          <div
            className="phone"
            data-a="win"
            style={{ height: '595px', boxSizing: 'border-box' }}
          >
            <div
              className="row mono"
              style={{ justifyContent: 'space-between' }}
            >
              <span style={{ color: 'var(--fg)' }}>{'9:41'}</span>
              <span>{'\u25cf\u25cf\u25cf'}</span>
            </div>
            <div className="row" style={{ marginTop: '22px', gap: '8px' }}>
              <b style={{ font: '600 14px/1 var(--font-display)' }}>
                {c('devices.bitrate')}
              </b>
            </div>
            <span
              className="pill"
              style={{ display: 'inline-block', marginTop: '14px' }}
            >
              {c('devices.jam_after_hours')}
            </span>
            <div
              className="art"
              style={{ height: '190px', marginTop: '16px' }}
            ></div>
            <p
              className="t-title"
              style={{
                font: '600 18px/1.1 var(--font-display)',
                marginTop: '16px',
              }}
            >
              {c('devices.night_signal')}
            </p>
            <p className="t-meta">{c('devices.demo_artist')}</p>
            <div className="prog" style={{ marginTop: '16px' }}>
              <i className="sync-bar"></i>
            </div>
            <div className="times">
              <span>{'1:38'}</span>
              <span>{'3:56'}</span>
            </div>
            <div
              className="transport"
              style={{ marginTop: '16px', gap: '20px' }}
            >
              <svg aria-hidden="true" className="i">
                <use href="#i-prev" />
              </svg>
              <span
                className="playbtn"
                style={{ width: '46px', height: '46px' }}
              >
                <svg aria-hidden="true" className="i">
                  <use href="#i-pause" />
                </svg>
              </span>
              <svg aria-hidden="true" className="i">
                <use href="#i-next" />
              </svg>
            </div>
          </div>
        </div>
        <div
          className="abs card"
          data-a="win"
          style={{ '--x': '365', '--y': '682', '--w': '272' }}
        >
          <div className="col" style={{ padding: '16px', gap: '10px' }}>
            <p
              className="t-title"
              style={{ font: '600 16px/1 var(--font-display)' }}
            >
              {c('devices.bitrate_connect')}
            </p>
            <div className="row">
              <svg
                aria-hidden="true"
                className="i"
                style={{ color: 'var(--accent)' }}
              >
                <use href="#i-phone" />
              </svg>
              <div className="grow">
                <p className="t-title" style={{ fontSize: '12px' }}>
                  {c('devices.this_phone')}
                </p>
                <p className="t-meta" style={{ fontSize: '10px' }}>
                  {c('devices.ready_to_play')}
                </p>
              </div>
            </div>
            <div className="row">
              <svg
                aria-hidden="true"
                className="i"
                style={{ color: 'var(--muted)' }}
              >
                <use href="#i-laptop" />
              </svg>
              <div className="grow">
                <p className="t-title" style={{ fontSize: '12px' }}>
                  {c('devices.desktop_playing')}
                </p>
              </div>
              <span className="live ok">
                <i></i>
              </span>
            </div>
            <a className="btn btn-primary btn-sm magnetic" href="#devices">
              {c('devices.move_playback_to_this_phone')}
            </a>
          </div>
        </div>
        <div
          className="abs row d-only"
          style={{
            '--x': '48',
            '--y': '854',
            '--w': '1360',
            justifyContent: 'space-between',
          }}
        >
          <span className="sig">{c('devices.music_lives_on')}</span>
          <span className="disc">
            {c('devices.feature_concept_demo_content')}
          </span>
        </div>
      </div>
    </section>
  )
}

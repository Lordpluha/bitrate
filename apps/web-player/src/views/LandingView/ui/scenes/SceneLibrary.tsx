'use client'

import { useLandingCopy } from '../../model/useLandingCopy'

/** Scene "Library" — ported from the motion prototype; the landing engine animates it after mount. */
export const SceneLibrary = () => {
  const c = useLandingCopy()
  return (
    <section
      aria-label={c('library.a_library_with_a_memory')}
      className="scene"
      data-label="Library"
      id="library"
    >
      <div className="board">
        <div
          className="abs"
          style={{ '--x': '48', '--y': '104', '--w': '700' }}
        >
          <div className="eyebrow" data-a="up" style={{ marginBottom: '14px' }}>
            {c('library.your_collection_connected')}
          </div>
          <h2 className="h h56">
            <span className="line">
              <span>
                {c('library.a_library_with')}{' '}
                <span className="hl">{c('library.a_memory')}</span>
              </span>
            </span>
          </h2>
          <p className="lede" data-a="up" style={{ marginTop: '12px' }}>
            {c('library.find_it_faster_keep_it_organised_bring_a')}
          </p>
        </div>
        <div
          className="abs persp"
          style={{ '--x': '32', '--y': '270', '--w': '1376' }}
        >
          <div className="win" data-a="win">
            <div
              className="row"
              style={{ alignItems: 'stretch', gap: '0', height: '570px' }}
            >
              <div
                className="col d-only"
                style={{
                  width: '224px',
                  padding: '18px',
                  gap: '6px',
                  borderRight: '1px solid var(--border)',
                  boxSizing: 'border-box',
                }}
              >
                <span className="label">{c('library.your_library')}</span>
                <div
                  className="row"
                  style={{ gap: '6px', margin: '6px 0 4px' }}
                >
                  <span className="chip on">{c('library.playlists')}</span>
                  <span className="chip">{c('library.artists')}</span>
                </div>
                <div className="qrow now">
                  <span className="cv s cv2"></span>
                  <div>
                    <p className="t-title">{c('library.night_drive')}</p>
                    <p className="t-meta">{c('library.24_tracks')}</p>
                  </div>
                </div>
                <div className="qrow">
                  <span
                    className="cv s"
                    style={{
                      background: 'linear-gradient(135deg,#7c3aed,#ec4899)',
                    }}
                  ></span>
                  <div>
                    <p className="t-title">{c('library.liked_songs')}</p>
                    <p className="t-meta">{c('library.128_tracks')}</p>
                  </div>
                </div>
                <div className="qrow">
                  <span className="cv s cv3"></span>
                  <div>
                    <p className="t-title">{c('library.rain_drive')}</p>
                    <p className="t-meta">{c('library.31_tracks')}</p>
                  </div>
                </div>
                <div className="qrow">
                  <span className="cv s cv4"></span>
                  <div>
                    <p className="t-title">{c('library.ambient_mornings')}</p>
                    <p className="t-meta">{c('library.18_tracks')}</p>
                  </div>
                </div>
                <span className="grow"></span>
                <p className="t-meta" style={{ fontSize: '11px' }}>
                  {c('library.browse_previous_versions_bring_the_right')}
                </p>
              </div>
              <div
                className="col grow d-only"
                style={{ padding: '18px 22px', gap: '4px' }}
              >
                <div className="row" style={{ marginBottom: '8px' }}>
                  <div
                    className="soft row grow"
                    style={{
                      padding: '10px 14px',
                      gap: '10px',
                      borderRadius: '10px',
                    }}
                  >
                    <svg
                      aria-hidden="true"
                      className="i"
                      style={{ width: '15px', color: 'var(--muted)' }}
                    >
                      <use href="#i-search" />
                    </svg>
                    <span id="libQ">{c('library.night')}</span>
                    <span style={{ color: 'var(--accent)' }}>{'\u258d'}</span>
                  </div>
                  <span className="chip on">{c('library.tracks')}</span>
                  <span className="chip">{c('library.albums')}</span>
                </div>
                <div className="lrow hd">
                  <span>{'#'}</span>
                  <span></span>
                  <span>{c('library.title')}</span>
                  <span>{c('library.album')}</span>
                  <span>{c('library.time')}</span>
                </div>
                <div className="lrow lres">
                  <span className="mono">{'1'}</span>
                  <span className="cv s cv1"></span>
                  <span>
                    <b>{c('library.night_signal')}</b>
                    <br />
                    <span className="t-meta">{c('library.mira_sol')}</span>
                  </span>
                  <span className="t-meta">{c('library.night_signal')}</span>
                  <span className="mono">{'3:56'}</span>
                </div>
                <div className="lrow lres">
                  <span className="mono">{'2'}</span>
                  <span className="cv s cv2"></span>
                  <span>
                    <b>{c('library.night_drive_theme')}</b>
                    <br />
                    <span className="t-meta">{c('library.kite_harbor')}</span>
                  </span>
                  <span className="t-meta">{c('library.harbor_lights')}</span>
                  <span className="mono">{'4:02'}</span>
                </div>
                <div className="lrow lres">
                  <span className="mono">{'3'}</span>
                  <span className="cv s cv4"></span>
                  <span>
                    <b>{c('library.nightfall_static')}</b>
                    <br />
                    <span className="t-meta">
                      {c('library.nova_the_static')}
                    </span>
                  </span>
                  <span className="t-meta">{c('library.afterglow')}</span>
                  <span className="mono">{'3:21'}</span>
                </div>
                <div className="lrow lres">
                  <span className="mono">{'4'}</span>
                  <span className="cv s cv3"></span>
                  <span>
                    <b>{c('library.midnight_echoes')}</b>
                    <br />
                    <span className="t-meta">{c('library.lumen_choir')}</span>
                  </span>
                  <span className="t-meta">
                    {c('library.echoes_in_motion')}
                  </span>
                  <span className="mono">{'4:48'}</span>
                </div>
                <div className="lrow lres">
                  <span className="mono">{'5'}</span>
                  <span className="cv s cv5"></span>
                  <span>
                    <b>{c('library.low_orbit_night_mix')}</b>
                    <br />
                    <span className="t-meta">{c('library.luma_vale')}</span>
                  </span>
                  <span className="t-meta">{c('library.low_orbit')}</span>
                  <span className="mono">{'3:30'}</span>
                </div>
              </div>
              <div
                className="col"
                style={{
                  width: '318px',
                  padding: '20px',
                  gap: '6px',
                  borderLeft: '1px solid var(--border)',
                  boxSizing: 'border-box',
                }}
              >
                <div className="row">
                  <svg
                    aria-hidden="true"
                    className="i"
                    style={{ color: 'var(--accent)' }}
                  >
                    <use href="#i-history" />
                  </svg>
                  <div>
                    <p className="t-title">{c('library.night_drive')}</p>
                    <p className="t-meta">{c('library.playlist_history')}</p>
                  </div>
                </div>
                <div style={{ position: 'relative', marginTop: '8px' }}>
                  <span className="vline"></span>
                  <div className="vrow">
                    <span className="dot"></span>
                    <div>
                      <p className="t-title">{c('library.today')}</p>
                      <p className="t-meta">{c('library.24_tracks')}</p>
                    </div>
                    <span className="pill">{c('library.current')}</span>
                  </div>
                  <div className="vrow sel">
                    <span className="dot"></span>
                    <div>
                      <p className="t-title">{c('library.yesterday')}</p>
                      <p className="t-meta">{c('library.21_tracks')}</p>
                    </div>
                    <span className="pill acc">{c('library.selected')}</span>
                  </div>
                  <div className="vrow">
                    <span className="dot"></span>
                    <div>
                      <p className="t-title">{c('library.sep_02')}</p>
                      <p className="t-meta">{c('library.18_tracks')}</p>
                    </div>
                    <span className="pill">{c('library.saved')}</span>
                  </div>
                </div>
                <div
                  className="soft"
                  style={{
                    padding: '12px',
                    fontSize: '12px',
                    color: 'var(--muted)',
                  }}
                >
                  {c('library.changes_in_this_version')}
                  <br />
                  <b style={{ color: 'var(--success)' }}>
                    {c('library.3_tracks_added')}
                  </b>{' '}
                  {'\u00b7'}{' '}
                  <b style={{ color: 'var(--magenta)' }}>
                    {c('library.1_removed')}
                  </b>
                </div>
                <span className="grow"></span>
                <a className="btn btn-primary btn-sm magnetic" href="#library">
                  {c('library.restore_this_version')}
                </a>
                <p className="t-meta" style={{ textAlign: 'center' }}>
                  {c('library.your_current_version_stays_in_history')}
                </p>
              </div>
            </div>
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
          <span className="sig">{c('library.music_lives_on')}</span>
          <span className="disc">
            {c('library.feature_concept_demo_content')}
          </span>
        </div>
      </div>
    </section>
  )
}

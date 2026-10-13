'use client'

import { useLandingCopy } from '../../model/useLandingCopy'

/** Scene "Discover" — ported from the motion prototype; the landing engine animates it after mount. */
export const SceneDiscover = () => {
  const c = useLandingCopy()
  return (
    <section
      aria-label={c('discover.follow_the_sound')}
      className="scene"
      data-label="Discover"
      id="discover"
    >
      <div className="board">
        <div
          className="abs card d-only"
          data-a="win"
          style={{ '--x': '24', '--y': '112', '--w': '82', '--h': '600' }}
        >
          <div className="rail-nav">
            <span>
              <svg aria-hidden="true" className="i">
                <use href="#i-home" />
              </svg>
              {c('discover.home')}
            </span>
            <span className="on">
              <svg
                aria-hidden="true"
                className="i"
                style={{ color: 'var(--accent)' }}
              >
                <use href="#i-compass" />
              </svg>
              {c('discover.discover')}
            </span>
            <span>
              <svg aria-hidden="true" className="i">
                <use href="#i-lib" />
              </svg>
              {c('discover.library')}
            </span>
            <span>
              <svg aria-hidden="true" className="i">
                <use href="#i-layers" />
              </svg>
              {c('discover.playlists')}
            </span>
            <span>
              <svg aria-hidden="true" className="i">
                <use href="#i-user" />
              </svg>
              {c('discover.profile')}
            </span>
          </div>
        </div>
        <div
          className="abs"
          style={{ '--x': '144', '--y': '98', '--w': '640' }}
        >
          <div className="eyebrow" data-a="up" style={{ marginBottom: '14px' }}>
            {c('discover.discover_the_connections')}
          </div>
          <h2 className="h h54">
            <span className="line">
              <span>
                {c('discover.follow_the')}{' '}
                <span className="hl">{c('discover.sound')}</span>
              </span>
            </span>
          </h2>
          <p className="lede s" data-a="up" style={{ marginTop: '12px' }}>
            {c('discover.explore_the_artists_influences_and_scene')}
          </p>
        </div>
        <div
          className="abs legend d-only"
          data-a="up"
          style={{ '--x': '666', '--y': '228', '--w': '420' }}
        >
          <span>
            <i style={{ background: 'var(--accent)' }}></i>
            {c('discover.influenced_by')}
          </span>
          <span>
            <i style={{ background: 'var(--magenta)' }}></i>
            {c('discover.similar_sound')}
          </span>
          <span>
            <i style={{ background: 'var(--blue)' }}></i>
            {c('discover.shared_scene')}
          </span>
        </div>
        <div
          className="abs graph d-only"
          style={{ '--x': '132', '--y': '262', '--w': '932', '--h': '447' }}
        >
          <svg
            aria-hidden="true"
            height="447"
            style={{ position: 'absolute', inset: '0' }}
            viewBox="0 0 932 447"
            width="932"
          >
            <path className="p-inf" d="M540 261 C 470 160, 400 90, 336 38" />
            <path className="p-scn" d="M540 261 C 650 170, 760 90, 798 38" />
            <path className="p-sim" d="M540 261 C 400 230, 250 200, 113 182" />
            <path className="p-sim" d="M540 261 C 420 300, 260 340, 127 353" />
            <path className="p-sim" d="M540 261 C 660 220, 760 160, 828 142" />
            <path className="p-scn" d="M540 261 C 650 280, 760 300, 829 305" />
            <path className="p-scn" d="M540 261 C 530 320, 500 380, 486 408" />
            <path className="p-sim" d="M540 261 C 640 330, 760 390, 822 407" />
          </svg>
          <span className="node" style={{ left: '216px', top: '0' }}>
            <span
              className="av"
              style={{ background: 'linear-gradient(135deg,#7c3aed,#3b82f6)' }}
            >
              {c('discover.ms')}
            </span>
            <span>
              <b>{c('discover.mira_sol')}</b>
              <small>{c('discover.influence_dream_pop')}</small>
            </span>
          </span>
          <span className="node" style={{ left: '668px', top: '0' }}>
            <span
              className="av"
              style={{ background: 'linear-gradient(135deg,#3b82f6,#0ea5e9)' }}
            >
              {c('discover.np')}
            </span>
            <span>
              <b>{c('discover.night_pulse_collective')}</b>
              <small>{c('discover.shared_scene')}</small>
            </span>
          </span>
          <span className="node" style={{ left: '0', top: '144px' }}>
            <span
              className="av"
              style={{ background: 'linear-gradient(135deg,#ec4899,#7c3aed)' }}
            >
              {c('discover.sb')}
            </span>
            <span>
              <b>{c('discover.static_bloom')}</b>
              <small>{c('discover.similar_sound')}</small>
            </span>
          </span>
          <span className="node" style={{ left: '14px', top: '315px' }}>
            <span
              className="av"
              style={{ background: 'linear-gradient(135deg,#be185d,#f59e0b)' }}
            >
              {c('discover.as')}
            </span>
            <span>
              <b>{c('discover.auren_sky')}</b>
              <small>{c('discover.similar_sound')}</small>
            </span>
          </span>
          <span className="node" style={{ left: '724px', top: '104px' }}>
            <span
              className="av"
              style={{ background: 'linear-gradient(135deg,#db2777,#4c1d95)' }}
            >
              {c('discover.vc')}
            </span>
            <span>
              <b>{c('discover.velvet_coast')}</b>
              <small>{c('discover.similar_sound')}</small>
            </span>
          </span>
          <span className="node" style={{ left: '726px', top: '267px' }}>
            <span
              className="av"
              style={{ background: 'linear-gradient(135deg,#0ea5e9,#312e81)' }}
            >
              {c('discover.kh')}
            </span>
            <span>
              <b>{c('discover.kite_halo')}</b>
              <small>{c('discover.shared_scene')}</small>
            </span>
          </span>
          <span className="node" style={{ left: '357px', top: '370px' }}>
            <span
              className="av"
              style={{ background: 'linear-gradient(135deg,#1d4ed8,#7c3aed)' }}
            >
              {c('discover.ad')}
            </span>
            <span>
              <b>{c('discover.afterhours_district')}</b>
              <small>{c('discover.shared_scene')}</small>
            </span>
          </span>
          <span className="node" style={{ left: '712px', top: '369px' }}>
            <span
              className="av"
              style={{ background: 'linear-gradient(135deg,#6d28d9,#ec4899)' }}
            >
              {c('discover.gh')}
            </span>
            <span>
              <b>{c('discover.glass_harbour')}</b>
              <small>{c('discover.similar_sound')}</small>
            </span>
          </span>
          <span
            className="node focus"
            style={{
              left: '468px',
              top: '174px',
              width: '144px',
              height: '174px',
              boxSizing: 'border-box',
            }}
          >
            <span
              className="av"
              style={{ background: 'linear-gradient(135deg,#a78bfa,#ec4899)' }}
            >
              {c('discover.lv')}
            </span>
            <b>{c('discover.luma_vale')}</b>
            <small>{c('discover.you_are_here')}</small>
          </span>
          <span className="tag" style={{ left: '344px', top: '100px' }}>
            {c('discover.influenced_by')}
          </span>
          <span className="tag" style={{ left: '248px', top: '210px' }}>
            {c('discover.similar_sound')}
          </span>
          <span className="tag" style={{ left: '619px', top: '313px' }}>
            {c('discover.shared_scene')}
          </span>
          <span className="tag" style={{ left: '599px', top: '147px' }}>
            {c('discover.similar_sound')}
          </span>
        </div>
        <div
          className="abs card"
          data-a="win"
          style={{ '--x': '1090', '--y': '104', '--w': '318' }}
        >
          <div className="col" style={{ padding: '20px', gap: '12px' }}>
            <div className="art d-only" style={{ height: '170px' }}></div>
            <p
              className="t-title"
              style={{ font: '700 29px/1 var(--font-display)' }}
            >
              {c('discover.luma_vale')}
            </p>
            <div className="row" style={{ gap: '8px' }}>
              <span className="chip">{c('discover.electronic')}</span>
              <span className="chip">{c('discover.dream_pop')}</span>
              <span className="chip">{c('discover.night')}</span>
            </div>
            <p className="mono" style={{ color: 'var(--accent)' }}>
              {c('discover.illustrative_connection')}
            </p>
            <p className="t-title">{c('discover.why_this_connection')}</p>
            <p className="t-meta" style={{ fontSize: '14px' }}>
              {c('discover.dreamlike_synth_textures_spacious_vocals')}
            </p>
            <p className="t-title d-only" style={{ marginTop: '6px' }}>
              {c('discover.top_tracks')}
            </p>
            <div className="qrow d-only" style={{ padding: '6px 0' }}>
              <span className="cv s cv1"></span>
              <div className="grow">
                <p className="t-title" style={{ fontSize: '12px' }}>
                  {c('discover.night_signal')}
                </p>
                <p className="t-meta">{'3:56'}</p>
              </div>
            </div>
            <div className="qrow d-only" style={{ padding: '6px 0' }}>
              <span className="cv s cv3"></span>
              <div className="grow">
                <p className="t-title" style={{ fontSize: '12px' }}>
                  {c('discover.glass_horizon')}
                </p>
                <p className="t-meta">{'4:28'}</p>
              </div>
            </div>
            <a
              className="btn btn-primary btn-sm magnetic d-only"
              href="#discover"
            >
              {c('discover.explore_this_artist')}{' '}
              <svg aria-hidden="true" className="i">
                <use href="#i-arrow" />
              </svg>
            </a>
          </div>
        </div>
        <div
          className="abs card route d-only"
          data-a="win"
          style={{ '--x': '132', '--y': '736', '--w': '932', '--h': '75' }}
        >
          <div>
            <p className="t-title">{c('discover.your_explored_route')}</p>
            <p className="t-meta">{c('discover.3_steps_follow_the_journey')}</p>
          </div>
          <span className="grow"></span>
          <span className="n">{'1'}</span>
          <b>{c('discover.luma_vale')}</b>
          <svg
            aria-hidden="true"
            className="i"
            style={{ color: 'var(--subdued)' }}
          >
            <use href="#i-arrow" />
          </svg>
          <span className="n">{'2'}</span>
          <b>{c('discover.mira_sol')}</b>
          <svg
            aria-hidden="true"
            className="i"
            style={{ color: 'var(--subdued)' }}
          >
            <use href="#i-arrow" />
          </svg>
          <span className="n">{'3'}</span>
          <b>{c('discover.night_pulse_collective')}</b>
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
          <span className="sig">{c('discover.music_lives_on')}</span>
          <span className="disc">
            {c('discover.feature_concept_demo_content')}
          </span>
        </div>
      </div>
    </section>
  )
}

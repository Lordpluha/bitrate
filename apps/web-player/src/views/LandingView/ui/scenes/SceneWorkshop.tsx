'use client'

import { useLandingCopy } from '../../model/useLandingCopy'

/** Scene "Workshop" — ported from the motion prototype; the landing engine animates it after mount. */
export const SceneWorkshop = () => {
  const c = useLandingCopy()
  return (
    <section
      aria-label={c('workshop.start_with_a_feeling_finish_with_your_pl')}
      className="scene"
      data-label="Workshop"
      id="workshop"
    >
      <div className="board">
        <div
          className="abs row d-only"
          data-a="up"
          style={{
            '--x': '60',
            '--y': '96',
            '--w': '1320',
            borderBottom: '1px solid var(--border)',
            paddingBottom: '14px',
          }}
        >
          <span className="mono" style={{ color: 'var(--fg)' }}>
            {c('workshop.bitrate')}
          </span>
          <span className="t-meta grow">
            {c('workshop.more_music_more_you')}
          </span>
          <span className="label">
            {c('workshop.playlist_builder_concept')}
          </span>
        </div>
        <div
          className="abs"
          style={{ '--x': '60', '--y': '186', '--w': '380' }}
        >
          <h2 className="h h48">
            <span className="line">
              <span>{c('workshop.start_with_a')}</span>
            </span>
            <span className="line">
              <span>{c('workshop.feeling_finish')}</span>
            </span>
            <span className="line">
              <span className="hl">{c('workshop.with_your_playlist')}</span>
            </span>
          </h2>
          <p className="lede s" data-a="up" style={{ marginTop: '22px' }}>
            {c('workshop.describe_the_session_compare_a_few_track')}
          </p>
          <div
            className="col d-only"
            style={{ marginTop: '34px', gap: '20px' }}
          >
            <div
              className="row"
              data-a="up"
              style={{ alignItems: 'flex-start' }}
            >
              <span
                className="medal"
                style={{ width: '44px', height: '44px', borderRadius: '12px' }}
              >
                <svg aria-hidden="true" className="i">
                  <use href="#i-zap" />
                </svg>
              </span>
              <div>
                <p className="t-title">
                  {c('workshop.turn_intent_into_music')}
                </p>
                <p className="t-meta">
                  {c('workshop.describe_the_mood_the_activity_or_the_mo')}
                </p>
              </div>
            </div>
            <div
              className="row"
              data-a="up"
              style={{ alignItems: 'flex-start' }}
            >
              <span
                className="medal"
                style={{ width: '44px', height: '44px', borderRadius: '12px' }}
              >
                <svg aria-hidden="true" className="i">
                  <use href="#i-layers" />
                </svg>
              </span>
              <div>
                <p className="t-title">{c('workshop.compare_and_refine')}</p>
                <p className="t-meta">
                  {c('workshop.rank_a_few_tracks_swap_the_ones_that_do')}
                </p>
              </div>
            </div>
            <div
              className="row"
              data-a="up"
              style={{ alignItems: 'flex-start' }}
            >
              <span
                className="medal"
                style={{ width: '44px', height: '44px', borderRadius: '12px' }}
              >
                <svg aria-hidden="true" className="i">
                  <use href="#i-sliders" />
                </svg>
              </span>
              <div>
                <p className="t-title">{c('workshop.you_stay_in_control')}</p>
                <p className="t-meta">
                  {c('workshop.approve_reorder_or_replace_nothing_is_fi')}
                </p>
              </div>
            </div>
          </div>
        </div>
        <div
          className="abs persp"
          style={{ '--x': '466', '--y': '166', '--w': '934' }}
        >
          <div className="win" data-a="win">
            <div className="wbar d-only" style={{ height: '62px' }}>
              <span className="dots3">
                <i></i>
                <i></i>
                <i></i>
              </span>
              <span
                className="grow"
                style={{
                  color: 'var(--fg)',
                  letterSpacing: '.04em',
                  fontSize: '12px',
                }}
              >
                {c('workshop.workshop_untitled_session')}
              </span>
              <span className="pill">{c('workshop.draft')}</span>
            </div>
            <div
              className="d-only"
              style={{
                padding: '18px 60px',
                borderBottom: '1px solid var(--border)',
              }}
            >
              <div
                className="steps"
                style={{ gridTemplateColumns: 'repeat(4,1fr)' }}
              >
                <span className="track"></span>
                <span
                  className="fill"
                  id="wsFill"
                  style={{ transform: 'scaleX(.66)' }}
                ></span>
                <div className="step done">
                  <b>{'\u2713'}</b>
                  {c('workshop.describe')}
                </div>
                <div className="step done">
                  <b>{'\u2713'}</b>
                  {c('workshop.shape')}
                </div>
                <div className="step now">
                  <b>{'3'}</b>
                  {c('workshop.compare')}
                </div>
                <div className="step">
                  <b>{'4'}</b>
                  {c('workshop.approve')}
                </div>
              </div>
            </div>
            <div
              className="row"
              style={{ alignItems: 'stretch', gap: '18px', padding: '20px' }}
            >
              <div
                className="col d-only"
                style={{ width: '300px', gap: '12px' }}
              >
                <span className="label">{c('workshop.your_session')}</span>
                <div
                  className="soft"
                  style={{
                    padding: '14px',
                    fontSize: '14px',
                    minHeight: '96px',
                  }}
                >
                  <span id="typed">{c('workshop.prompt')}</span>
                  <span style={{ color: 'var(--accent)' }}>{'\u258d'}</span>
                </div>
                <div className="row" style={{ flexWrap: 'wrap', gap: '8px' }}>
                  <span className="chip on">{c('workshop.calm')}</span>
                  <span className="chip">{c('workshop.late_night')}</span>
                  <span className="chip on">{'45 min'}</span>
                  <span className="chip">{c('workshop.from_liked_songs')}</span>
                </div>
                <span className="label" style={{ marginTop: '6px' }}>
                  {c('workshop.signals')}
                </span>
                <div className="meter">
                  <div
                    className="row t-meta"
                    style={{ justifyContent: 'space-between' }}
                  >
                    <span>{c('workshop.energy')}</span>
                    <span>{c('workshop.low')}</span>
                  </div>
                  <div className="prog">
                    <i style={{ transform: 'scaleX(.28)' }}></i>
                  </div>
                </div>
                <div className="meter">
                  <div
                    className="row t-meta"
                    style={{ justifyContent: 'space-between' }}
                  >
                    <span>{c('workshop.tempo')}</span>
                    <span>{'88 BPM'}</span>
                  </div>
                  <div className="prog">
                    <i style={{ transform: 'scaleX(.46)' }}></i>
                  </div>
                </div>
                <div className="meter">
                  <div
                    className="row t-meta"
                    style={{ justifyContent: 'space-between' }}
                  >
                    <span>{c('workshop.mood')}</span>
                    <span>{c('workshop.warm')}</span>
                  </div>
                  <div className="prog">
                    <i style={{ transform: 'scaleX(.72)' }}></i>
                  </div>
                </div>
              </div>
              <div className="col grow" style={{ gap: '10px' }}>
                <div
                  className="row label"
                  style={{ justifyContent: 'space-between' }}
                >
                  <span>{c('workshop.candidates')}</span>
                  <span>{c('workshop.ranked_by_fit')}</span>
                </div>
                <div className="col" id="stack" style={{ gap: '8px' }}>
                  <div className="cand">
                    <span className="r">{'#1'}</span>
                    <span className="cv s cv1"></span>
                    <div className="grow">
                      <p className="t-title">{c('workshop.afterglow')}</p>
                      <p className="t-meta">
                        {c('workshop.nova_the_static_3_42')}
                      </p>
                    </div>
                    <span className="pill ok">{'96% fit'}</span>
                  </div>
                  <div className="cand">
                    <span className="r">{'#2'}</span>
                    <span className="cv s cv2"></span>
                    <div className="grow">
                      <p className="t-title">{c('workshop.night_signal')}</p>
                      <p className="t-meta">{c('workshop.mira_sol_3_56')}</p>
                    </div>
                    <span className="pill">{'91% fit'}</span>
                  </div>
                  <div className="cand">
                    <span className="r">{'#3'}</span>
                    <span className="cv s cv3"></span>
                    <div className="grow">
                      <p className="t-title">{c('workshop.static_lines')}</p>
                      <p className="t-meta">{c('workshop.kite_harbor_3_47')}</p>
                    </div>
                    <span className="pill">{'88% fit'}</span>
                  </div>
                  <div className="cand">
                    <span className="r">{'#4'}</span>
                    <span className="cv s cv4"></span>
                    <div className="grow">
                      <p className="t-title">
                        {c('workshop.echoes_in_motion')}
                      </p>
                      <p className="t-meta">{c('workshop.lumen_choir_4_21')}</p>
                    </div>
                    <span className="pill">{'84% fit'}</span>
                  </div>
                </div>
              </div>
            </div>
            <div
              className="row d-only"
              style={{
                height: '56px',
                padding: '0 20px',
                borderTop: '1px solid var(--border)',
                gap: '10px',
              }}
            >
              <span className="mono">{c('workshop.12_tracks_44_min')}</span>
              <span className="grow"></span>
              <a className="btn btn-ghost btn-xs" href="#workshop">
                {c('workshop.swap_two')}
              </a>
              <a className="btn btn-primary btn-xs" href="#workshop">
                {c('workshop.approve_playlist')}
              </a>
            </div>
          </div>
        </div>
        <div
          className="abs row d-only"
          style={{
            '--x': '60',
            '--y': '846',
            '--w': '1320',
            justifyContent: 'space-between',
          }}
        >
          <span className="disc">
            {c('workshop.playlist_workshop_concept_demonstration')}
          </span>
          <span
            style={{
              font: '500 16px/1 var(--font-display)',
              color: 'var(--muted)',
            }}
          >
            {c('workshop.your_mood_your_order_your_playlist')}
          </span>
        </div>
      </div>
    </section>
  )
}

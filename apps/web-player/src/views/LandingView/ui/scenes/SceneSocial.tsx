'use client'

import { useLandingCopy } from '../../model/useLandingCopy'

/** Scene "Social" — ported from the motion prototype; the landing engine animates it after mount. */
export const SceneSocial = () => {
  const c = useLandingCopy()
  return (
    <section
      aria-label={c('social.beyond_the_play_button')}
      className="scene"
      data-label="Social"
      id="social"
    >
      <div className="board">
        <div
          className="abs"
          style={{ '--x': '48', '--y': '120', '--w': '330' }}
        >
          <div className="eyebrow" data-a="up" style={{ marginBottom: '18px' }}>
            {c('social.music_is_a_conversation')}
          </div>
          <h2 className="h h54">
            <span className="line">
              <span>{c('social.beyond_the')}</span>
            </span>
            <span className="line">
              <span className="hl">{c('social.play_button')}</span>
            </span>
          </h2>
          <p className="lede s" data-a="up" style={{ marginTop: '20px' }}>
            {c('social.share_the_moment_follow_a_friend_s_taste')}
          </p>
        </div>
        <div
          className="abs card"
          data-a="win"
          style={{ '--x': '43', '--y': '410', '--w': '317' }}
        >
          <div className="col" style={{ padding: '20px', gap: '12px' }}>
            <div className="row">
              <span
                className="av"
                style={{
                  width: '60px',
                  height: '60px',
                  fontSize: '16px',
                  background: 'linear-gradient(135deg,#db2777,#7c3aed)',
                  border: '0',
                }}
              >
                {c('social.mr')}
              </span>
              <div>
                <p
                  className="t-title"
                  style={{ font: '600 19px/1.1 var(--font-display)' }}
                >
                  {c('social.maya_s_listening')}
                </p>
                <p className="t-meta">{c('social.her_music_lately')}</p>
              </div>
            </div>
            <div className="row" style={{ gap: '8px' }}>
              <span className="chip">{c('social.electronic')}</span>
              <span className="chip">{c('social.ambient')}</span>
              <span className="chip">{c('social.uk_garage')}</span>
            </div>
            <p className="t-title d-only" style={{ marginTop: '4px' }}>
              {c('social.taste_history')}
            </p>
            <div
              className="d-only t-meta"
              style={{ fontSize: '13px', display: 'grid', gap: '8px' }}
            >
              <span>
                <b style={{ color: 'var(--fg)' }}>{c('social.this_month')}</b>{' '}
                {c('social.broken_beat')}
              </span>
              <span>
                <b style={{ color: 'var(--fg)' }}>{c('social.last_month')}</b>{' '}
                {c('social.ambient')}
              </span>
            </div>
            <div
              className="row"
              style={{ justifyContent: 'space-between', marginTop: '6px' }}
            >
              <span className="t-meta">{c('social.recently_saved')}</span>
              <a className="btn btn-ghost btn-xs magnetic" href="#social">
                {c('social.explore_profile')}
              </a>
            </div>
          </div>
        </div>
        <div
          className="abs persp d-only"
          style={{ '--x': '394', '--y': '109', '--w': '1014' }}
        >
          <div className="win" data-a="win" style={{ height: '723px' }}>
            <div
              className="row"
              style={{
                alignItems: 'stretch',
                gap: '18px',
                padding: '18px',
                height: '100%',
                boxSizing: 'border-box',
              }}
            >
              <div
                className="col"
                style={{
                  width: '146px',
                  gap: '14px',
                  fontSize: '12px',
                  color: 'var(--muted)',
                  paddingTop: '30px',
                }}
              >
                <span className="label">{c('social.friends')}</span>
                <span className="row" style={{ gap: '8px' }}>
                  <span
                    className="av"
                    style={{
                      width: '26px',
                      height: '26px',
                      background: '#db2777',
                    }}
                  >
                    {c('social.mr')}
                  </span>
                  {c('social.maya')}{' '}
                  <i
                    style={{
                      width: '7px',
                      height: '7px',
                      borderRadius: '50%',
                      background: 'var(--accent)',
                    }}
                  ></i>
                </span>
                <span className="row" style={{ gap: '8px' }}>
                  <span
                    className="av"
                    style={{
                      width: '26px',
                      height: '26px',
                      background: '#0ea5e9',
                    }}
                  >
                    {c('social.jp')}
                  </span>
                  {c('social.jonah')}{' '}
                  <i
                    style={{
                      width: '7px',
                      height: '7px',
                      borderRadius: '50%',
                      background: 'var(--success)',
                    }}
                  ></i>
                </span>
                <span className="row" style={{ gap: '8px' }}>
                  <span
                    className="av"
                    style={{
                      width: '26px',
                      height: '26px',
                      background: '#334155',
                    }}
                  >
                    {c('social.as')}
                  </span>
                  {c('social.ana')}
                </span>
              </div>
              <div
                className="col grow"
                style={{ gap: '14px', paddingTop: '30px' }}
              >
                <div className="row">
                  <span
                    className="art"
                    style={{ width: '96px', height: '96px', flex: 'none' }}
                  ></span>
                  <div className="grow">
                    <span className="label" style={{ color: 'var(--accent)' }}>
                      {c('social.track_discussion')}
                    </span>
                    <p
                      className="t-title"
                      style={{
                        font: '700 30px/1.05 var(--font-display)',
                        marginTop: '6px',
                      }}
                    >
                      {c('social.night_signal')}
                    </p>
                    <p className="t-meta">
                      {c('social.demo_artist_3_56_24_comments')}
                    </p>
                  </div>
                  <span className="pill ok">{c('social.artist_replied')}</span>
                </div>
                <div
                  style={{
                    position: 'relative',
                    height: '60px',
                    marginTop: '10px',
                  }}
                >
                  <canvas className="wave" data-seed="7"></canvas>
                  <span className="cmark" style={{ left: '18%' }}></span>
                  <span className="cmark" style={{ left: '41%' }}></span>
                  <span
                    className="cmark"
                    style={{ left: '63%', background: 'var(--accent)' }}
                  ></span>
                  <span className="cmark" style={{ left: '82%' }}></span>
                </div>
                <div className="col" style={{ gap: '0' }}>
                  <div className="cmt">
                    <span className="av" style={{ background: '#db2777' }}>
                      {c('social.mr')}
                    </span>
                    <div>
                      <p className="t-title">
                        <span className="ts">{'0:42'}</span>
                        {c('social.maya')}
                      </p>
                      <p className="t-meta" style={{ fontSize: '13px' }}>
                        {c('social.that_synth_swell_this_is_the_moment_it_o')}
                      </p>
                    </div>
                  </div>
                  <div className="cmt">
                    <span className="av" style={{ background: '#0ea5e9' }}>
                      {c('social.jp')}
                    </span>
                    <div>
                      <p className="t-title">
                        <span className="ts">{'1:36'}</span>
                        {c('social.jonah')}
                      </p>
                      <p className="t-meta" style={{ fontSize: '13px' }}>
                        {c('social.sounds_like_the_whole_city_at_2_am')}
                      </p>
                    </div>
                  </div>
                  <div className="cmt">
                    <span
                      className="av"
                      style={{
                        background: 'linear-gradient(135deg,#a78bfa,#ec4899)',
                      }}
                    >
                      {c('social.da')}
                    </span>
                    <div>
                      <p className="t-title">
                        <span className="ts">{'2:28'}</span>
                        {c('social.demo_artist')}{' '}
                        <span
                          className="pill acc"
                          style={{ padding: '3px 7px', fontSize: '10px' }}
                        >
                          {c('social.artist')}
                        </span>
                      </p>
                      <p className="t-meta" style={{ fontSize: '13px' }}>
                        {c('social.recorded_that_part_in_one_take_glad_it_l')}
                      </p>
                    </div>
                  </div>
                </div>
                <span className="grow"></span>
                <div className="soft row" style={{ padding: '12px 14px' }}>
                  <svg
                    aria-hidden="true"
                    className="i"
                    style={{ color: 'var(--muted)' }}
                  >
                    <use href="#i-msg" />
                  </svg>
                  <span className="t-meta grow">
                    {c('social.comment_at_1_38')}
                  </span>
                  <a className="btn btn-primary btn-xs" href="#social">
                    {c('social.post')}
                  </a>
                </div>
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
          <span className="sig">{c('social.music_lives_on')}</span>
          <span className="disc">
            {c('social.feature_concept_demo_content')}
          </span>
        </div>
      </div>
    </section>
  )
}

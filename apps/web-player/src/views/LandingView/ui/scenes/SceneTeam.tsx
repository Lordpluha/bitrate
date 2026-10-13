'use client'

import { useLandingCopy } from '../../model/useLandingCopy'

/** Scene "Team" — ported from the motion prototype; the landing engine animates it after mount. */
export const SceneTeam = () => {
  const c = useLandingCopy()
  return (
    <section
      aria-label={c('team.about_our_team')}
      className="scene"
      data-label="Team"
      id="team"
    >
      <div className="board">
        <div
          className="abs"
          style={{ '--x': '60', '--y': '170', '--w': '420' }}
        >
          <div className="eyebrow" data-a="up" style={{ marginBottom: '18px' }}>
            {c('team.about_our_team')}
          </div>
          <h2 className="h h56">
            <span className="line">
              <span>{c('team.small_team')}</span>
            </span>
            <span className="line">
              <span className="hl">{c('team.loud_signal')}</span>
            </span>
          </h2>
          <p className="lede s" data-a="up" style={{ marginTop: '22px' }}>
            {c('team.two_people_build_bitrate_the_player_the')}
          </p>
          <div className="stats" data-a="up">
            <span>
              <b data-v="2">{'2'}</b>
              <span className="t-meta">{c('team.people')}</span>
            </span>
            <span>
              <b data-v="9">{'9'}</b>
              <span className="t-meta">{c('team.workspaces')}</span>
            </span>
            <span>
              <b data-v="1">{'1'}</b>
              <span className="t-meta">{c('team.palette')}</span>
            </span>
          </div>
          <div className="ctas" data-a="up" style={{ marginTop: '26px' }}>
            <a
              className="btn btn-primary magnetic"
              href="https://github.com/Lordpluha/bitrate"
              rel="noopener noreferrer"
              target="_blank"
            >
              {c('team.join_us')}{' '}
              <svg aria-hidden="true" className="i">
                <use href="#i-arrow" />
              </svg>
            </a>
            <a
              className="btn btn-ghost magnetic"
              href="https://github.com/Lordpluha/bitrate/blob/develop/apps/docs/docs/guides/contributing.md"
              rel="noopener noreferrer"
              target="_blank"
            >
              {c('team.how_we_work')}
            </a>
          </div>
        </div>
        <div
          className="abs pit drag-zone"
          id="pit"
          style={{ '--x': '520', '--y': '70', '--w': '880', '--h': '780' }}
        >
          <div className="hc" id="hc" role="tooltip"></div>
        </div>
        <div
          className="abs row d-only"
          style={{
            '--x': '60',
            '--y': '854',
            '--w': '1320',
            justifyContent: 'space-between',
          }}
        >
          <span className="sig">{c('team.music_lives_on')}</span>
          <span className="disc">
            {c('team.stack_bubbles_show_where_each_technology')}
          </span>
        </div>
      </div>
    </section>
  )
}

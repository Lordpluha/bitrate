import { lc } from '../../lib/styles/lc'
import { useLandingCopy } from '../../model/useLandingCopy'
import { Abs, SceneFootnote, SceneShell } from './parts'

/** Scene "Team" — ported from the motion prototype; the landing engine animates it after mount. */
export const SceneTeam = () => {
  const c = useLandingCopy()
  return (
    <SceneShell id="team" labelKey="team.about_our_team">
      <Abs w={420} x={60} y={170}>
        <div className={lc('eyebrow', 'mb-[18px]')} data-a="up">
          {c('team.about_our_team')}
        </div>
        <h2 className={lc('h h56')}>
          <span className={lc('line')}>
            <span>{c('team.small_team')}</span>
          </span>
          <span className={lc('line')}>
            <span className={lc('hl')}>{c('team.loud_signal')}</span>
          </span>
        </h2>
        <p className={lc('lede s', 'mt-[22px]')} data-a="up">
          {c('team.two_people_build_bitrate_the_player_the')}
        </p>
        <div className={lc('stats')} data-a="up">
          <span>
            <b data-v="2">{'2'}</b>
            <span className={lc('t-meta')}>{c('team.people')}</span>
          </span>
          <span>
            <b data-v="9">{'9'}</b>
            <span className={lc('t-meta')}>{c('team.workspaces')}</span>
          </span>
          <span>
            <b data-v="1">{'1'}</b>
            <span className={lc('t-meta')}>{c('team.palette')}</span>
          </span>
        </div>
        <div className={lc('ctas', 'mt-[26px]')} data-a="up">
          <a
            className={lc('btn btn-primary magnetic')}
            href="https://github.com/Lordpluha/bitrate"
            rel="noopener noreferrer"
            target="_blank"
          >
            {c('team.join_us')}{' '}
            <svg aria-hidden="true" className={lc('i')}>
              <use href="#i-arrow" />
            </svg>
          </a>
          <a
            className={lc('btn btn-ghost magnetic')}
            href="https://github.com/Lordpluha/bitrate/blob/develop/apps/docs/docs/guides/contributing.md"
            rel="noopener noreferrer"
            target="_blank"
          >
            {c('team.how_we_work')}
          </a>
        </div>
      </Abs>
      <Abs h={780} id="pit" markers="pit drag-zone" w={880} x={520} y={70}>
        <div className={lc('hc')} id="hc" role="tooltip"></div>
      </Abs>
      <SceneFootnote
        noteKey="team.stack_bubbles_show_where_each_technology"
        w={1320}
        x={60}
        y={854}
      />
    </SceneShell>
  )
}

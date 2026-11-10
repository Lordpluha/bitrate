import { lc } from '../../lib/styles/lc'
import { CONTRIBUTING_URL, GITHUB_REPO_URL } from '../../model/links'
import { TEAM_STATS } from '../../model/team'
import { useLandingCopy } from '../../model/useLandingCopy'
import { Abs, SceneFootnote, SceneShell } from './parts'

/** Scene "Team": the team and its stack as bubbles in a jar the visitor can open and empty. */
export const SceneTeam = () => {
  const c = useLandingCopy()
  return (
    <SceneShell id="team" labelKey="team.about_our_team">
      <Abs w={420} x={60} y={150}>
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
            <b data-v={TEAM_STATS.people}>{TEAM_STATS.people}</b>
            <span className={lc('t-meta')}>{c('team.people')}</span>
          </span>
          <span>
            <b data-v={TEAM_STATS.workspaces}>{TEAM_STATS.workspaces}</b>
            <span className={lc('t-meta')}>{c('team.workspaces')}</span>
          </span>
          <span>
            <b data-v={TEAM_STATS.palette}>{TEAM_STATS.palette}</b>
            <span className={lc('t-meta')}>{c('team.palette')}</span>
          </span>
        </div>
        <div className={lc('ctas', 'mt-[26px]')} data-a="up">
          <a
            className={lc('btn btn-primary magnetic')}
            href={GITHUB_REPO_URL}
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
            href={CONTRIBUTING_URL}
            rel="noopener noreferrer"
            target="_blank"
          >
            {c('team.how_we_work')}
          </a>
        </div>
      </Abs>
      <Abs h={780} id="pit" markers="pit drag-zone" w={880} x={520} y={70}>
        <div aria-hidden="true" className={lc('jar')} id="jar">
          <i className={lc('jar-shine')} />
        </div>
        <span className={lc('jar-hint')} hidden id="jarHint">
          {c('team.jar_unscrew_hint')}
        </span>
        <button
          aria-label={c('team.jar_lid')}
          aria-pressed="false"
          className={lc('jar-lid')}
          data-jar="toggle"
          id="jarLid"
          type="button"
        />
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

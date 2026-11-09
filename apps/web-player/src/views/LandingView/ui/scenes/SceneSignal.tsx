import { useI18n } from '@shared/i18n'
import { ROUTES } from '@shared/routes'
import Link from 'next/link'
import { lc } from '../../lib/styles/lc'
import { GITHUB_REPO_URL } from '../../model/links'
import type { LandingKey } from '../../model/messages/en'
import { formatStat, type PlatformStats } from '../../model/platformStats'
import { useLandingCopy } from '../../model/useLandingCopy'
import { PlayerPreview } from './PlayerPreview'
import { Abs, SceneShell } from './parts'
import type { HeroSceneProps } from './scene.types'

const STAT_ROWS = [
  { key: 'tracks', label: 'hero.stat_tracks' },
  { key: 'artists', label: 'hero.stat_artists' },
  { key: 'listeners', label: 'hero.stat_listeners' },
] as const satisfies readonly { key: keyof PlatformStats; label: LandingKey }[]

/** Scene "Signal" — ported from the motion prototype; the landing engine animates it after mount. */
export const SceneSignal = ({ signedIn, stats }: HeroSceneProps) => {
  const c = useLandingCopy()
  const { locale } = useI18n()
  return (
    <SceneShell
      active
      id="hero"
      labelKey="hero.your_music_already_where_you_are"
    >
      <Abs w={540} x={54} y={stats ? 222 : 262}>
        <div className={lc('col', 'gap-[26px]')}>
          <div className={lc('eyebrow')} data-a="up">
            {c('hero.web_player')}
          </div>
          <h1 className={lc('h h72')}>
            <span className={lc('line')}>
              <span>{c('hero.your_music')}</span>
            </span>
            <span className={lc('line')}>
              <span>{c('hero.already_where')}</span>
            </span>
            <span className={lc('line')}>
              <span className={lc('hl')}>{c('hero.you_are')}</span>
            </span>
          </h1>
          <p className={lc('lede')} data-a="up">
            {c('hero.instant_access_in_your_browser')}
            <br />
            {c('hero.listen_save_and_return_to_your_library')}
          </p>
          <div className={lc('ctas')} data-a="up">
            {/* the player needs an account: guests are offered one instead of a login redirect */}
            <Link
              className={lc('btn btn-primary magnetic')}
              href={signedIn ? ROUTES.main : ROUTES.auth.registration}
            >
              {c(signedIn ? 'hero.open_web_player' : 'hero.create_account')}{' '}
              <svg aria-hidden="true" className={lc('i')}>
                <use href="#i-arrow" />
              </svg>
            </Link>
            {!signedIn && (
              <Link
                className={lc('btn btn-ghost magnetic')}
                href={ROUTES.auth.login}
              >
                {c('hero.log_in')}
              </Link>
            )}
          </div>
          {stats && (
            <dl className={lc('hstats')} data-a="up">
              {STAT_ROWS.map(({ key, label }) => (
                <div key={key}>
                  <dt>{c(label)}</dt>
                  <dd>{formatStat({ value: stats[key], locale })}</dd>
                </div>
              ))}
            </dl>
          )}
          <div className={lc('row mono trust')} data-a="up">
            <span>{c('hero.free')}</span>
            <i aria-hidden="true" />
            <span>{c('hero.no_install')}</span>
            <i aria-hidden="true" />
            <a
              className={lc('ulink trust-gh')}
              href={GITHUB_REPO_URL}
              rel="noopener noreferrer"
              target="_blank"
            >
              <svg aria-hidden="true" className={lc('i')}>
                <use href="#i-github" />
              </svg>
              {c('hero.open_source_on_github')}
            </a>
          </div>
        </div>
      </Abs>
      <Abs h={640} markers="persp hero-devices" w={820} x={540} y={140}>
        <PlayerPreview />
      </Abs>
    </SceneShell>
  )
}

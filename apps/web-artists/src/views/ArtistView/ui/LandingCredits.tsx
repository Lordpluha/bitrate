import { participantRoleLabels, rightTypeLabels } from '@entities/release'
import { useI18n } from '@shared/i18n'
import { tiltHandlers } from '@shared/lib/tilt'
import {
  CircleCheck,
  Disc3,
  FileMusic,
  Mic2,
  Music2,
  UsersRound,
} from 'lucide-react'
import { type CSSProperties, useState } from 'react'
import { useCreditsScene } from '../model/useCreditsScene'
import { CreditsConnections } from './CreditsConnections'
import { ResponseNumber } from './ResponseNumber'

const SIGNAL_LEVELS = [7, 13, 18, 10, 16, 8, 20, 12, 6] as const

const CONTRIBUTORS = [
  {
    name: 'Mira Sol',
    initials: 'MS',
    roles: ['PERFORMER', 'PRODUCER'],
    share: 75,
  },
  { name: 'Kite Harbor', initials: 'KH', roles: ['COMPOSER'], share: 25 },
] as const

export function LandingCredits() {
  const { t } = useI18n()
  const [selected, setSelected] = useState(0)
  const contributor = CONTRIBUTORS[selected]
  const { sceneRef, entered, connections } = useCreditsScene(selected)
  return (
    <section
      aria-labelledby="landing-credits-heading"
      className="artist-landing-credits"
      id="landing-credits"
    >
      <header className="artist-credits-heading">
        <div>
          <p className="artist-credits-eyebrow">
            {t('landing.credits.eyebrow')}
          </p>
          <h2 id="landing-credits-heading">
            {t('landing.credits.title')}
            <br />
            <span>{t('landing.credits.titleAccent')}</span>
          </h2>
        </div>
        <p>{t('landing.credits.lead')}</p>
      </header>
      <div
        className="artist-credits-scene"
        data-entered={entered}
        data-selected={selected}
        ref={sceneRef}
        style={{ '--credit-share': contributor.share } as CSSProperties}
      >
        <CreditsConnections connections={connections} selected={selected} />
        <div aria-hidden="true" className="artist-credits-scene-light" />
        <div className="artist-credits-people">
          <h3>
            <UsersRound aria-hidden="true" />
            {t('landing.credits.people')}
            <span aria-hidden="true" className="artist-credits-people-count">
              02
            </span>
          </h3>
          <fieldset
            aria-label={t('landing.credits.choose')}
            className="artist-credits-contributors"
          >
            {CONTRIBUTORS.map((person, index) => (
              <button
                aria-pressed={selected === index}
                data-credit-person={index}
                key={person.name}
                onClick={() => setSelected(index)}
                type="button"
              >
                <span aria-hidden="true" className="artist-credits-avatar">
                  {person.initials}
                  <span className="artist-credits-avatar-orbit" />
                </span>
                <span className="artist-credits-person-copy">
                  <strong>{person.name}</strong>
                  <span>
                    {person.roles
                      .map((role) => t(participantRoleLabels[role]))
                      .join(' · ')}
                  </span>
                </span>
                <span
                  aria-hidden="true"
                  className="artist-credits-person-instrument"
                >
                  {index === 0 ? <Mic2 /> : <Music2 />}
                </span>
                <span
                  aria-hidden="true"
                  className="artist-credits-person-signal"
                >
                  {SIGNAL_LEVELS.map((bar) => (
                    <i
                      key={`signal-${bar}`}
                      style={
                        { '--bar': bar, '--level': `${bar}px` } as CSSProperties
                      }
                    />
                  ))}
                </span>
                <span
                  aria-hidden="true"
                  className="artist-credits-person-share"
                >
                  {person.share}%{selected === index && <CircleCheck />}
                </span>
              </button>
            ))}
          </fieldset>
          <p className="artist-credits-hint">
            {t('landing.credits.chooseHint')}
          </p>
        </div>
        <div className="artist-credits-release-stage" {...tiltHandlers}>
          <figure className="artist-credits-release">
            <div className="artist-credits-artwork">
              <svg
                aria-hidden="true"
                className="artist-credits-orbit"
                viewBox="0 0 320 320"
              >
                <circle
                  className="artist-credits-orbit-track"
                  cx={160}
                  cy={160}
                  r={143}
                />
                <circle
                  className="artist-credits-orbit-share"
                  cx={160}
                  cy={160}
                  pathLength={100}
                  r={143}
                />
                <circle
                  className="artist-credits-orbit-guide"
                  cx={160}
                  cy={160}
                  r={155}
                />
              </svg>
              <span aria-hidden="true" className="artist-credits-orbit-person">
                <span>{contributor.initials}</span>
              </span>
              <div className="artist-credits-cover-surface">
                <img
                  alt={t('landing.journey.cover')}
                  height={224}
                  src="/artwork/landing/night-signal.webp"
                  width={224}
                />
                <span
                  aria-hidden="true"
                  className="artist-credits-cover-shine"
                />
              </div>
            </div>
            <figcaption>
              <h3>Night Signal</h3>
              <p>Mira Sol · {t('landing.response.demo')}</p>
            </figcaption>
          </figure>
        </div>
        <div className="artist-credits-splits artist-credits-panel">
          <h3>
            <Disc3 aria-hidden="true" />
            {t('workspace.credits.title')}
          </h3>
          <div className="artist-credits-selected">
            <p key={contributor.name}>{contributor.name}</p>
            <dl>
              <div>
                <dt>
                  <Disc3 aria-hidden="true" />
                  {t(rightTypeLabels.RECORDING)}
                </dt>
                <dd>
                  <ResponseNumber entered={entered} value={contributor.share} />
                  <span className="artist-credits-percent">%</span>
                </dd>
              </div>
              <div>
                <dt>
                  <FileMusic aria-hidden="true" />
                  {t(rightTypeLabels.COMPOSITION)}
                </dt>
                <dd>
                  <ResponseNumber entered={entered} value={contributor.share} />
                  <span className="artist-credits-percent">%</span>
                </dd>
              </div>
            </dl>
          </div>
          <div
            aria-hidden="true"
            className="artist-credits-shares"
            data-selected={selected}
          >
            <span />
            <span />
          </div>
          <p className="artist-credits-complete">
            <CircleCheck aria-hidden="true" />
            {t('landing.credits.accounted')}
          </p>
        </div>
      </div>
      <p className="artist-credits-note">{t('landing.credits.note')}</p>
    </section>
  )
}

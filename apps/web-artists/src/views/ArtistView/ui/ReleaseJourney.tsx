import { useI18n } from '@shared/i18n'
import { tiltHandlers } from '@shared/lib/tilt'
import { ROUTES } from '@shared/routes/routes'
import { Link } from '@tanstack/react-router'
import {
  ArrowDown,
  ArrowRight,
  AudioLines,
  Check,
  CircleCheck,
  FileAudio,
  Image,
  ListChecks,
  Radio,
  ShieldCheck,
  UsersRound,
} from 'lucide-react'
import { useRef } from 'react'
import { spotlightCardHandlers } from '../lib/landingInteractions'
import { WAVEFORM_PEAKS } from '../lib/studioPreview'
import { type JourneyStep, useReleaseJourney } from '../model/useReleaseJourney'
import { JourneySignal } from './JourneySignal'

const STEPS = [
  { id: 'draft', index: 0, icon: FileAudio },
  { id: 'review', index: 1, icon: ShieldCheck },
  { id: 'live', index: 2, icon: Radio },
] as const

const JOURNEY_WAVEFORM = WAVEFORM_PEAKS.map((peak, index) => ({
  id: `journey-peak-${index}`,
  height: `${peak * 100}%`,
  delay: `${index * -55}ms`,
}))

export function ReleaseJourney() {
  const { t } = useI18n()
  const { sectionRef, pinRef, activeStep, selectStep } = useReleaseJourney()
  const buttons = useRef<Array<HTMLButtonElement | null>>([])
  const active = STEPS[activeStep]

  const moveTo = (step: JourneyStep) => {
    selectStep(step)
    buttons.current[step]?.focus({ preventScroll: true })
  }

  return (
    <section
      aria-labelledby="release-journey-heading"
      className="artist-release-journey"
      data-step={active.id}
      id="landing-signal-flow"
      ref={sectionRef}
    >
      <div className="artist-journey-pin" ref={pinRef}>
        <header className="artist-journey-heading">
          <div>
            <p className="artist-journey-eyebrow">
              {t('landing.journey.eyebrow')}
            </p>
            <h2 id="release-journey-heading">{t('landing.journey.title')}</h2>
          </div>
          <p>{t('landing.journey.lead')}</p>
        </header>

        <div className="artist-journey-body">
          <div
            aria-label={t('landing.journey.steps')}
            className="artist-journey-steps"
            role="tablist"
          >
            <span aria-hidden="true" className="artist-journey-track">
              <span />
            </span>
            {STEPS.map(({ id, index, icon: Icon }) => (
              <button
                aria-controls="release-journey-scene"
                aria-selected={index === activeStep}
                className="artist-journey-step"
                data-complete={index < activeStep}
                id={`release-journey-${id}`}
                key={id}
                onClick={() => selectStep(index)}
                onKeyDown={(event) => {
                  if (event.key === 'Home' || event.key === 'End') {
                    event.preventDefault()
                    moveTo(event.key === 'Home' ? 0 : 2)
                  } else if (
                    event.key === 'ArrowRight' ||
                    event.key === 'ArrowDown'
                  ) {
                    event.preventDefault()
                    moveTo(index === 2 ? 0 : index === 0 ? 1 : 2)
                  } else if (
                    event.key === 'ArrowLeft' ||
                    event.key === 'ArrowUp'
                  ) {
                    event.preventDefault()
                    moveTo(index === 0 ? 2 : index === 2 ? 1 : 0)
                  }
                }}
                ref={(element) => {
                  buttons.current[index] = element
                }}
                role="tab"
                tabIndex={index === activeStep ? 0 : -1}
                type="button"
              >
                <span className="artist-journey-step-number">
                  {index < activeStep ? (
                    <Check aria-hidden="true" />
                  ) : (
                    `0${index + 1}`
                  )}
                </span>
                <span className="artist-journey-step-copy">
                  <span className="artist-journey-step-label">
                    <Icon aria-hidden="true" />
                    {t(`landing.journey.${id}.label`)}
                  </span>
                  <span className="artist-journey-step-title">
                    {t(`landing.journey.${id}.title`)}
                  </span>
                  <span className="artist-journey-step-description">
                    {t(`landing.journey.${id}.description`)}
                  </span>
                </span>
              </button>
            ))}
          </div>

          <div
            className="artist-journey-stage"
            onPointerLeave={(event) => {
              tiltHandlers.onPointerLeave(event)
              spotlightCardHandlers.onPointerLeave(event)
            }}
            onPointerMove={(event) => {
              tiltHandlers.onPointerMove(event)
              spotlightCardHandlers.onPointerMove(event)
            }}
          >
            <div
              aria-labelledby={`release-journey-${active.id}`}
              className="artist-journey-scene"
              id="release-journey-scene"
              role="tabpanel"
              tabIndex={activeStep === 2 ? -1 : 0}
            >
              <div aria-hidden="true" className="artist-journey-scene-glow" />
              <div aria-hidden="true" className="artist-journey-scene-grid" />
              <div
                aria-hidden="true"
                className="artist-journey-pointer-light"
              />
              <div className="artist-journey-scene-header">
                <span>
                  <AudioLines aria-hidden="true" />
                  {t('landing.journey.release')}
                </span>
                <span className="artist-journey-status" key={active.id}>
                  <span />
                  {t(`landing.journey.${active.id}.status`)}
                </span>
              </div>
              <div className="artist-journey-scene-body">
                <div className="artist-journey-record">
                  <div className="artist-journey-artwork">
                    <JourneySignal />
                    <div className="artist-journey-sleeve">
                      <span aria-hidden="true" className="artist-journey-vinyl">
                        <span />
                      </span>
                      <img
                        alt={t('landing.journey.cover')}
                        height={240}
                        src="/artwork/landing/night-signal.webp"
                        width={240}
                      />
                      <span
                        aria-hidden="true"
                        className="artist-journey-cover-shine"
                      />
                      <span
                        aria-hidden="true"
                        className="artist-journey-scan"
                      />
                      <span
                        aria-hidden="true"
                        className="artist-journey-cover-corner artist-journey-cover-corner-start"
                      />
                      <span
                        aria-hidden="true"
                        className="artist-journey-cover-corner artist-journey-cover-corner-end"
                      />
                    </div>
                  </div>
                  <div className="artist-journey-record-caption">
                    <h3>Night Signal</h3>
                    <p>Mira Sol · {t('landing.journey.single')}</p>
                    <span className="artist-journey-record-line" />
                  </div>
                </div>

                <div className="artist-journey-panels">
                  <div
                    aria-hidden={activeStep !== 0}
                    className="artist-journey-panel"
                    data-active={activeStep === 0}
                    inert={activeStep !== 0}
                  >
                    <p className="artist-journey-panel-eyebrow">
                      {t('landing.journey.draft.caption')}
                    </p>
                    <div className="artist-journey-asset">
                      <FileAudio aria-hidden="true" />
                      <div>
                        <strong>Night Signal.wav</strong>
                        <span>{t('landing.journey.master')}</span>
                      </div>
                      <CircleCheck aria-hidden="true" />
                    </div>
                    <div className="artist-journey-asset">
                      <Image aria-hidden="true" />
                      <div>
                        <strong>{t('release.roadmap.artwork')}</strong>
                        <span>{t('landing.journey.artworkReady')}</span>
                      </div>
                      <CircleCheck aria-hidden="true" />
                    </div>
                    <p className="artist-journey-panel-note">
                      <span />
                      {t('landing.journey.private')}
                    </p>
                  </div>

                  <div
                    aria-hidden={activeStep !== 1}
                    className="artist-journey-panel"
                    data-active={activeStep === 1}
                    inert={activeStep !== 1}
                  >
                    <p className="artist-journey-panel-eyebrow">
                      {t('landing.journey.review.caption')}
                    </p>
                    <ul className="artist-journey-checklist">
                      <li>
                        <ListChecks aria-hidden="true" />
                        <span>{t('landing.journey.audioArtwork')}</span>
                        <CircleCheck aria-hidden="true" />
                      </li>
                      <li>
                        <UsersRound aria-hidden="true" />
                        <span>{t('workspace.credits.title')}</span>
                        <strong>100%</strong>
                      </li>
                      <li>
                        <ShieldCheck aria-hidden="true" />
                        <span>{t('landing.journey.rightsConfirmed')}</span>
                        <CircleCheck aria-hidden="true" />
                      </li>
                    </ul>
                    <div className="artist-journey-review">
                      <ShieldCheck aria-hidden="true" />
                      <span>{t('landing.journey.reviewPending')}</span>
                    </div>
                  </div>

                  <div
                    aria-hidden={activeStep !== 2}
                    className="artist-journey-panel"
                    data-active={activeStep === 2}
                    inert={activeStep !== 2}
                  >
                    <p className="artist-journey-panel-eyebrow">
                      {t('landing.journey.live.caption')}
                    </p>
                    <div className="artist-journey-live-title">
                      <Radio aria-hidden="true" />
                      <h3>{t('landing.journey.live.now')}</h3>
                    </div>
                    <div aria-hidden="true" className="artist-journey-waveform">
                      <AudioLines />
                      <div>
                        {JOURNEY_WAVEFORM.map((peak) => (
                          <span
                            key={peak.id}
                            style={{
                              height: peak.height,
                              animationDelay: peak.delay,
                            }}
                          />
                        ))}
                      </div>
                    </div>
                    <p className="artist-journey-panel-note">
                      {t('landing.journey.live.note')}
                    </p>
                    <Link
                      className="artist-journey-cta"
                      to={ROUTES.auth.registration}
                    >
                      {t('landing.journey.start')}
                      <ArrowRight aria-hidden="true" />
                    </Link>
                  </div>
                </div>
              </div>
              <div className="artist-journey-scene-footer">
                <span>BITRATE / NIGHT SIGNAL</span>
                <span>
                  0{activeStep + 1} <span>/ 03</span>
                </span>
              </div>
            </div>
          </div>
        </div>
        <div className="artist-journey-footer">
          <span className="artist-journey-scroll">
            <ArrowDown aria-hidden="true" />
            {t('landing.journey.scroll')}
          </span>
          <p>{t('landing.journey.scope')}</p>
        </div>
      </div>
    </section>
  )
}

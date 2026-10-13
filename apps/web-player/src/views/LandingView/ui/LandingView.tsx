'use client'

import { useI18n } from '@shared/i18n'
import { useEffect, useRef } from 'react'
import { formatSceneNumber } from '../lib/engine/navigation'
import { LANDING_SCENES } from '../model/scenes'
import { useLandingCopy } from '../model/useLandingCopy'
import { AssistantPanel } from './AssistantPanel'
import { LandingHeader } from './LandingHeader'
import { LandingIcons } from './LandingIcons'
import { SceneDevices } from './scenes/SceneDevices'
import { SceneDiscover } from './scenes/SceneDiscover'
import { SceneLibrary } from './scenes/SceneLibrary'
import { SceneLoop } from './scenes/SceneLoop'
import { ScenePartners } from './scenes/ScenePartners'
import { SceneRules } from './scenes/SceneRules'
import { SceneSignal } from './scenes/SceneSignal'
import { SceneSocial } from './scenes/SceneSocial'
import { SceneStart } from './scenes/SceneStart'
import { SceneTeam } from './scenes/SceneTeam'
import { SceneWorkshop } from './scenes/SceneWorkshop'
import './landing.css'
import { lc } from '../lib/styles/lc'

export type LandingViewProps = {
  /** The visitor has a session: hide "Create account" and "Log in". */
  signedIn: boolean
}

/**
 * The Bitrate landing: eleven fullscreen scenes rendered on the server. The motion engine (GSAP,
 * Three.js) loads after first paint and only on the client; without it the page is still complete.
 */
export const LandingView = ({ signedIn }: LandingViewProps) => {
  const { locale } = useI18n()
  /* the engine splits headings into letters, so a language switch remounts the scenes fresh */
  return <LandingContent key={locale} signedIn={signedIn} />
}

const LandingContent = ({ signedIn }: LandingViewProps) => {
  const c = useLandingCopy()
  const root = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = root.current
    if (!el) return
    let stop: (() => void) | null = null
    let cancelled = false
    void import('../lib/engine/mountLanding').then(({ mountLanding }) => {
      if (cancelled) return
      stop = mountLanding({ root: el, copy: c })
    })
    return () => {
      cancelled = true
      stop?.()
    }
  }, [c])

  return (
    <div className={lc('landing')} ref={root}>
      <LandingIcons />
      <canvas className={lc('#stage')} id="stage" />
      <div aria-hidden="true" className={lc('cursor-glow')} />
      <div aria-hidden="true" className={lc('sweep')} />
      <div aria-hidden="true" className={lc('grain')} />
      <div aria-hidden="true" className={lc('intro')}>
        <div className={lc('intro-ll')} />
        <b>Bitrate</b>
        <span className={lc('mono')}>{c('chrome.tuning_in')}</span>
      </div>
      <LandingHeader />
      <nav aria-label={c('chrome.scenes')} className={lc('dots')}>
        {LANDING_SCENES.map(({ id, label }, i) => (
          <button
            aria-current={i === 0}
            aria-label={c('chrome.go_to', { scene: c(label) })}
            data-scene-dot=""
            key={id}
            type="button"
          >
            <span>
              {formatSceneNumber(i + 1)} · {c(label).toUpperCase()}
            </span>
          </button>
        ))}
      </nav>
      <div aria-hidden="true" className={lc('counter')}>
        <b data-scene-num="">{formatSceneNumber(1)}</b>
        <span className={lc('rail')}>
          <i data-scene-rail="" />
        </span>
        <span>{formatSceneNumber(LANDING_SCENES.length)}</span>
      </div>
      <AssistantPanel />
      <main>
        <SceneSignal signedIn={signedIn} />
        <SceneLoop />
        <SceneWorkshop />
        <SceneRules />
        <SceneLibrary />
        <SceneDiscover />
        <SceneDevices />
        <SceneSocial />
        <ScenePartners />
        <SceneTeam />
        <SceneStart signedIn={signedIn} />
      </main>
    </div>
  )
}

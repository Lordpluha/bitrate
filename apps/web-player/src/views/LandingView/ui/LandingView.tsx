'use client'

import { useI18n } from '@shared/i18n'
import { useEffect, useRef } from 'react'
import { formatSceneNumber } from '../lib/engine/navigation'
import type { PlatformStats } from '../model/platformStats'
import { LANDING_SCENES } from '../model/scenes'
import { useLandingCopy } from '../model/useLandingCopy'
import { AssistantPanel } from './AssistantPanel'
import { LandingDemoProvider } from './demo/LandingDemoProvider'
import { LandingHeader } from './LandingHeader'
import { LandingIcons } from './LandingIcons'
import { VisitorContext } from './scenes/parts'
import { SceneDevices } from './scenes/SceneDevices'
import { SceneLibrary } from './scenes/SceneLibrary'
import { SceneLoop } from './scenes/SceneLoop'
import { ScenePartners } from './scenes/ScenePartners'
import { SceneRules } from './scenes/SceneRules'
import { SceneSignal } from './scenes/SceneSignal'
import { SceneSocial } from './scenes/SceneSocial'
import { SceneStart } from './scenes/SceneStart'
import { SceneTeam } from './scenes/SceneTeam'
import './landing.css'
import { lc } from '../lib/styles/lc'

export type LandingViewProps = {
  /** The visitor has a session: hide "Create account" and "Log in". */
  signedIn: boolean
  /** Public platform totals for the hero; `null` hides them. */
  stats: PlatformStats | null
}

/**
 * The Bitrate landing: nine fullscreen scenes rendered on the server. The motion engine (GSAP,
 * Three.js) loads after first paint and only on the client; without it the page is still complete.
 */
export const LandingView = ({ signedIn, stats }: LandingViewProps) => {
  const { locale } = useI18n()
  /* the engine splits headings into letters, so a language switch remounts the scenes fresh */
  return <LandingContent key={locale} signedIn={signedIn} stats={stats} />
}

const LandingContent = ({ signedIn, stats }: LandingViewProps) => {
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
      <LandingHeader signedIn={signedIn} />
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
        <VisitorContext value={{ signedIn }}>
          <SceneSignal signedIn={signedIn} stats={stats} />
          <LandingDemoProvider>
            <SceneLoop />
            <SceneRules />
            <SceneLibrary />
            <SceneDevices />
            <SceneSocial />
          </LandingDemoProvider>
          <ScenePartners />
          <SceneTeam />
          <SceneStart signedIn={signedIn} />
        </VisitorContext>
      </main>
    </div>
  )
}

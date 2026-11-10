'use client'

import { useI18n } from '@shared/i18n'
import { ROUTES } from '@shared/routes'
import Link from 'next/link'
import { useEffect, useRef, useState } from 'react'
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
import { SceneFaq } from './scenes/SceneFaq'
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
  /* the engine splits headings into letters and lays scenes out per window shape, so a language
     switch or a resize into another layout mode remounts the scenes fresh */
  const [layout, setLayout] = useState(0)
  return (
    <LandingContent
      key={`${locale}-${layout}`}
      onModeChange={() => setLayout((n) => n + 1)}
      signedIn={signedIn}
      stats={stats}
    />
  )
}

type LandingContentProps = LandingViewProps & {
  /** The window crossed into another layout mode (scenes, tall, phone). */
  onModeChange: () => void
}

const LandingContent = ({
  signedIn,
  stats,
  onModeChange,
}: LandingContentProps) => {
  const c = useLandingCopy()
  const root = useRef<HTMLDivElement>(null)
  /* the latest callback without remounting the engine when the parent re-renders */
  const modeChange = useRef(onModeChange)
  modeChange.current = onModeChange

  useEffect(() => {
    const el = root.current
    if (!el) return
    let stop: (() => void) | null = null
    let cancelled = false
    void import('../lib/engine/mountLanding').then(({ mountLanding }) => {
      if (cancelled) return
      stop = mountLanding({
        root: el,
        copy: c,
        onModeChange: () => modeChange.current(),
      })
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
      {/* phones: the way into the player and to the next scene, where the thumb rests */}
      <div className={lc('m-bar')}>
        <Link
          className={lc('btn btn-primary m-bar-cta')}
          href={signedIn ? ROUTES.main : ROUTES.auth.registration}
        >
          {c(signedIn ? 'chrome.open_player' : 'chrome.start_listening_free')}
          <svg aria-hidden="true" className={lc('i')}>
            <use href="#i-arrow" />
          </svg>
        </Link>
        <button
          aria-label={c('chrome.next_scene')}
          className={lc('m-bar-next')}
          data-scene-next=""
          type="button"
        >
          <svg aria-hidden="true" className={lc('i')}>
            <use href="#i-arrow" />
          </svg>
        </button>
      </div>
      <AssistantPanel />
      <main>
        <VisitorContext value={{ signedIn }}>
          <SceneSignal signedIn={signedIn} stats={stats} />
          <LandingDemoProvider>
            <SceneLoop />
            <SceneDevices />
            <SceneLibrary />
            <SceneSocial />
            <SceneRules />
          </LandingDemoProvider>
          <SceneTeam />
          <ScenePartners />
          <SceneFaq />
          <SceneStart signedIn={signedIn} />
        </VisitorContext>
      </main>
    </div>
  )
}

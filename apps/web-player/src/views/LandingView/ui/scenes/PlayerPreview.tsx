'use client'

import { Themes } from '@shared/constants'
import Image from 'next/image'
import { useEffect, useState } from 'react'
import { lc } from '../../lib/styles/lc'
import type { LandingKey } from '../../model/messages/en'
import { PLAYER_SCREENS } from '../../model/playerScreens.generated'
import { useLandingCopy } from '../../model/useLandingCopy'

type Device = keyof typeof PLAYER_SCREENS
type ScreenOf<D extends Device> = keyof (typeof PLAYER_SCREENS)[D] & string
type AnyScreen = ScreenOf<'desktop'> | ScreenOf<'mobile'>

/**
 * Captures of the real player (`scripts/capture-landing-previews.mjs` writes them with the
 * hotspot map), one per screen and theme. Sizes are the captured pixels: 1440×900 on a desktop,
 * 390×844 at 2× on a phone.
 */
const SHOT = {
  desktop: { width: 1440, height: 900 },
  mobile: { width: 780, height: 1688 },
} as const

const SCREEN_NAME: Record<AnyScreen, LandingKey> = {
  home: 'hero.screen_home',
  search: 'hero.screen_search',
  charts: 'hero.screen_charts',
  recents: 'hero.screen_recents',
  queue: 'hero.screen_queue',
  now: 'hero.screen_now',
  library: 'hero.screen_library',
}

/** A recorded control on a capture, as shares of the screen (0–1), and the screen it opens. */
type Spot = { to: string; x: number; y: number; w: number; h: number }
const SPOTS: Record<Device, Record<string, readonly Spot[]>> = PLAYER_SCREENS

const src = (device: Device, screen: string, theme: string) =>
  `/images/landing/player-${device}-${screen}-${theme}.webp`

type ScreenProps<D extends Device> = {
  device: D
  alt: string
  /** The screen the visitor is on; it fades in when it changes. */
  screen: ScreenOf<D>
  onGo: (screen: ScreenOf<D>) => void
}

/**
 * One device's screen: the real capture in every theme (CSS shows the one matching `<html>`), and
 * a button over each navigation control the capture recorded, which switches to that screen.
 */
const Screen = <D extends Device>({
  device,
  alt,
  screen,
  onGo,
}: ScreenProps<D>) => {
  const c = useLandingCopy()
  const { width, height } = SHOT[device]
  const spots = SPOTS[device][screen] ?? []
  return (
    <div className={lc('pv-frame')} key={screen}>
      {Themes.map((theme) => (
        <Image
          alt={theme === 'dark' ? alt : ''}
          className={lc(`pv pv-${theme}`)}
          height={height}
          key={theme}
          /* dark is the default theme and the hero's largest paint */
          loading={theme === 'dark' ? 'eager' : 'lazy'}
          src={src(device, screen, theme)}
          /* already sized, compressed captures: served as they are, so preloading hits the cache */
          unoptimized
          width={width}
        />
      ))}
      {spots.map((spot) => (
        <button
          aria-label={c('hero.preview_go', {
            screen: c(SCREEN_NAME[spot.to as AnyScreen]),
          })}
          className={lc('pv-spot')}
          key={`${spot.to}-${spot.x}-${spot.y}`}
          onClick={() => onGo(spot.to as ScreenOf<D>)}
          style={{
            left: `${spot.x * 100}%`,
            top: `${spot.y * 100}%`,
            width: `${spot.w * 100}%`,
            height: `${spot.h * 100}%`,
          }}
          type="button"
        />
      ))}
    </div>
  )
}

/** Warms the cache with every screen of the current theme once the page is idle. */
const usePreloadScreens = () => {
  useEffect(() => {
    const theme =
      Themes.find((t) => document.documentElement.classList.contains(t)) ??
      'dark'
    const warm = () => {
      for (const device of Object.keys(PLAYER_SCREENS) as Device[])
        for (const screen of Object.keys(PLAYER_SCREENS[device])) {
          const img = new window.Image()
          img.src = src(device, screen, theme)
        }
    }
    const id = window.setTimeout(warm, 2500)
    return () => window.clearTimeout(id)
  }, [])
}

/**
 * The hero's device pair: the web player on a laptop and on a phone, captured from the real app
 * and clickable — the sidebar, the island and the player controls switch between real screens.
 */
export const PlayerPreview = () => {
  const c = useLandingCopy()
  const [desk, setDesk] = useState<ScreenOf<'desktop'>>('home')
  const [phone, setPhone] = useState<ScreenOf<'mobile'>>('home')
  usePreloadScreens()
  return (
    <div className={lc('devices')} data-a="win" id="heroWin">
      <div className={lc('laptop d-only')}>
        <div className={lc('laptop-screen')}>
          <div className={lc('pv-viewport')}>
            <Screen
              alt={c('hero.preview_desktop_alt')}
              device="desktop"
              onGo={setDesk}
              screen={desk}
            />
          </div>
        </div>
        <div aria-hidden="true" className={lc('laptop-base')} />
      </div>
      <div className={lc('handset')}>
        <div className={lc('handset-screen')}>
          <Screen
            alt={c('hero.preview_mobile_alt')}
            device="mobile"
            onGo={setPhone}
            screen={phone}
          />
        </div>
        <i aria-hidden="true" className={lc('handset-island')} />
      </div>
      <span className={lc('devices-note d-only')}>
        {c('hero.real_screens')}
      </span>
    </div>
  )
}

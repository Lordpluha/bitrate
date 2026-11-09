import { Themes } from '@shared/constants'
import Image from 'next/image'
import { lc } from '../../lib/styles/lc'
import { useLandingCopy } from '../../model/useLandingCopy'

/**
 * Captures of the real player (`scripts/capture-landing-previews.mjs` writes them), one per theme.
 * Sizes are the captured pixels: 1440×900 on a desktop, 390×844 at 2× on a phone.
 */
const SHOTS = {
  desktop: { width: 1440, height: 900, sizes: '740px' },
  mobile: { width: 780, height: 1688, sizes: '(max-width: 820px) 40vw, 190px' },
} as const

type ScreenProps = {
  device: keyof typeof SHOTS
  alt: string
}

/**
 * The real player in every theme; CSS shows the one matching `<html>`'s theme class, and the
 * hidden ones (`display: none` + lazy) are never downloaded.
 */
const Screen = ({ device, alt }: ScreenProps) => {
  const { width, height, sizes } = SHOTS[device]
  return (
    <>
      {Themes.map((theme) => (
        <Image
          alt={theme === 'dark' ? alt : ''}
          className={lc(`pv pv-${theme}`)}
          height={height}
          key={theme}
          sizes={sizes}
          src={`/images/landing/player-${device}-${theme}.webp`}
          width={width}
        />
      ))}
    </>
  )
}

/** The hero's device pair: the web player on a laptop and on a phone, captured from the real app. */
export const PlayerPreview = () => {
  const c = useLandingCopy()
  return (
    <div className={lc('devices')} data-a="win" id="heroWin">
      <div className={lc('laptop d-only')}>
        <div className={lc('laptop-screen')}>
          <Screen alt={c('hero.preview_desktop_alt')} device="desktop" />
        </div>
        <div aria-hidden="true" className={lc('laptop-base')} />
      </div>
      <div className={lc('handset')}>
        <div className={lc('handset-screen')}>
          <Screen alt={c('hero.preview_mobile_alt')} device="mobile" />
        </div>
        <i aria-hidden="true" className={lc('handset-island')} />
      </div>
      <span className={lc('devices-note d-only')}>
        {c('hero.real_screens')}
      </span>
    </div>
  )
}

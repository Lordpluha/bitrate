import { BITRATE_PLAYER_TAG_NAME } from '@bitrate/player'
import type { BitratePlayerElement } from '@bitrate/player/contract'
import {
  type DetailedHTMLProps,
  type HTMLAttributes,
  useEffect,
  useState,
} from 'react'

declare module 'react' {
  namespace JSX {
    interface IntrinsicElements {
      'bitrate-player': DetailedHTMLProps<
        HTMLAttributes<BitratePlayerElement>,
        BitratePlayerElement
      > & { chrome?: string }
    }
  }
}

/** True once `<bitrate-player>` has upgraded; properties set earlier may be lost. */
export function useBitratePlayerDefined() {
  const [defined, setDefined] = useState(false)
  useEffect(() => {
    let active = true
    void customElements
      .whenDefined(BITRATE_PLAYER_TAG_NAME)
      .then(() => active && setDefined(true))
    return () => {
      active = false
    }
  }, [])
  return defined
}

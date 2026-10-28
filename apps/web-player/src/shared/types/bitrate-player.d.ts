import type {
  BitratePlayerCoverSize,
  BitratePlayerElement,
  BitratePlayerSeekVariant,
  PlayerChrome,
} from '@bitrate/player/contract'
import type { DetailedHTMLProps, HTMLAttributes } from 'react'

type ElementProps<TElement extends HTMLElement = HTMLElement> =
  DetailedHTMLProps<HTMLAttributes<TElement>, TElement>

/**
 * `<bitrate-player>` and its part elements in JSX. Only attributes go through JSX — arrays,
 * objects and callbacks are assigned as properties on the element ref once it has upgraded.
 */
declare module 'react' {
  namespace JSX {
    interface IntrinsicElements {
      'bitrate-player': ElementProps<BitratePlayerElement> & {
        chrome?: PlayerChrome
        'media-session'?: boolean
      }
      'bitrate-player-cover': ElementProps & { size?: BitratePlayerCoverSize }
      'bitrate-player-meta': ElementProps
      /** `controls`: any of `shuffle prev play next repeat`. */
      'bitrate-player-transport': ElementProps & { controls?: string }
      'bitrate-player-seek': ElementProps & {
        variant?: BitratePlayerSeekVariant
      }
      'bitrate-player-volume': ElementProps
      /** `controls`: any of `like pip queue expand`. */
      'bitrate-player-actions': ElementProps & { controls?: string }
      'bitrate-player-quality': ElementProps
      'bitrate-player-error': ElementProps
    }
  }
}

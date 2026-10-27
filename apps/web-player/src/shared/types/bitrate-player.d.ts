import type {
  BitratePlayerElement,
  PlayerChrome,
} from '@bitrate/player/contract'
import type { DetailedHTMLProps, HTMLAttributes } from 'react'

/**
 * `<bitrate-player>` in JSX. Only attributes go through JSX — arrays, objects and callbacks
 * are assigned as properties on the element ref once it has upgraded.
 */
declare module 'react' {
  namespace JSX {
    interface IntrinsicElements {
      'bitrate-player': DetailedHTMLProps<
        HTMLAttributes<BitratePlayerElement>,
        BitratePlayerElement
      > & { chrome?: PlayerChrome }
    }
  }
}

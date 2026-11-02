import { BITRATE_PLAYER_TAG_NAME } from '@bitrate/player'
import {
  BITRATE_PLAYER_EVENT,
  type BitratePlayerElement,
  type BitratePlayerSourceResolver,
} from '@bitrate/player/contract'
import { cn } from '@bitrate/ui-react'
import { useI18n } from '@shared/i18n'
import {
  type DetailedHTMLProps,
  type HTMLAttributes,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react'
import { playableAudioUrl } from '../model/audioSource'
import { releaseAudioUrl } from '../model/media'

declare module 'react' {
  namespace JSX {
    interface IntrinsicElements {
      'bitrate-player': DetailedHTMLProps<
        HTMLAttributes<BitratePlayerElement>,
        BitratePlayerElement
      >
    }
  }
}

/** Only one master plays at a time across every player on the page. */
let audible: BitratePlayerElement | null = null

function useBitratePlayerDefined() {
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

interface TrackPlayerProps {
  releaseId: string
  trackId: string
  title: string
  coverUrl?: string | null
  className?: string
}

/**
 * Plays an owned master through `<bitrate-player>`. The element mounts only after it has
 * upgraded, because properties set before `customElements.define()` may be lost.
 */
export function TrackPlayer({
  releaseId,
  trackId,
  title,
  coverUrl,
  className,
}: TrackPlayerProps) {
  const ref = useRef<BitratePlayerElement>(null)
  const { t, tMessage } = useI18n()
  const defined = useBitratePlayerDefined()
  // The element rebuilds its engine whenever the resolver changes, so keep it per track.
  const resolveSource = useMemo<BitratePlayerSourceResolver>(
    () => () =>
      // The player shows a rejection's message as is, so it gets the translated text.
      playableAudioUrl(releaseAudioUrl(releaseId, trackId)).catch(
        (error: unknown) => {
          throw new Error(
            tMessage(error instanceof Error ? error.message : undefined),
            { cause: error },
          )
        },
      ),
    [releaseId, trackId, tMessage],
  )

  useEffect(() => {
    const element = ref.current
    if (!defined || !element) return
    // A draft master is served as uploaded, so the player gets a single quality to play.
    element.renditions = [{ bitrate: 0, label: t('release.master') }]
    element.trackTitle = title
    element.coverUrl = coverUrl ?? ''
    if (element.resolveSource !== resolveSource) {
      element.resolveSource = resolveSource
    }
  }, [defined, title, coverUrl, resolveSource, t])

  useEffect(() => {
    const element = ref.current
    if (!defined || !element) return
    const silenceOthers = () => {
      if (audible && audible !== element) audible.pause()
      audible = element
    }
    element.addEventListener(BITRATE_PLAYER_EVENT.PLAY, silenceOthers)
    return () => {
      element.removeEventListener(BITRATE_PLAYER_EVENT.PLAY, silenceOthers)
      if (audible === element) audible = null
    }
  }, [defined])

  return (
    <div className={cn('artist-track-player', className)}>
      {defined ? (
        <bitrate-player ref={ref} />
      ) : (
        <div aria-hidden="true" className="artist-track-player-pending" />
      )}
    </div>
  )
}

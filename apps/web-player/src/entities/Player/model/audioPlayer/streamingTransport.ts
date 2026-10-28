import type {
  BitratePlayerStreaming,
  TrackManifest,
} from '@bitrate/player/contract'
import { configureCmafEngine } from '@bitrate/player/engine'
import { fetchRenditionRange } from '@/entities/Player/api/client'
import {
  isSlowNetwork,
  sessionPositionStore,
} from '@/entities/Player/model/audioPlayer/audioPlayer.utils'
import { createHlsLegacyAdapter } from '@/entities/Player/model/audioPlayer/hlsLegacyAdapter'

let engineConfigured = false

/**
 * Hands the engine this app's storage and debug default once: remembered bandwidth survives
 * reloads, and tracing is on in development.
 */
const ensureEngineConfigured = () => {
  if (engineConfigured) return
  engineConfigured = true
  configureCmafEngine({
    debugByDefault: process.env.NODE_ENV === 'development',
    storage: typeof localStorage === 'undefined' ? null : localStorage,
  })
}

type CreateStreamingTransportInput = {
  /** The React Query-cached manifest lookup; `null` keeps a track on the legacy path. */
  resolveManifest: (trackId: string) => Promise<TrackManifest | null>
}

/**
 * Everything `<bitrate-player>` needs from web-player to stream: manifests and byte ranges
 * over the app's own authenticated client, the hls.js chain for tracks without a manifest,
 * `sessionStorage` resume positions, and whether the connection is slow.
 */
export const createStreamingTransport = ({
  resolveManifest,
}: CreateStreamingTransportInput): BitratePlayerStreaming => {
  ensureEngineConfigured()
  return {
    crossOrigin: 'use-credentials',
    fetchRange: fetchRenditionRange,
    isConstrained: isSlowNetwork,
    legacy: createHlsLegacyAdapter(),
    positions: sessionPositionStore,
    resolveManifest,
  }
}

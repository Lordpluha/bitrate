import type { AudioEngine, EngineEvents } from './audio-engine'
import { bindMediaSession } from './bind-media-session'
import { webAudio } from './web-audio'

let bound = false

function bindEvents(events: EngineEvents): void {
  const audio = webAudio()
  audio.addEventListener('playing', () => events.onStateChange('playing'))
  audio.addEventListener('pause', () => events.onStateChange('paused'))
  audio.addEventListener('waiting', () => events.onStateChange('buffering'))
  audio.addEventListener('ended', () => events.onStateChange('ended'))
  audio.addEventListener('error', () => events.onStateChange('error'))
  bindMediaSession(events.onRemoteCommand)
}

/** Web build (react-native-web): one shared `<audio>` element plus the Media Session API. */
export const audioEngine: AudioEngine = {
  setup: async (events) => {
    if (bound) return
    bound = true
    bindEvents(events)
  },
  load: async (track) => {
    const audio = webAudio()
    audio.src = track.url
    audio.load()
    if ('mediaSession' in navigator) {
      navigator.mediaSession.metadata = new MediaMetadata({
        title: track.title,
        artist: track.artist,
        artwork: track.artworkUrl ? [{ src: track.artworkUrl }] : [],
      })
    }
  },
  play: async () => {
    await webAudio().play()
  },
  pause: async () => webAudio().pause(),
  seekTo: async (positionSec) => {
    webAudio().currentTime = positionSec
  },
  stop: async () => {
    const audio = webAudio()
    audio.pause()
    audio.removeAttribute('src')
    audio.load()
  },
  getPosition: async () => webAudio().currentTime,
}

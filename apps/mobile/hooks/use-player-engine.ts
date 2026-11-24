import { useEffect } from 'react'

import { audioEngine } from '@/lib/player/engine'
import type { RemoteCommand } from '@/lib/player/engine/audio-engine'
import { usePlayerStore } from '@/lib/player/player-store'

function handleRemoteCommand(command: RemoteCommand): void {
  const player = usePlayerStore.getState()
  if (command.type === 'seek') return void player.seekTo(command.positionSec)
  if (command.type === 'next') return player.next()
  if (command.type === 'previous') return void player.previous()
  const playing = player.status === 'playing' || player.status === 'buffering'
  if ((command.type === 'pause') === playing) void player.togglePlay()
}

/** Connects the platform audio engine to the player store, once, at the app root. */
export function usePlayerEngine(): void {
  useEffect(() => {
    void audioEngine.setup({
      onStateChange: (state) => usePlayerStore.getState().handleEngineState(state),
      onRemoteCommand: handleRemoteCommand,
    })
  }, [])
}

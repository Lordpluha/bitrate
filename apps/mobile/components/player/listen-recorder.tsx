import { useQueryClient } from '@tanstack/react-query'
import { useEffect, useState } from 'react'

import { catalogKeys } from '@/lib/catalog/query-keys'
import { createListenRecorder } from '@/lib/history/listen-recorder'
import { recordListen } from '@/lib/history/record-listen'
import { useEngineProgress } from '@/lib/player/engine/use-engine-progress'
import { usePlayerStore } from '@/lib/player/player-store'

/**
 * Invisible: reports the playing track to the listening history once it passes the listen
 * threshold, then refreshes the history queries. Mounted once in the signed-in shell.
 */
export function ListenRecorder() {
  const queryClient = useQueryClient()
  const trackId = usePlayerStore((player) => player.queue[player.index]?.id ?? null)
  const { positionSec } = useEngineProgress()
  const [recorder] = useState(() =>
    createListenRecorder({
      record: async (id) => {
        await recordListen(id)
        await queryClient.invalidateQueries({ queryKey: catalogKeys.history })
      },
    }),
  )

  useEffect(() => {
    if (trackId) recorder.onProgress({ trackId, positionSec })
  }, [recorder, trackId, positionSec])

  return null
}

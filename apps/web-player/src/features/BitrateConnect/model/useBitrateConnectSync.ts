'use client'

import { useAuth } from '@shared/hooks'
import { useEffect, useState } from 'react'
import { type PlayerSnapshot, usePlayerStore } from '@/entities/Player'
import {
  getServerPlayer,
  registerDevice,
  saveServerPlayer,
  saveServerQueue,
} from '../api/connectApi'
import {
  describeBrowser,
  fromServerPlayer,
  toServerPlayerUpdate,
  toServerQueue,
} from '../lib/playerSync'
import { readThisDeviceId, writeThisDeviceId } from '../lib/thisDevice'

/** How often the position is saved while this browser plays. */
const POSITION_SYNC_MS = 15_000
/** Bursts of changes (skipping through a list) are saved once they settle. */
const CHANGE_DEBOUNCE_MS = 1_000

/** Sync is a convenience: a failed save is retried by the next change, never surfaced. */
const ignoreSyncFailure = () => undefined

const queueKey = (snapshot: PlayerSnapshot) =>
  toServerQueue({ snapshot }).trackIds.join(',')

/**
 * Bitrate Connect without handoff: registers this browser as a device, continues the account's
 * saved queue when this player is empty, and saves what this browser plays.
 */
export const useBitrateConnectSync = () => {
  const { isAuthenticated } = useAuth()
  const [deviceId, setDeviceId] = useState<string | null>(null)

  useEffect(() => {
    if (!isAuthenticated) {
      setDeviceId(null)
      return
    }
    let isCancelled = false
    const start = async () => {
      const id = await registerDevice({
        id: readThisDeviceId(),
        name: describeBrowser(window.navigator.userAgent),
      })
      writeThisDeviceId(id)
      const remote = await getServerPlayer()
      const session = remote ? fromServerPlayer(remote) : null
      const player = usePlayerStore.getState()
      if (!isCancelled && session && !player.currentTrack)
        player.restorePlayerSession(session)
      if (!isCancelled) setDeviceId(id)
    }
    start().catch(ignoreSyncFailure)
    return () => {
      isCancelled = true
    }
  }, [isAuthenticated])

  useEffect(() => {
    if (!deviceId) return
    let savedQueueKey = ''
    let isActiveDevice = false
    let timer: ReturnType<typeof setTimeout> | undefined

    const save = async () => {
      const snapshot = usePlayerStore.getState()
      if (!snapshot.currentTrack) return
      if (snapshot.isPlaying && !isActiveDevice) {
        isActiveDevice = true
        await registerDevice({
          id: deviceId,
          isActive: true,
          name: describeBrowser(window.navigator.userAgent),
        })
      }
      const nextQueueKey = queueKey(snapshot)
      if (nextQueueKey !== savedQueueKey) {
        await saveServerQueue(toServerQueue({ snapshot }))
        savedQueueKey = nextQueueKey
      }
      await saveServerPlayer(toServerPlayerUpdate({ deviceId, snapshot }))
    }
    const scheduleSave = () => {
      clearTimeout(timer)
      timer = setTimeout(() => {
        save().catch(ignoreSyncFailure)
      }, CHANGE_DEBOUNCE_MS)
    }

    const unsubscribe = usePlayerStore.subscribe((state, previous) => {
      if (!state.currentTrack) return
      /** Another device may have become active while this one was paused. */
      if (!state.isPlaying) isActiveDevice = false
      if (
        state.currentTrack.id !== previous.currentTrack?.id ||
        state.isPlaying !== previous.isPlaying ||
        state.isShuffled !== previous.isShuffled ||
        state.repeatMode !== previous.repeatMode ||
        state.playlist !== previous.playlist
      )
        scheduleSave()
    })
    const interval = setInterval(() => {
      if (usePlayerStore.getState().isPlaying) scheduleSave()
    }, POSITION_SYNC_MS)

    return () => {
      unsubscribe()
      clearInterval(interval)
      clearTimeout(timer)
    }
  }, [deviceId])

  return { deviceId }
}

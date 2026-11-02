import { listenForInterfaceSounds } from '@shared/lib/interfaceSound'
import { useEffect } from 'react'

/** Plays interface sounds across the document while `enabled`; listeners go when it turns off. */
export function useInterfaceSounds(enabled: boolean) {
  useEffect(() => {
    if (!enabled) return
    return listenForInterfaceSounds()
  }, [enabled])
}

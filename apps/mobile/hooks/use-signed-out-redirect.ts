import { useRouter, useSegments } from 'expo-router'
import { useEffect } from 'react'

/** Route groups and screens that need a session. */
const SIGNED_IN_ROOTS = new Set(['(app)', 'now-playing'])

/**
 * Leaves a signed-in screen the moment the session ends (log out, expiry). Stack.Protected only
 * filters what can be opened next; it did not move a listener off the screen already showing.
 */
export function useSignedOutRedirect(signedOut: boolean): void {
  const router = useRouter()
  const segments = useSegments()
  const root = segments[0]

  useEffect(() => {
    if (signedOut && root && SIGNED_IN_ROOTS.has(root)) router.replace('/login')
  }, [signedOut, root, router])
}

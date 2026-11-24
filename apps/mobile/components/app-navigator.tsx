import { Stack, ThemeProvider } from 'expo-router'
import * as SplashScreen from 'expo-splash-screen'
import { StatusBar } from 'expo-status-bar'
import { useEffect } from 'react'

import { SessionErrorScreen } from '@/components/session-error-screen'
import { useNavigationTheme } from '@/hooks/use-navigation-theme'
import { usePlayerEngine } from '@/hooks/use-player-engine'
import { useSession } from '@/hooks/use-session'
import { useSessionExpiry } from '@/hooks/use-session-expiry'
import { useTheme } from '@/hooks/use-theme'

/**
 * Routes by session: `(app)` and Now Playing only with a session, `(auth)` only without one.
 * The splash screen stays up until the first `/auth/me` answer, so nothing flashes.
 */
export function AppNavigator() {
  const session = useSession()
  const { isDark } = useTheme()
  const navigationTheme = useNavigationTheme()
  useSessionExpiry()
  usePlayerEngine()

  const settled = session.status !== 'loading'
  useEffect(() => {
    if (settled) void SplashScreen.hideAsync()
  }, [settled])

  if (session.status === 'loading') return null
  const signedIn = session.status === 'signed-in'

  return (
    <ThemeProvider value={navigationTheme}>
      {session.status === 'error' ? (
        <SessionErrorScreen onRetry={session.retry} />
      ) : (
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Protected guard={signedIn}>
            <Stack.Screen name="(app)" />
            <Stack.Screen name="now-playing" options={{ presentation: 'modal' }} />
          </Stack.Protected>
          <Stack.Protected guard={!signedIn}>
            <Stack.Screen name="(auth)" />
          </Stack.Protected>
        </Stack>
      )}
      <StatusBar style={isDark ? 'light' : 'dark'} />
    </ThemeProvider>
  )
}

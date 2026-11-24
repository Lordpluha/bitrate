import { Stack, ThemeProvider } from 'expo-router'
import * as SplashScreen from 'expo-splash-screen'
import { StatusBar } from 'expo-status-bar'
import { useEffect } from 'react'

import { SessionErrorScreen } from '@/components/session-error-screen'
import { useNavigationTheme } from '@/hooks/use-navigation-theme'
import { usePlayerEngine } from '@/hooks/use-player-engine'
import { useSession } from '@/hooks/use-session'
import { useSessionExpiry } from '@/hooks/use-session-expiry'
import { useSignedOutRedirect } from '@/hooks/use-signed-out-redirect'
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
  useSignedOutRedirect(session.status === 'signed-out')
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
          {/* Listed one by one, login first: the guard redirects to the first allowed screen, and a
              group screen would resolve to the URL `/(auth)`, which matches nothing. */}
          <Stack.Protected guard={!signedIn}>
            <Stack.Screen name="(auth)/login" />
            <Stack.Screen name="(auth)/two-factor" />
            <Stack.Screen name="(auth)/register" />
            <Stack.Screen name="(auth)/forgot-password" />
            <Stack.Screen name="(auth)/reset-password" />
          </Stack.Protected>
        </Stack>
      )}
      <StatusBar style={isDark ? 'light' : 'dark'} />
    </ThemeProvider>
  )
}

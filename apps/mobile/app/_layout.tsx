import { QueryClientProvider } from '@tanstack/react-query'
import { Stack } from 'expo-router'
import { StatusBar } from 'expo-status-bar'
import 'react-native-reanimated'
import { SafeAreaProvider } from 'react-native-safe-area-context'

import { useTheme } from '@/hooks/use-theme'
import { queryClient } from '@/lib/api/query-client'

/** App root: the query cache, safe areas and a header-less stack. */
export default function RootLayout() {
  const { isDark } = useTheme()

  return (
    <QueryClientProvider client={queryClient}>
      <SafeAreaProvider>
        <Stack screenOptions={{ headerShown: false }} />
        <StatusBar style={isDark ? 'light' : 'dark'} />
      </SafeAreaProvider>
    </QueryClientProvider>
  )
}

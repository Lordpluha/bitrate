import { Tabs } from 'expo-router'

import { Island } from '@/components/island/island'

/**
 * Signed-in shell: tabs drawn by the floating island instead of a tab bar. Liked Songs and
 * Profile are tab routes without island buttons (`href: null`) so the island stays visible.
 */
export default function AppLayout() {
  return (
    <Tabs screenOptions={{ headerShown: false }} tabBar={(props) => <Island {...props} />}>
      <Tabs.Screen name="index" />
      <Tabs.Screen name="search" />
      <Tabs.Screen name="library" />
      <Tabs.Screen name="liked-songs" options={{ href: null }} />
      <Tabs.Screen name="profile" options={{ href: null }} />
    </Tabs>
  )
}

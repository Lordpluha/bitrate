import { Tabs } from 'expo-router'

import { Island } from '@/components/island/island'
import { ListenRecorder } from '@/components/player/listen-recorder'

/**
 * Signed-in shell: tabs drawn by the floating island instead of a tab bar. Liked Songs and
 * Profile are tab routes too, so the island stays visible; the island draws only its own three
 * buttons. Do not mark them `href: null` — that makes the routes unreachable.
 */
export default function AppLayout() {
  return (
    <>
      <ListenRecorder />
      <Tabs screenOptions={{ headerShown: false }} tabBar={(props) => <Island {...props} />}>
        <Tabs.Screen name="index" />
        <Tabs.Screen name="search" />
        <Tabs.Screen name="library" />
        <Tabs.Screen name="liked-songs" />
        <Tabs.Screen name="profile" />
      </Tabs>
    </>
  )
}

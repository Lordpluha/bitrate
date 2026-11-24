import { Stack } from 'expo-router'

/** Signed-in area. Becomes the island-driven tabs once Home and the player land (#228). */
export default function AppLayout() {
  return <Stack screenOptions={{ headerShown: false }} />
}

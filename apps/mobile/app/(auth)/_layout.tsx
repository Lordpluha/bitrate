import { Stack } from 'expo-router'

export const unstable_settings = { initialRouteName: 'login' }

/** Signed-out screens: login, two-factor, registration and password recovery. */
export default function AuthLayout() {
  return <Stack screenOptions={{ headerShown: false }} />
}

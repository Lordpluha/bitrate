import { SettingsPage } from '@views/Settings'
import type { Metadata } from 'next'
export const metadata: Metadata = {
  title: 'Settings',
}

export default function PreferencesRoute() {
  return <SettingsPage />
}

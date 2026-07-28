import { ROUTES } from '@shared/routes'
import { redirect } from 'next/navigation'

export default function SettingsRoute() {
  redirect(ROUTES.settings)
}

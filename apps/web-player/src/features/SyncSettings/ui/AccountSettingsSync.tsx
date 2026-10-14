'use client'

import { useAccountSettingsSync } from '../model/useAccountSettingsSync'

/** Mount once in the signed-in shell; renders nothing. */
export const AccountSettingsSync = () => {
  useAccountSettingsSync()
  return null
}

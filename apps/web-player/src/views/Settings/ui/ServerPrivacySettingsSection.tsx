'use client'

import { useMeSettings, useUpdateMeSettings } from '@/entities/Me'
import { showApiErrorToast } from '@/shared/api/feedback'
import { useAuth } from '@/shared/hooks'
import {
  SettingsRow,
  SettingsSection,
} from '@/views/Settings/ui/controls/SettingsSection'
import { SettingsSwitch } from '@/views/Settings/ui/controls/SettingsSwitch'

export const ServerPrivacySettingsSection = () => {
  const { isAuthenticated } = useAuth()
  const { data: settings } = useMeSettings(isAuthenticated)
  const updateSettings = useUpdateMeSettings()

  if (!settings) return null

  const updatePreference = (
    key: 'explicitContent' | 'privateSession',
    value: boolean,
  ) => {
    updateSettings.mutate(
      { [key]: value },
      {
        onError: (error) =>
          showApiErrorToast(error, 'Unable to save this preference.'),
      },
    )
  }

  return (
    <SettingsSection
      searchTerms={['explicit content', 'private session']}
      title="Account privacy"
    >
      <SettingsRow
        description="Allow tracks marked as explicit to appear in your account."
        label="Explicit content"
      >
        <SettingsSwitch
          ariaLabel="Explicit content"
          checked={settings.explicitContent}
          onChange={() =>
            updatePreference('explicitContent', !settings.explicitContent)
          }
        />
      </SettingsRow>
      <SettingsRow
        description="Keep your listening activity private for this account."
        label="Private session"
      >
        <SettingsSwitch
          ariaLabel="Private session"
          checked={settings.privateSession}
          onChange={() =>
            updatePreference('privateSession', !settings.privateSession)
          }
        />
      </SettingsRow>
    </SettingsSection>
  )
}

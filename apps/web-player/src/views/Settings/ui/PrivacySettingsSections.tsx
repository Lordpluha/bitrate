'use client'

import { useSettingsStore } from '@entities/Settings'
import { useI18n } from '@/shared/i18n'
import {
  SettingsRow,
  SettingsSection,
} from '@/views/Settings/ui/controls/SettingsSection'
import { SettingsSwitch } from '@/views/Settings/ui/controls/SettingsSwitch'

export const PrivacySettingsSections = () => {
  const { t } = useI18n()
  const listeningActivity = useSettingsStore((state) => state.listeningActivity)
  const followers = useSettingsStore((state) => state.followersVisible)
  const profilePlaylists = useSettingsStore(
    (state) => state.profilePlaylistsVisible,
  )
  const toggleSetting = useSettingsStore((state) => state.toggleSetting)

  return (
    <>
      <SettingsSection title={t('settings.privacy.activity')}>
        <SettingsRow
          description={t('settings.privacy.activity.description')}
          label={t('settings.privacy.activity.label')}
        >
          <SettingsSwitch
            ariaLabel={t('settings.privacy.activity.label')}
            checked={listeningActivity}
            onChange={() => toggleSetting('listeningActivity')}
          />
        </SettingsRow>
      </SettingsSection>

      <SettingsSection title={t('settings.privacy.profile')}>
        <SettingsRow
          description={t('settings.privacy.followers.description')}
          label={t('settings.privacy.followers')}
        >
          <SettingsSwitch
            ariaLabel={t('settings.privacy.followers')}
            checked={followers}
            onChange={() => toggleSetting('followersVisible')}
          />
        </SettingsRow>
        <SettingsRow label={t('settings.privacy.playlists')}>
          <SettingsSwitch
            ariaLabel={t('settings.privacy.playlists')}
            checked={profilePlaylists}
            onChange={() => toggleSetting('profilePlaylistsVisible')}
          />
        </SettingsRow>
      </SettingsSection>
    </>
  )
}

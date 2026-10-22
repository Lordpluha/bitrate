'use client'

import { useSettingsStore } from '@entities/Settings'
import { useUpdateMeSettings } from '@/entities/Me'
import { useI18n } from '@/shared/i18n'
import {
  SettingsRow,
  SettingsSection,
} from '@/views/Settings/ui/controls/SettingsSection'
import { SettingsSwitch } from '@/views/Settings/ui/controls/SettingsSwitch'

export const LibraryDisplaySettings = () => {
  const { t } = useI18n()
  const compactLibrary = useSettingsStore((state) => state.compactLibrary)
  const nowPlayingPanel = useSettingsStore((state) => state.nowPlayingPanel)
  const toggleSetting = useSettingsStore((state) => state.toggleSetting)
  const updateSettings = useUpdateMeSettings()

  const updateBooleanSetting = (
    localKey: 'compactLibrary' | 'nowPlayingPanel',
    serverKey: 'compactLibrary' | 'showNowPlaying',
    currentValue: boolean,
  ) => {
    toggleSetting(localKey)
    updateSettings.mutate(
      { [serverKey]: !currentValue },
      { onError: () => toggleSetting(localKey) },
    )
  }

  return (
    <>
      <SettingsSection title={t('settings.library')}>
        <SettingsRow
          description={t('settings.library.compact.description')}
          label={t('settings.library.compact')}
        >
          <SettingsSwitch
            ariaLabel={t('settings.library.compact')}
            checked={compactLibrary}
            onChange={() =>
              updateBooleanSetting(
                'compactLibrary',
                'compactLibrary',
                compactLibrary,
              )
            }
          />
        </SettingsRow>
      </SettingsSection>

      <SettingsSection title={t('settings.display')}>
        <SettingsRow label={t('settings.display.nowPlaying')}>
          <SettingsSwitch
            ariaLabel={t('settings.display.nowPlaying')}
            checked={nowPlayingPanel}
            onChange={() =>
              updateBooleanSetting(
                'nowPlayingPanel',
                'showNowPlaying',
                nowPlayingPanel,
              )
            }
          />
        </SettingsRow>
      </SettingsSection>
    </>
  )
}

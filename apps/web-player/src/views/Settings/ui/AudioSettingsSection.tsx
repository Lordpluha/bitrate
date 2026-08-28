'use client'

import type { InterfaceLanguage, StreamingQuality } from '@entities/Settings'
import { useSettingsStore } from '@entities/Settings'
import { localeLabels, useI18n } from '@shared/i18n'
import {
  SettingsRow,
  SettingsSection,
} from '@/views/Settings/ui/controls/SettingsSection'
import { SettingsSelect } from '@/views/Settings/ui/controls/SettingsSelect'
import { SettingsSwitch } from '@/views/Settings/ui/controls/SettingsSwitch'

export const AudioSettingsSection = () => {
  const { t } = useI18n()
  const language = useSettingsStore((state) => state.language)
  const streamingQuality = useSettingsStore((state) => state.streamingQuality)
  const normalizeVolume = useSettingsStore((state) => state.normalizeVolume)
  const setSetting = useSettingsStore((state) => state.setSetting)
  const toggleSetting = useSettingsStore((state) => state.toggleSetting)
  const qualityOptions: ReadonlyArray<{
    label: string
    value: StreamingQuality
  }> = [
    { label: t('settings.audio.quality.automatic'), value: 'Automatic' },
    { label: t('settings.audio.quality.low'), value: 'Low' },
    { label: t('settings.audio.quality.normal'), value: 'Normal' },
    { label: t('settings.audio.quality.high'), value: 'High' },
  ]

  return (
    <>
      <SettingsSection title={t('settings.language')}>
        <SettingsRow label={t('settings.language.description')}>
          <SettingsSelect
            ariaLabel={t('settings.language.description')}
            onChange={(value: InterfaceLanguage) =>
              setSetting('language', value)
            }
            options={localeLabels}
            value={language}
            widthClassName="min-w-68"
          />
        </SettingsRow>
      </SettingsSection>

      <SettingsSection title={t('settings.audio')}>
        <SettingsRow label={t('settings.audio.quality')}>
          <SettingsSelect
            ariaLabel={t('settings.audio.quality')}
            onChange={(value: StreamingQuality) =>
              setSetting('streamingQuality', value)
            }
            options={qualityOptions}
            value={streamingQuality}
            widthClassName="min-w-40"
          />
        </SettingsRow>
        <SettingsRow label={t('settings.audio.normalize')}>
          <SettingsSwitch
            ariaLabel={t('settings.audio.normalize')}
            checked={normalizeVolume}
            onChange={() => toggleSetting('normalizeVolume')}
          />
        </SettingsRow>
      </SettingsSection>
    </>
  )
}

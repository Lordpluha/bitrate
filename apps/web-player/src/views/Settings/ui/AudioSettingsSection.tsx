'use client'

import type { InterfaceLanguage, StreamingQuality } from '@entities/Settings'
import { toServerStreamingQuality, useSettingsStore } from '@entities/Settings'
import { localeLabels, useI18n } from '@shared/i18n'
import { type UpdateMeSettings, useUpdateMeSettings } from '@/entities/Me'
import { useAuth } from '@/shared/hooks'
import {
  SettingsRow,
  SettingsSection,
} from '@/views/Settings/ui/controls/SettingsSection'
import { SettingsSelect } from '@/views/Settings/ui/controls/SettingsSelect'

/** Language and streaming quality: applied here at once and saved to the account when signed in. */
export const AudioSettingsSection = () => {
  const { t } = useI18n()
  const { isAuthenticated } = useAuth()
  const language = useSettingsStore((state) => state.language)
  const streamingQuality = useSettingsStore((state) => state.streamingQuality)
  const setSetting = useSettingsStore((state) => state.setSetting)
  const updateSettings = useUpdateMeSettings()
  const qualityOptions: ReadonlyArray<{
    label: string
    value: StreamingQuality
  }> = [
    { label: t('settings.audio.quality.automatic'), value: 'Automatic' },
    { label: t('settings.audio.quality.low'), value: 'Low' },
    { label: t('settings.audio.quality.normal'), value: 'Normal' },
    { label: t('settings.audio.quality.high'), value: 'High' },
  ]

  const saveToAccount = (settings: UpdateMeSettings) => {
    if (!isAuthenticated) return
    updateSettings.mutate(settings)
  }

  return (
    <>
      <SettingsSection title={t('settings.language')}>
        <SettingsRow label={t('settings.language.description')}>
          <SettingsSelect
            ariaLabel={t('settings.language.description')}
            onChange={(value: InterfaceLanguage) => {
              setSetting('language', value)
              saveToAccount({ language: value })
            }}
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
            onChange={(value: StreamingQuality) => {
              setSetting('streamingQuality', value)
              saveToAccount({
                streamingQuality: toServerStreamingQuality(value),
              })
            }}
            options={qualityOptions}
            value={streamingQuality}
            widthClassName="min-w-40"
          />
        </SettingsRow>
      </SettingsSection>
    </>
  )
}

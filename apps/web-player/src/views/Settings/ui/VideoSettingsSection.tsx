'use client'

import { useSettingsStore } from '@entities/Settings'
import { Info } from 'lucide-react'
import { useI18n } from '@/shared/i18n'
import {
  SettingsRow,
  SettingsSection,
} from '@/views/Settings/ui/controls/SettingsSection'
import { SettingsSwitch } from '@/views/Settings/ui/controls/SettingsSwitch'

export const VideoSettingsSection = () => {
  const { t } = useI18n()
  const musicVideos = useSettingsStore((state) => state.musicVideos)
  const canvas = useSettingsStore((state) => state.canvas)
  const otherVideos = useSettingsStore((state) => state.otherVideos)
  const toggleSetting = useSettingsStore((state) => state.toggleSetting)

  return (
    <SettingsSection title={t('settings.video')}>
      <div className="mb-3 flex items-center gap-2 text-xs font-bold text-text">
        <Info size={16} />
        {t('settings.video.info')}
      </div>
      <SettingsRow
        description={t('settings.video.music.description')}
        label={t('settings.video.music')}
      >
        <SettingsSwitch
          ariaLabel={t('settings.video.music')}
          checked={musicVideos}
          onChange={() => toggleSetting('musicVideos')}
        />
      </SettingsRow>
      <SettingsRow
        description={t('settings.video.canvas.description')}
        label={t('settings.video.canvas')}
      >
        <SettingsSwitch
          ariaLabel={t('settings.video.canvas')}
          checked={canvas}
          onChange={() => toggleSetting('canvas')}
        />
      </SettingsRow>
      <SettingsRow
        description={t('settings.video.other.description')}
        label={t('settings.video.other')}
      >
        <SettingsSwitch
          ariaLabel={t('settings.video.other')}
          checked={otherVideos}
          onChange={() => toggleSetting('otherVideos')}
        />
      </SettingsRow>
    </SettingsSection>
  )
}

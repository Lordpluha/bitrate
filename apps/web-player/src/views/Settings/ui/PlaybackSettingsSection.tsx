import { useI18n } from '@/shared/i18n'
import { SettingsSection } from '@/views/Settings/ui/controls/SettingsSection'
import { EqualizerPreview } from '@/views/Settings/ui/EqualizerPreview'

export const PlaybackSettingsSection = () => {
  const { t } = useI18n()

  return (
    <SettingsSection title={t('settings.playback')}>
      <EqualizerPreview />
    </SettingsSection>
  )
}

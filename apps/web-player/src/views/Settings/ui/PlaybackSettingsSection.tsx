import { useI18n } from '@/shared/i18n'
import { SettingsSection } from '@/views/Settings/ui/controls/SettingsSection'
import { EqualizerPreview } from '@/views/Settings/ui/EqualizerPreview'

export const PlaybackSettingsSection = () => {
  const { t } = useI18n()

  return (
    <SettingsSection title={t('settings.playback')}>
      <EqualizerPreview />
      <div className="mx-auto -mt-3 flex w-full max-w-180 items-center justify-between gap-5 rounded-lg bg-surface p-4 sm:p-5 max-[900px]:grid">
        <div>
          <h3 className="text-xl font-bold text-text sm:text-2xl">
            {t('settings.playback.promo')}
          </h3>
          <p className="mt-2 text-text-subdued">
            {t('settings.playback.promo.description')}
          </p>
        </div>
        <button
          className="shrink-0 rounded-full bg-green-500 px-7 py-3 font-bold text-black hover:bg-green-400 max-[480px]:w-full"
          type="button"
        >
          {t('settings.playback.download')}
        </button>
      </div>
    </SettingsSection>
  )
}

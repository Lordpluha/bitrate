import { SettingsSection } from '@/views/Settings/ui/controls/SettingsSection'
import { EqualizerPreview } from '@/views/Settings/ui/EqualizerPreview'

export const PlaybackSettingsSection = () => (
  <SettingsSection title="Playback">
    <EqualizerPreview />
    <div className="mx-auto -mt-3 flex w-full max-w-180 items-center justify-between gap-5 rounded-lg bg-surface p-5 max-[900px]:grid">
      <div>
        <h3 className="text-2xl font-bold text-text">
          Fine-tune your sound with the Linux app
        </h3>
        <p className="mt-2 text-text-subdued">
          Improve streaming quality, adjust the equalizer to best fit your
          speakers, and enjoy consistent volume across all your tracks.
        </p>
      </div>
      <button
        className="shrink-0 rounded-full bg-green-500 px-7 py-3 font-bold text-black hover:bg-green-400"
        type="button"
      >
        Download the free app
      </button>
    </div>
  </SettingsSection>
)

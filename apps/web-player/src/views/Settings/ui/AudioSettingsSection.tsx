import { useState } from 'react'
import {
  SettingsRow,
  SettingsSection,
} from '@/views/Settings/ui/controls/SettingsSection'
import { SettingsSelect } from '@/views/Settings/ui/controls/SettingsSelect'
import { SettingsSwitch } from '@/views/Settings/ui/controls/SettingsSwitch'

export const AudioSettingsSection = () => {
  const [language, setLanguage] = useState('English (English)')
  const [streamingQuality, setStreamingQuality] = useState('Automatic')
  const [normalizeVolume, setNormalizeVolume] = useState(false)

  return (
    <>
      <SettingsSection title="Language">
        <SettingsRow label="Choose language - Changes will be applied after restarting the app">
          <SettingsSelect
            ariaLabel="Choose language"
            onChange={setLanguage}
            options={[
              'English (English)',
              'Русский (Russian)',
              'Українська (Ukrainian)',
            ]}
            value={language}
            widthClassName="min-w-68"
          />
        </SettingsRow>
      </SettingsSection>

      <SettingsSection title="Audio quality">
        <SettingsRow label="Streaming quality">
          <SettingsSelect
            ariaLabel="Choose streaming quality"
            onChange={setStreamingQuality}
            options={['Automatic', 'Low', 'Normal', 'High']}
            value={streamingQuality}
            widthClassName="min-w-40"
          />
        </SettingsRow>
        <SettingsRow label="Normalize volume - Set the same volume level for all songs and podcasts">
          <SettingsSwitch
            checked={normalizeVolume}
            onChange={() => setNormalizeVolume((value) => !value)}
          />
        </SettingsRow>
      </SettingsSection>
    </>
  )
}

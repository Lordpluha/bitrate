import { useState } from 'react'
import {
  SettingsRow,
  SettingsSection,
} from '@/views/Settings/ui/controls/SettingsSection'
import { SettingsSwitch } from '@/views/Settings/ui/controls/SettingsSwitch'

export const LibraryDisplaySettings = () => {
  const [compactLibrary, setCompactLibrary] = useState(false)
  const [nowPlayingPanel, setNowPlayingPanel] = useState(true)

  return (
    <>
      <SettingsSection title="Your Library">
        <SettingsRow label="Use compact library layout">
          <SettingsSwitch
            checked={compactLibrary}
            onChange={() => setCompactLibrary((value) => !value)}
          />
        </SettingsRow>
        <SettingsRow label="Import music from other apps">
          <button
            className="rounded-full border border-white/40 px-5 py-2 text-sm font-bold text-text transition-colors hover:border-white"
            type="button"
          >
            Import library
          </button>
        </SettingsRow>
      </SettingsSection>

      <SettingsSection title="Display">
        <SettingsRow label="Show the now-playing panel on click of play">
          <SettingsSwitch
            checked={nowPlayingPanel}
            onChange={() => setNowPlayingPanel((value) => !value)}
          />
        </SettingsRow>
      </SettingsSection>
    </>
  )
}

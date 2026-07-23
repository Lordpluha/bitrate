import { Info } from 'lucide-react'
import { useState } from 'react'
import {
  SettingsRow,
  SettingsSection,
} from '@/views/Settings/ui/controls/SettingsSection'
import { SettingsSwitch } from '@/views/Settings/ui/controls/SettingsSwitch'

export const VideoSettingsSection = () => {
  const [musicVideos, setMusicVideos] = useState(true)
  const [canvas, setCanvas] = useState(true)
  const [otherVideos, setOtherVideos] = useState(true)

  return (
    <SettingsSection title="Videos and Canvas">
      <div className="mb-3 flex items-center gap-2 text-xs font-bold text-text">
        <Info size={16} />
        It may take some time for your experience to update.
      </div>
      <SettingsRow
        description="When off, music videos and live performances play as audio-only."
        label="Music videos"
      >
        <SettingsSwitch
          checked={musicVideos}
          onChange={() => setMusicVideos((value) => !value)}
        />
      </SettingsRow>
      <SettingsRow
        description="Short, looping visuals when a song is playing."
        label="Canvas"
      >
        <SettingsSwitch
          checked={canvas}
          onChange={() => setCanvas((value) => !value)}
        />
      </SettingsRow>
      <SettingsRow
        description="Vertically scrolling videos, video podcasts, and videos from creators and authors."
        label="Other videos"
      >
        <SettingsSwitch
          checked={otherVideos}
          onChange={() => setOtherVideos((value) => !value)}
        />
      </SettingsRow>
    </SettingsSection>
  )
}

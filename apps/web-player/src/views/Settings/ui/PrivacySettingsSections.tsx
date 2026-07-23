import { useState } from 'react'
import {
  SettingsRow,
  SettingsSection,
} from '@/views/Settings/ui/controls/SettingsSection'
import { SettingsSwitch } from '@/views/Settings/ui/controls/SettingsSwitch'

export const PrivacySettingsSections = () => {
  const [listeningActivity, setListeningActivity] = useState(false)
  const [followers, setFollowers] = useState(true)
  const [profilePlaylists, setProfilePlaylists] = useState(false)

  return (
    <>
      <SettingsSection title="Listening activity and insights">
        <SettingsRow
          description="People on Spotify can see the music you’re playing, stats on how your tastes compare and ask to Jam."
          label="Listening activity on desktop and mobile"
        >
          <SettingsSwitch
            checked={listeningActivity}
            onChange={() => setListeningActivity((value) => !value)}
          />
        </SettingsRow>
      </SettingsSection>

      <SettingsSection title="What others can see on your profile">
        <SettingsRow
          description="On your profile, people can see who's following you and who you’re following."
          label="Followers and following"
        >
          <SettingsSwitch
            checked={followers}
            onChange={() => setFollowers((value) => !value)}
          />
        </SettingsRow>
        <SettingsRow label="People can see the playlists you’ve added to your profile.">
          <SettingsSwitch
            checked={profilePlaylists}
            onChange={() => setProfilePlaylists((value) => !value)}
          />
        </SettingsRow>
      </SettingsSection>
    </>
  )
}

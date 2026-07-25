'use client'

import { Search } from 'lucide-react'
import { AccountSettingsSection } from '@/views/Settings/ui/AccountSettingsSection'
import { AudioSettingsSection } from '@/views/Settings/ui/AudioSettingsSection'
import { LibraryDisplaySettings } from '@/views/Settings/ui/LibraryDisplaySettings'
import { PlaybackSettingsSection } from '@/views/Settings/ui/PlaybackSettingsSection'
import { PrivacySettingsSections } from '@/views/Settings/ui/PrivacySettingsSections'
import { ProfileDetailsSection } from '@/views/Settings/ui/ProfileDetailsSection'
import { TwoFactorSettingsSection } from '@/views/Settings/ui/TwoFactorSettingsSection'
import { VideoSettingsSection } from '@/views/Settings/ui/VideoSettingsSection'

export const SettingsPage = () => (
  <div className="h-full overflow-y-auto rounded-lg bg-background-secondary custom-scrollbar">
    <div className="mx-auto max-w-220 px-10 py-10 max-[900px]:px-5">
      <div className="mb-12 flex items-center justify-between">
        <h1 className="text-4xl font-black text-text">Settings</h1>
        <button
          aria-label="Search settings"
          className="rounded-full p-2 text-text-subdued transition-colors hover:bg-white/10 hover:text-text"
          type="button"
        >
          <Search size={22} />
        </button>
      </div>

      <div className="grid gap-8">
        <AccountSettingsSection />
        <AudioSettingsSection />
        <LibraryDisplaySettings />
        <VideoSettingsSection />
        <PlaybackSettingsSection />
        <PrivacySettingsSections />
        <ProfileDetailsSection />
        <TwoFactorSettingsSection />
      </div>
    </div>
  </div>
)

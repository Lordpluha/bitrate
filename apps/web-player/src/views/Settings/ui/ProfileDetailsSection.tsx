import { useProfileSettings } from '@/views/Settings/model/useProfileSettings'
import { SettingsSection } from '@/views/Settings/ui/controls/SettingsSection'

export const ProfileDetailsSection = () => {
  const profile = useProfileSettings()

  return (
    <SettingsSection title="Profile details">
      <form className="grid max-w-160 gap-4" onSubmit={profile.handleSubmit}>
        <label className="grid gap-2 text-sm text-text">
          Username
          <input
            className="h-10 rounded bg-surface px-3 text-sm text-text outline-none focus:ring-2 focus:ring-white/25"
            maxLength={80}
            minLength={3}
            onChange={(event) => profile.setUsername(event.target.value)}
            required
            value={profile.username}
          />
        </label>
        <label className="grid gap-2 text-sm text-text">
          Description
          <textarea
            className="min-h-24 rounded bg-surface px-3 py-2 text-sm text-text outline-none focus:ring-2 focus:ring-white/25"
            maxLength={500}
            onChange={(event) => profile.setDescription(event.target.value)}
            placeholder="Tell people about yourself"
            value={profile.description}
          />
        </label>
        <button
          className="w-fit rounded-full bg-green-500 px-5 py-2 text-sm font-bold text-black hover:bg-green-400 disabled:opacity-60"
          disabled={profile.isUpdatePending}
          type="submit"
        >
          Save profile
        </button>
      </form>
      <label className="grid max-w-160 gap-2 text-sm text-text">
        Avatar
        <input
          accept="image/png,image/jpeg,image/webp"
          className="rounded bg-surface px-3 py-2 text-sm text-text"
          disabled={profile.isAvatarPending}
          onChange={(event) =>
            profile.handleAvatarChange(event.target.files?.[0])
          }
          type="file"
        />
      </label>
    </SettingsSection>
  )
}

import { useI18n } from '@/shared/i18n'
import { useProfileSettings } from '@/views/Settings/model/useProfileSettings'
import { AvatarUploadField } from '@/views/Settings/ui/AvatarUploadField'
import { SettingsSection } from '@/views/Settings/ui/controls/SettingsSection'

export const ProfileDetailsSection = () => {
  const { t } = useI18n()
  const profile = useProfileSettings()

  return (
    <SettingsSection title={t('settings.profile')}>
      <form className="grid max-w-160 gap-4" onSubmit={profile.handleSubmit}>
        <label className="grid gap-2 text-sm text-text">
          {t('settings.profile.username')}
          <input
            className="h-10 rounded-md border border-border bg-background px-3 text-sm text-foreground outline-none placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring"
            maxLength={80}
            minLength={3}
            onChange={(event) => profile.setUsername(event.target.value)}
            required
            value={profile.username}
          />
        </label>
        <label className="grid gap-2 text-sm text-text">
          {t('settings.profile.description')}
          <textarea
            className="min-h-24 rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground outline-none placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring"
            maxLength={500}
            onChange={(event) => profile.setDescription(event.target.value)}
            placeholder={t('settings.profile.description.placeholder')}
            value={profile.description}
          />
        </label>
        <button
          className="inline-flex h-9 w-fit items-center rounded-md bg-primary px-6 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary-hover disabled:opacity-60"
          disabled={profile.isUpdatePending}
          type="submit"
        >
          {t('settings.profile.save')}
        </button>
      </form>
      <AvatarUploadField
        isPending={profile.isAvatarPending}
        onFileSelected={(file) => void profile.handleAvatarChange(file)}
      />
    </SettingsSection>
  )
}

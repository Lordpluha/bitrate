import { LanguagePreference } from '@features/workspace-language'
import { ThemeSwitcher } from '@features/workspace-theme'
import { useI18n } from '@shared/i18n'
export function SidebarPreferences({
  artistId,
  compact = false,
}: {
  artistId: string
  compact?: boolean
}) {
  const { t } = useI18n()
  return (
    <section
      aria-label={t('settings.appearance')}
      className="artist-sidebar-preferences"
      data-compact={compact}
    >
      <LanguagePreference artistId={artistId} compact={compact} sidebar />
      <ThemeSwitcher compact={compact} sidebar />
    </section>
  )
}

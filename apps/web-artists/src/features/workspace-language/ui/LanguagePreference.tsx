import { useSetAccountLocale } from '@entities/artist-account'
import { isLocale, type Locale, localeLabels, useI18n } from '@shared/i18n'
import { transitionPreference } from '@shared/lib/preferenceTransition'
import { NativeSelect } from '@shared/ui'
import { Globe2 } from 'lucide-react'
import { useId } from 'react'

interface LanguagePreferenceProps {
  /** The signed-in artist; the choice is then also saved to the account. */
  artistId?: string
  compact?: boolean
  sidebar?: boolean
}

/** The workspace language; the server renders the next page in it too. */
export function LanguagePreference({
  artistId,
  compact = false,
  sidebar = false,
}: LanguagePreferenceProps) {
  return artistId ? (
    <AccountLanguagePreference
      artistId={artistId}
      compact={compact}
      sidebar={sidebar}
    />
  ) : (
    <LanguageSelect compact={compact} sidebar={sidebar} />
  )
}

function AccountLanguagePreference({
  artistId,
  compact,
  sidebar,
}: {
  artistId: string
  compact: boolean
  sidebar: boolean
}) {
  const { t } = useI18n()
  const saveToAccount = useSetAccountLocale(artistId)
  return (
    <LanguageSelect
      compact={compact}
      description={t('settings.language.accountDescription')}
      error={
        saveToAccount.isError ? t('settings.language.accountFailed') : null
      }
      onChosen={(locale) => saveToAccount.mutate(locale)}
      sidebar={sidebar}
    />
  )
}

interface LanguageSelectProps {
  compact?: boolean
  sidebar?: boolean
  description?: string
  error?: string | null
  onChosen?: (locale: Locale) => void
}

function LanguageSelect({
  description,
  error,
  onChosen,
  compact = false,
  sidebar = false,
}: LanguageSelectProps) {
  const { locale, setLocale, t } = useI18n()
  const id = useId()
  const choose = (next: Locale) => {
    if (next === locale) return
    transitionPreference('language', () => {
      setLocale(next)
      onChosen?.(next)
    })
  }
  if (sidebar) {
    const index = localeLabels.findIndex((option) => option.value === locale)
    const current = localeLabels[index] ?? localeLabels[0]
    const next =
      localeLabels[(index + 1) % localeLabels.length] ?? localeLabels[0]
    return (
      <div>
        <button
          aria-label={`${t('settings.language.label')}: ${current.label}`}
          className="artist-sidebar-preference-button"
          onClick={() => choose(next.value)}
          title={compact ? current.label : undefined}
          type="button"
        >
          <Globe2 aria-hidden="true" className="size-4" />
          <span className={compact ? 'sr-only' : 'truncate'} lang={locale}>
            {current.label}
          </span>
        </button>
        {error && (
          <p className="mt-2 text-xs text-destructive" role="alert">
            {error}
          </p>
        )}
      </div>
    )
  }
  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium" htmlFor={id}>
        {t('settings.language.label')}
      </label>
      <NativeSelect
        className="h-11 px-3 text-sm"
        id={id}
        onChange={(event) => {
          const next = event.target.value
          if (!isLocale(next)) return
          choose(next)
        }}
        value={locale}
        wrapperClassName="w-full sm:max-w-xs"
      >
        {localeLabels.map(({ label, value }) => (
          <option key={value} lang={value} value={value}>
            {label}
          </option>
        ))}
      </NativeSelect>
      <p className="text-xs text-text-secondary">
        {description ?? t('settings.language.description')}
      </p>
      {error && (
        <p className="text-sm text-destructive" role="alert">
          {error}
        </p>
      )}
    </div>
  )
}

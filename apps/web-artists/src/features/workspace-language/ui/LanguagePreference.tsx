import { useSetAccountLocale } from '@entities/artist-account'
import { isLocale, type Locale, localeLabels, useI18n } from '@shared/i18n'
import { NativeSelect } from '@shared/ui'
import { useId } from 'react'

interface LanguagePreferenceProps {
  /** The signed-in artist; the choice is then also saved to the account. */
  artistId?: string
}

/** The workspace language; the server renders the next page in it too. */
export function LanguagePreference({ artistId }: LanguagePreferenceProps) {
  return artistId ? (
    <AccountLanguagePreference artistId={artistId} />
  ) : (
    <LanguageSelect />
  )
}

function AccountLanguagePreference({ artistId }: { artistId: string }) {
  const { t } = useI18n()
  const saveToAccount = useSetAccountLocale(artistId)
  return (
    <LanguageSelect
      description={t('settings.language.accountDescription')}
      error={
        saveToAccount.isError ? t('settings.language.accountFailed') : null
      }
      onChosen={(locale) => saveToAccount.mutate(locale)}
    />
  )
}

interface LanguageSelectProps {
  description?: string
  error?: string | null
  onChosen?: (locale: Locale) => void
}

function LanguageSelect({ description, error, onChosen }: LanguageSelectProps) {
  const { locale, setLocale, t } = useI18n()
  const id = useId()
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
          setLocale(next)
          onChosen?.(next)
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

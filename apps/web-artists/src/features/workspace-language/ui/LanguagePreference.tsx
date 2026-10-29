import { isLocale, localeLabels, useI18n } from '@shared/i18n'
import { NativeSelect } from '@shared/ui'
import { useId } from 'react'

/** The workspace language for this browser; the server renders the next page in it too. */
export function LanguagePreference() {
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
          if (isLocale(event.target.value)) setLocale(event.target.value)
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
        {t('settings.language.description')}
      </p>
    </div>
  )
}

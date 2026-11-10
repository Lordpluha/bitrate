'use client'

import { Button, cn } from '@bitrate/ui-react'
import { useSettingsStore } from '@entities/Settings'
import { localeLabels, useI18n } from '@shared/i18n'

type LanguageSwitcherProps = {
  className?: string
}

/**
 * EN / UK / PL for visitors who are not signed in (the auth screens). Writes the same
 * `language` setting as Settings, so the choice is kept on this device and the account's
 * own language replaces it after sign-in.
 */
export const LanguageSwitcher = ({ className }: LanguageSwitcherProps) => {
  const { t } = useI18n()
  const language = useSettingsStore((state) => state.language)
  const setSetting = useSettingsStore((state) => state.setSetting)

  return (
    <fieldset
      aria-label={t('auth.language')}
      className={cn(
        'm-0 flex w-fit min-w-0 items-center gap-1 border-0 p-0',
        className,
      )}
    >
      {localeLabels.map(({ label, value }) => {
        const isActive = value === language
        return (
          <Button
            aria-label={label}
            aria-pressed={isActive}
            className={cn(
              'h-8 min-w-10 px-2.5 text-xs font-semibold',
              !isActive && 'text-muted-foreground',
            )}
            key={value}
            lang={value}
            onClick={() => setSetting('language', value)}
            size="sm"
            title={label}
            type="button"
            variant={isActive ? 'secondary' : 'outline'}
          >
            {value.toUpperCase()}
          </Button>
        )
      })}
    </fieldset>
  )
}

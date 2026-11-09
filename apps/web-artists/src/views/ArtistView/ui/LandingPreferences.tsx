import { Popover, PopoverContent, PopoverTrigger } from '@bitrate/ui-react'
import { localeLabels, useI18n } from '@shared/i18n'
import { transitionPreference } from '@shared/lib/preferenceTransition'
import { useWorkspaceTheme } from '@shared/theme/WorkspaceThemeProvider'
import { Check, Eclipse, Globe2, Moon, Sun } from 'lucide-react'
import { useState } from 'react'
import { LandingThemePicker } from './LandingThemePicker'

const THEME_ICONS = { light: Sun, dark: Moon, dim: Eclipse }

export function LandingPreferences() {
  const { t, locale, setLocale } = useI18n()
  const { theme } = useWorkspaceTheme()
  const [panel, setPanel] = useState<'theme' | 'language' | null>(null)
  const Icon = THEME_ICONS[theme]
  return (
    <div className="artist-landing-preferences">
      <Popover
        modal={false}
        onOpenChange={(open) => setPanel(open ? 'theme' : null)}
        open={panel === 'theme'}
      >
        <PopoverTrigger asChild>
          <button
            aria-label={`${t('settings.theme')}: ${t(`settings.theme.${theme}`)}`}
            className="artist-landing-preference-trigger"
            type="button"
          >
            <Icon aria-hidden="true" />
          </button>
        </PopoverTrigger>
        <PopoverContent
          align="end"
          aria-label={t('settings.theme')}
          className="artist-dashboard artist-landing-preference-panel artist-landing-theme-panel"
          positionerClassName="z-50"
          sideOffset={12}
        >
          <h2 className="artist-preference-title">{t('settings.theme')}</h2>
          <LandingThemePicker />
        </PopoverContent>
      </Popover>
      <Popover
        modal={false}
        onOpenChange={(open) => setPanel(open ? 'language' : null)}
        open={panel === 'language'}
      >
        <PopoverTrigger asChild>
          <button
            aria-label={`${t('settings.language.label')}: ${localeLabels.find((option) => option.value === locale)?.label}`}
            className="artist-landing-preference-trigger artist-landing-language-trigger"
            type="button"
          >
            <Globe2 aria-hidden="true" />
            <span>{locale.toUpperCase()}</span>
          </button>
        </PopoverTrigger>
        <PopoverContent
          align="end"
          aria-label={t('settings.language.label')}
          className="artist-dashboard artist-landing-preference-panel artist-landing-language-panel"
          positionerClassName="z-50"
          sideOffset={12}
        >
          <h2 className="artist-preference-title">
            {t('settings.language.label')}
          </h2>
          <div className="artist-landing-language-choices">
            {localeLabels.map(({ value, label }) => (
              <button
                aria-pressed={locale === value}
                className="artist-preference-option"
                key={value}
                lang={value}
                onClick={() => {
                  setPanel(null)
                  if (value !== locale)
                    transitionPreference('language', () => setLocale(value))
                }}
                type="button"
              >
                <span aria-hidden="true" className="artist-language-code">
                  {value.toUpperCase()}
                </span>
                <span>{label}</span>
                <Check aria-hidden="true" className="artist-preference-check" />
              </button>
            ))}
          </div>
        </PopoverContent>
      </Popover>
    </div>
  )
}

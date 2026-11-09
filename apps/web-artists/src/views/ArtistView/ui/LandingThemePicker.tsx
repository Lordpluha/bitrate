import { useI18n } from '@shared/i18n'
import { transitionPreference } from '@shared/lib/preferenceTransition'
import { useWorkspaceTheme } from '@shared/theme/WorkspaceThemeProvider'
import { Check, Eclipse, Moon, Sun } from 'lucide-react'
import { useId } from 'react'

const CHOICES = [
  { value: 'light', icon: Sun },
  { value: 'dark', icon: Moon },
  { value: 'dim', icon: Eclipse },
] as const

export function LandingThemePicker() {
  const { t } = useI18n()
  const { theme, setTheme } = useWorkspaceTheme()
  const name = useId()
  return (
    <fieldset className="artist-landing-theme-picker">
      <legend className="sr-only">{t('settings.theme')}</legend>
      {CHOICES.map(({ value, icon: Icon }) => (
        <label
          className="artist-landing-theme-choice"
          data-selected={theme === value}
          key={value}
        >
          <input
            checked={theme === value}
            name={name}
            onChange={() => {
              if (value !== theme)
                transitionPreference('theme', () => setTheme(value))
            }}
            type="radio"
            value={value}
          />
          <span className="artist-preference-option">
            <Icon aria-hidden="true" />
            <span>{t(`settings.theme.${value}`)}</span>
            <Check aria-hidden="true" className="artist-preference-check" />
          </span>
        </label>
      ))}
    </fieldset>
  )
}

import { cn } from '@bitrate/ui-react'
import { useI18n } from '@shared/i18n'
import { useWorkspaceTheme } from '@shared/theme/WorkspaceThemeProvider'
import { Eclipse, Moon, Sun } from 'lucide-react'
import { useId } from 'react'

const themeOptions = [
  { value: 'light', label: 'settings.theme.light', icon: Sun },
  { value: 'dark', label: 'settings.theme.dark', icon: Moon },
  { value: 'dim', label: 'settings.theme.dim', icon: Eclipse },
] as const

export function ThemeSwitcher({ compact = false }: { compact?: boolean }) {
  const { theme, setTheme } = useWorkspaceTheme()
  const name = useId()
  const { t } = useI18n()

  return (
    <fieldset className="min-w-0">
      <legend
        className={cn(
          'mb-2 px-1 text-xs text-text-secondary',
          compact && 'sr-only',
        )}
      >
        {t('settings.appearance')}
      </legend>
      <div
        className={cn(
          'flex gap-1 rounded-xl border border-border bg-secondary p-1',
          compact && 'flex-col',
        )}
      >
        {themeOptions.map(({ value, label, icon: Icon }) => (
          <label
            className="relative min-w-0 flex-1 cursor-pointer"
            key={value}
            title={t(label)}
          >
            <input
              checked={theme === value}
              className="peer absolute inset-0 z-10 size-full cursor-pointer opacity-0"
              name={name}
              onChange={() => setTheme(value)}
              type="radio"
              value={value}
            />
            <span className="flex min-h-11 flex-col items-center justify-center gap-1 rounded-lg border border-transparent px-1 py-1 text-xs text-text-secondary peer-checked:border-primary peer-checked:bg-card peer-checked:text-foreground peer-focus-visible:ring-2 peer-focus-visible:ring-ring peer-focus-visible:ring-offset-2 peer-focus-visible:ring-offset-secondary">
              <Icon aria-hidden="true" className="size-4 shrink-0" />
              <span className={cn(compact && 'sr-only')}>{t(label)}</span>
            </span>
          </label>
        ))}
      </div>
    </fieldset>
  )
}

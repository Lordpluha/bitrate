import { cn } from '@bitrate/ui-react'
import { type TranslationKey, useI18n } from '@shared/i18n'
import { useWorkspaceTheme } from '@shared/theme/WorkspaceThemeProvider'
import { Eclipse, type LucideIcon, Moon, Sun } from 'lucide-react'
import { useId } from 'react'

interface Choice<T extends string> {
  value: T
  label: TranslationKey
  icon?: LucideIcon
}

const themeChoices: readonly Choice<'light' | 'dark' | 'dim'>[] = [
  { value: 'light', label: 'settings.theme.light', icon: Sun },
  { value: 'dark', label: 'settings.theme.dark', icon: Moon },
  { value: 'dim', label: 'settings.theme.dim', icon: Eclipse },
]

const densityChoices: readonly Choice<'comfortable' | 'compact'>[] = [
  { value: 'comfortable', label: 'settings.density.comfortable' },
  { value: 'compact', label: 'settings.density.compact' },
]

const motionChoices: readonly Choice<'system' | 'reduced'>[] = [
  { value: 'system', label: 'settings.motion.system' },
  { value: 'reduced', label: 'settings.motion.reduced' },
]

const soundChoices: readonly Choice<'on' | 'off'>[] = [
  { value: 'on', label: 'settings.sound.on' },
  { value: 'off', label: 'settings.sound.off' },
]

/** One preference: its name and a one-line explanation, with a compact segmented control. */
function PreferenceRow<T extends string>({
  label,
  hint,
  choices,
  value,
  onChange,
}: {
  label: TranslationKey
  hint: TranslationKey
  choices: readonly Choice<T>[]
  value: T
  onChange: (next: T) => void
}) {
  const name = useId()
  const { t } = useI18n()
  return (
    <div className="grid min-w-0 gap-3 py-4 first:pt-0 last:pb-0 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center sm:gap-6">
      <div className="min-w-0">
        <span className="block text-sm text-foreground" id={`${name}-label`}>
          {t(label)}
        </span>
        <span
          className="mt-0.5 block text-xs text-text-secondary"
          id={`${name}-hint`}
        >
          {t(hint)}
        </span>
      </div>
      <div
        aria-describedby={`${name}-hint`}
        aria-labelledby={`${name}-label`}
        className="flex gap-0.5 rounded-lg border border-border bg-secondary p-0.5"
        role="radiogroup"
      >
        {choices.map((choice) => {
          const Icon = choice.icon
          return (
            <label
              className="relative min-w-0 flex-1 cursor-pointer sm:flex-none"
              key={choice.value}
            >
              <input
                checked={value === choice.value}
                className="peer absolute inset-0 z-10 size-full cursor-pointer opacity-0"
                name={name}
                onChange={() => onChange(choice.value)}
                type="radio"
                value={choice.value}
              />
              <span
                className={cn(
                  'flex min-h-9 items-center justify-center gap-1.5 whitespace-nowrap rounded-md border border-transparent px-3 text-xs text-text-secondary transition-colors',
                  'peer-hover:text-foreground',
                  'peer-checked:border-primary peer-checked:bg-card peer-checked:text-foreground',
                  'peer-focus-visible:ring-2 peer-focus-visible:ring-ring peer-focus-visible:ring-offset-2 peer-focus-visible:ring-offset-secondary',
                )}
              >
                {Icon && (
                  <Icon aria-hidden="true" className="size-3.5 shrink-0" />
                )}
                {t(choice.label)}
              </span>
            </label>
          )
        })}
      </div>
    </div>
  )
}

/** Theme, density, motion and interface sounds for this browser, as one settings list. */
export function AppearancePreferences() {
  const {
    theme,
    setTheme,
    density,
    setDensity,
    motion,
    setMotion,
    sound,
    setSound,
  } = useWorkspaceTheme()
  return (
    <div className="divide-y divide-border">
      <PreferenceRow
        choices={themeChoices}
        hint="settings.theme.hint"
        label="settings.theme"
        onChange={setTheme}
        value={theme}
      />
      <PreferenceRow
        choices={densityChoices}
        hint="settings.density.hint"
        label="settings.density"
        onChange={setDensity}
        value={density}
      />
      <PreferenceRow
        choices={motionChoices}
        hint="settings.motion.hint"
        label="settings.motion"
        onChange={setMotion}
        value={motion}
      />
      <PreferenceRow
        choices={soundChoices}
        hint="settings.sound.hint"
        label="settings.sound"
        onChange={setSound}
        value={sound}
      />
    </div>
  )
}

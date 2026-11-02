import { cn } from '@bitrate/ui-react'
import { type TranslationKey, useI18n } from '@shared/i18n'
import { useWorkspaceTheme } from '@shared/theme/WorkspaceThemeProvider'
import { useId } from 'react'

interface Choice<T extends string> {
  value: T
  label: TranslationKey
  hint: TranslationKey
}

const densityChoices: readonly Choice<'comfortable' | 'compact'>[] = [
  {
    value: 'comfortable',
    label: 'settings.density.comfortable',
    hint: 'settings.density.comfortableHint',
  },
  {
    value: 'compact',
    label: 'settings.density.compact',
    hint: 'settings.density.compactHint',
  },
]

const motionChoices: readonly Choice<'system' | 'reduced'>[] = [
  {
    value: 'system',
    label: 'settings.motion.system',
    hint: 'settings.motion.systemHint',
  },
  {
    value: 'reduced',
    label: 'settings.motion.reduced',
    hint: 'settings.motion.reducedHint',
  },
]

function ChoiceGroup<T extends string>({
  legend,
  choices,
  value,
  onChange,
}: {
  legend: string
  choices: readonly Choice<T>[]
  value: T
  onChange: (next: T) => void
}) {
  const name = useId()
  const { t } = useI18n()
  return (
    <fieldset className="min-w-0">
      <legend className="mb-2 px-1 text-xs text-text-secondary">
        {legend}
      </legend>
      <div className="flex gap-1 rounded-xl border border-border bg-secondary p-1">
        {choices.map((choice) => (
          <label
            className="relative min-w-0 flex-1 cursor-pointer"
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
                'flex min-h-11 flex-col items-center justify-center rounded-lg border border-transparent px-2 py-1 text-center text-xs text-text-secondary',
                'peer-checked:border-primary peer-checked:bg-card peer-checked:text-foreground',
                'peer-focus-visible:ring-2 peer-focus-visible:ring-ring peer-focus-visible:ring-offset-2 peer-focus-visible:ring-offset-secondary',
              )}
            >
              <span>{t(choice.label)}</span>
              <span className="text-[0.6875rem] opacity-80">
                {t(choice.hint)}
              </span>
            </span>
          </label>
        ))}
      </div>
    </fieldset>
  )
}

/** Layout density and motion for this browser; both stay inside the artist workspace. */
export function AppearancePreferences() {
  const { density, setDensity, motion, setMotion } = useWorkspaceTheme()
  const { t } = useI18n()
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <ChoiceGroup
        choices={densityChoices}
        legend={t('settings.density')}
        onChange={setDensity}
        value={density}
      />
      <ChoiceGroup
        choices={motionChoices}
        legend={t('settings.motion')}
        onChange={setMotion}
        value={motion}
      />
    </div>
  )
}

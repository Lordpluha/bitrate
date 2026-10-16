import { cn } from '@bitrate/ui-react'
import { useWorkspaceTheme } from '@shared/theme/WorkspaceThemeProvider'
import { useId } from 'react'

interface Choice<T extends string> {
  value: T
  label: string
  hint: string
}

const densityChoices: readonly Choice<'comfortable' | 'compact'>[] = [
  { value: 'comfortable', label: 'Comfortable', hint: 'Roomier panels' },
  { value: 'compact', label: 'Compact', hint: 'More on screen' },
]

const motionChoices: readonly Choice<'system' | 'reduced'>[] = [
  { value: 'system', label: 'System', hint: 'Follow your device' },
  { value: 'reduced', label: 'Reduced', hint: 'No animations' },
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
              <span>{choice.label}</span>
              <span className="text-[0.6875rem] opacity-80">{choice.hint}</span>
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
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <ChoiceGroup
        choices={densityChoices}
        legend="Density"
        onChange={setDensity}
        value={density}
      />
      <ChoiceGroup
        choices={motionChoices}
        legend="Motion"
        onChange={setMotion}
        value={motion}
      />
    </div>
  )
}

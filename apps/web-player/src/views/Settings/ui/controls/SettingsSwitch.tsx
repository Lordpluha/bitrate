import { cn } from '@bitrate/ui-react'

type SettingsSwitchProps = {
  ariaLabel: string
  checked: boolean
  onChange: () => void
}

export const SettingsSwitch = ({
  ariaLabel,
  checked,
  onChange,
}: SettingsSwitchProps) => (
  <button
    aria-label={ariaLabel}
    aria-pressed={checked}
    className={cn(
      'relative inline-flex h-6 w-11 shrink-0 items-center rounded-full p-0.5 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
      checked ? 'bg-primary' : 'bg-border',
    )}
    onClick={onChange}
    type="button"
  >
    <span
      className={cn(
        'size-5 rounded-full bg-white shadow transition-transform',
        checked ? 'translate-x-5' : 'translate-x-0',
      )}
    />
  </button>
)

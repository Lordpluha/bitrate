import { cn } from '@bitrate/ui-react'
import type { ReactNode } from 'react'

type SettingsSwitchProps = {
  ariaLabel: string
  checked: boolean
  onChange: () => void
}

/** The design's settings switch: a pill that fills with the primary colour when on. */
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

type SettingsCardProps = {
  children: ReactNode
  title: string
}

/** One settings section's card: its title over the rows. */
export const SettingsCard = ({ children, title }: SettingsCardProps) => (
  <section className="mb-5 flex break-inside-avoid flex-col gap-1 rounded-[14px] border border-border bg-card p-5 md:p-6">
    <h2 className="pb-2 text-base font-semibold text-foreground">{title}</h2>
    <div className="flex flex-col">{children}</div>
  </section>
)

type SettingsRowProps = {
  children: ReactNode
  description?: string
  label: string
}

/** One setting: its label and description beside the control. */
export const SettingsRow = ({
  children,
  description,
  label,
}: SettingsRowProps) => (
  <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-6 border-b border-border py-3.5 last:border-b-0 max-[700px]:grid-cols-1 max-[700px]:gap-3">
    <div className="flex min-w-0 flex-col gap-1">
      <p className="text-sm font-semibold text-foreground">{label}</p>
      {description && (
        <p className="max-w-150 text-[13px] text-muted-foreground">
          {description}
        </p>
      )}
    </div>
    <div className="max-[700px]:flex max-[700px]:w-full max-[700px]:justify-end">
      {children}
    </div>
  </div>
)

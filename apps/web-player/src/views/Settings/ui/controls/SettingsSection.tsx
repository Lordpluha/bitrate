import type { ReactNode } from 'react'

type SettingsSectionProps = {
  children: ReactNode
  title: string
}

export const SettingsSection = ({ children, title }: SettingsSectionProps) => (
  <section>
    <h2 className="mb-4 text-base font-bold text-text">{title}</h2>
    <div className="grid gap-4">{children}</div>
  </section>
)

type SettingsRowProps = {
  children: ReactNode
  description?: string
  label: string
}

export const SettingsRow = ({
  children,
  description,
  label,
}: SettingsRowProps) => (
  <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-5 max-[700px]:grid-cols-1">
    <div className="min-w-0">
      <p className="text-sm text-text-subdued">{label}</p>
      {description && (
        <p className="mt-1 max-w-150 text-xs text-text-subdued">
          {description}
        </p>
      )}
    </div>
    {children}
  </div>
)

import type { ReactNode } from 'react'
import { useSettingsSearch } from '@/views/Settings/model/settingsSearchContext'

type SettingsSectionProps = {
  children: ReactNode
  searchTerms?: string[]
  title: string
}

export const SettingsSection = ({
  children,
  searchTerms = [],
  title,
}: SettingsSectionProps) => {
  const query = useSettingsSearch()
  const searchableText = [title, ...searchTerms].join(' ').toLocaleLowerCase()

  if (query && !searchableText.includes(query)) return null

  return (
    <section className="mb-5 flex break-inside-avoid flex-col gap-1 rounded-[14px] border border-border bg-card p-5 md:p-6">
      <h2 className="pb-2 text-base font-semibold text-foreground">{title}</h2>
      <div className="flex flex-col">{children}</div>
    </section>
  )
}

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

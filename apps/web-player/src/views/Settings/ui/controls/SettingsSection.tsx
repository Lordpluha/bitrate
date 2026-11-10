import { SettingsCard } from '@shared/ui'
import type { ReactNode } from 'react'
import { useSettingsSearch } from '@/views/Settings/model/settingsSearchContext'

type SettingsSectionProps = {
  children: ReactNode
  searchTerms?: string[]
  title: string
}

/** A settings card that hides itself when the page's search does not match it. */
export const SettingsSection = ({
  children,
  searchTerms = [],
  title,
}: SettingsSectionProps) => {
  const query = useSettingsSearch()
  const searchableText = [title, ...searchTerms].join(' ').toLocaleLowerCase()

  if (query && !searchableText.includes(query)) return null

  return <SettingsCard title={title}>{children}</SettingsCard>
}

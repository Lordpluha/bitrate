'use client'

import { Search, X } from 'lucide-react'
import { useState } from 'react'
import { useI18n } from '@/shared/i18n'
import { SettingsSearchProvider } from '@/views/Settings/model/settingsSearchContext'
import { AccountSettingsSection } from '@/views/Settings/ui/AccountSettingsSection'
import { ActiveSessionsSection } from '@/views/Settings/ui/ActiveSessionsSection'
import { AudioSettingsSection } from '@/views/Settings/ui/AudioSettingsSection'
import { LibraryDisplaySettings } from '@/views/Settings/ui/LibraryDisplaySettings'
import { ProfileDetailsSection } from '@/views/Settings/ui/ProfileDetailsSection'
import { ServerPrivacySettingsSection } from '@/views/Settings/ui/ServerPrivacySettingsSection'
import { SubscriptionSettingsSection } from '@/views/Settings/ui/SubscriptionSettingsSection'
import { TwoFactorSettingsSection } from '@/views/Settings/ui/TwoFactorSettingsSection'

export const SettingsPage = () => {
  const { t } = useI18n()
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const [query, setQuery] = useState('')

  const closeSearch = () => {
    setIsSearchOpen(false)
    setQuery('')
  }

  return (
    <div className="h-full overflow-y-auto custom-scrollbar">
      <div className="px-4 pt-2 pb-3 md:px-8 md:py-6">
        <div className="mb-5 flex min-h-10 items-center justify-between gap-4 md:mb-7">
          <h1 className="text-2xl leading-[1.1] font-bold text-foreground md:text-[32px]">
            {t('settings.title')}
          </h1>
          {isSearchOpen ? (
            <div className="flex w-full max-w-80 items-center rounded-md border border-border bg-background px-3 has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-ring">
              <Search className="shrink-0 text-muted-foreground" size={16} />
              <input
                aria-label={t('settings.search')}
                className="h-9 min-w-0 flex-1 bg-transparent px-2 text-sm text-foreground outline-none placeholder:text-muted-foreground"
                onChange={(event) => setQuery(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === 'Escape') closeSearch()
                }}
                placeholder={t('settings.search.placeholder')}
                value={query}
              />
              <button
                aria-label={t('common.close')}
                className="rounded-full p-1 text-muted-foreground hover:text-foreground"
                onClick={closeSearch}
                type="button"
              >
                <X size={18} />
              </button>
            </div>
          ) : (
            <button
              aria-label={t('settings.search')}
              className="flex size-9 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-surface hover:text-foreground"
              onClick={() => setIsSearchOpen(true)}
              type="button"
            >
              <Search size={18} />
            </button>
          )}
        </div>

        <SettingsSearchProvider query={query}>
          <div className="columns-1 gap-5 xl:columns-2">
            <AccountSettingsSection />
            <ActiveSessionsSection />
            <SubscriptionSettingsSection />
            <AudioSettingsSection />
            <LibraryDisplaySettings />
            <ServerPrivacySettingsSection />
            <ProfileDetailsSection />
            <TwoFactorSettingsSection />
          </div>
        </SettingsSearchProvider>
      </div>
    </div>
  )
}

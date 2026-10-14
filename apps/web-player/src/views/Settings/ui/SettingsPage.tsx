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
    <div className="h-full overflow-y-auto rounded-lg bg-background-secondary custom-scrollbar">
      <div className="mx-auto max-w-220 px-4 py-6 sm:px-5 sm:py-8 lg:px-10 lg:py-10">
        <div className="mb-8 flex min-h-10 items-center justify-between gap-4 sm:mb-12">
          <h1 className="text-3xl font-black text-text sm:text-4xl">
            {t('settings.title')}
          </h1>
          {isSearchOpen ? (
            <div className="flex w-full max-w-80 items-center rounded bg-surface px-3 focus-within:ring-2 focus-within:ring-white/25">
              <Search className="shrink-0 text-text-subdued" size={18} />
              <input
                aria-label={t('settings.search')}
                className="h-10 min-w-0 flex-1 bg-transparent px-2 text-sm text-text outline-none"
                onChange={(event) => setQuery(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === 'Escape') closeSearch()
                }}
                placeholder={t('settings.search.placeholder')}
                value={query}
              />
              <button
                aria-label={t('common.close')}
                className="rounded-full p-1 text-text-subdued hover:text-text"
                onClick={closeSearch}
                type="button"
              >
                <X size={18} />
              </button>
            </div>
          ) : (
            <button
              aria-label={t('settings.search')}
              className="rounded-full p-2 text-text-subdued transition-colors hover:bg-white/10 hover:text-text"
              onClick={() => setIsSearchOpen(true)}
              type="button"
            >
              <Search size={22} />
            </button>
          )}
        </div>

        <SettingsSearchProvider query={query}>
          <div className="grid gap-8">
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

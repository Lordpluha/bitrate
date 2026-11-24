import { Toaster } from '@bitrate/ui-react'
import { useSettingsPersistence, useSettingsStore } from '@entities/Settings'
import { ThemeProvider } from '@shared/contexts'
import { I18nProvider } from '@shared/i18n'
import { QueryClientProvider } from '@tanstack/react-query'
import type { PropsWithChildren } from 'react'
import { queryClient } from './queryClient'

/**
 * web-player's provider stack without what a desktop window does not need: no service worker
 * (the shell owns offline handling) and no React Query devtools overlay.
 */
export const AppProviders = ({ children }: PropsWithChildren) => {
  const locale = useSettingsStore((state) => state.language)
  useSettingsPersistence()

  return (
    <QueryClientProvider client={queryClient}>
      <I18nProvider locale={locale}>
        <ThemeProvider>
          <Toaster />
          {children}
        </ThemeProvider>
      </I18nProvider>
    </QueryClientProvider>
  )
}

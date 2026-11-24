'use client'

import { Toaster } from '@bitrate/ui-react'
import { useSettingsPersistence, useSettingsStore } from '@entities/Settings'
import { createQueryClient } from '@shared/api/client'
import { ThemeProvider } from '@shared/contexts'
import { I18nProvider } from '@shared/i18n'
import { ServiceWorkerRegistration } from '@shared/ui/ServiceWorkerRegistration'
import { QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import type { PropsWithChildren } from 'react'
import { useState } from 'react'

export const Provider = ({ children }: PropsWithChildren) => {
  const [queryClient] = useState(createQueryClient)
  const locale = useSettingsStore((state) => state.language)
  useSettingsPersistence()

  return (
    <QueryClientProvider client={queryClient}>
      <I18nProvider locale={locale}>
        <ThemeProvider>
          <Toaster />
          <ServiceWorkerRegistration />
          {children}
        </ThemeProvider>
      </I18nProvider>
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  )
}

'use client'

import { FC, PropsWithChildren, useEffect, useState } from 'react'

import { Theme } from '@shared/constants'
import { ThemeProvider } from '@shared/contexts'
import { usePersistedState } from '@shared/hooks'
import { Toaster } from '@spotify/ui-react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import ReduxProvider from './providers/ReduxProvider'

export const Provider: FC<PropsWithChildren> = ({ children }) => {
  const [queryClient] = useState(() => new QueryClient({
    defaultOptions: {
      queries: {
        refetchOnWindowFocus: false,
        refetchOnReconnect: false,
        retry: 1,
        staleTime: 5 * 60 * 1000, // 5 минут
      },
    },
  }))
  const [theme, setTheme, , hydrated] = usePersistedState<Theme>(
    'theme',
    'dark'
  )

  useEffect(() => {
    if (!hydrated) return
    document.documentElement.classList.remove('light', 'dark')
    document.documentElement.classList.add(theme)
  }, [theme, hydrated])

  if (!hydrated) return null

  return (
    <ReduxProvider>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider value={{ theme, setTheme }}>
          <Toaster />
          {children}
        </ThemeProvider>
        <ReactQueryDevtools initialIsOpen={false} />
      </QueryClientProvider>
    </ReduxProvider>
  )
}

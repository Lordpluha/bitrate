'use client'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { FC, PropsWithChildren, useEffect, useRef, useState } from 'react'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { ThemeProvider } from '@shared/contexts'
import { theme } from '@shared/constants'
import { AppStore, makeStore } from '@shared/redux'
import { Provider as StoreProvider } from 'react-redux'
import { usePersistedState } from '@shared/hooks'
import { Toaster } from '@spotify/ui'

export const Provider: FC<PropsWithChildren> = ({ children }) => {
  const [queryClient] = useState(() => new QueryClient())
  const storeRef = useRef<AppStore>(null)
  const [theme, setTheme, , hydrated] = usePersistedState<theme>(
    'theme',
    'dark'
  )

  useEffect(() => {
    if (!hydrated) return
    document.documentElement.classList.remove('light', 'dark')
    document.documentElement.classList.add(theme)
  }, [theme, hydrated])

  if (!storeRef.current) {
    storeRef.current = makeStore()
  }

  if (!hydrated) return null

  return (
    <QueryClientProvider client={queryClient}>
      <StoreProvider store={storeRef.current}>
        <ThemeProvider value={{ theme, setTheme }}>
          <Toaster />
          {children}
        </ThemeProvider>
        <ReactQueryDevtools initialIsOpen={false} />
      </StoreProvider>
    </QueryClientProvider>
  )
}

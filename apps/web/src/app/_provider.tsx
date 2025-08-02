'use client'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { FC, PropsWithChildren, useEffect, useRef, useState } from 'react'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { ThemeProvider } from '@shared/contexts'
import { themes } from '@shared/constants'
import { AppStore, makeStore } from '@shared/redux'
import { Provider as StoreProvider } from 'react-redux'
import { usePersistedState } from '@shared/hooks'

export const Provider: FC<PropsWithChildren> = ({ children }) => {
  const [queryClient] = useState(() => new QueryClient())
  const storeRef = useRef<AppStore>(null)
  const [theme, setTheme, , hydrated] = usePersistedState<themes>(
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

  if (!hydrated) return null // не рендерим до загрузки localStorage

  return (
    <QueryClientProvider client={queryClient}>
      <StoreProvider store={storeRef.current}>
        <ThemeProvider value={{ theme, setTheme }}>{children}</ThemeProvider>
        <ReactQueryDevtools initialIsOpen={false} />
      </StoreProvider>
    </QueryClientProvider>
  )
}

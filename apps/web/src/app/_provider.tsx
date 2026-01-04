'use client'

import type { Theme } from '@shared/constants'
import { ThemeProvider } from '@shared/contexts'
import { usePersistedState } from '@shared/hooks'
import { type AppStore, makeStore } from '@shared/redux'
import { Toaster } from '@spotify/ui-react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import {
  type FC,
  type PropsWithChildren,
  useEffect,
  useRef,
  useState,
} from 'react'
import { Provider as StoreProvider } from 'react-redux'

export const Provider: FC<PropsWithChildren> = ({ children }) => {
  const [queryClient] = useState(() => new QueryClient())
  const storeRef = useRef<AppStore>(null)
  const [theme, setTheme, , hydrated] = usePersistedState<Theme>(
    'theme',
    'dark',
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

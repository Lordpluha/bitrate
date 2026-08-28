'use client'

import { createContext, type PropsWithChildren, useContext } from 'react'

const SettingsSearchContext = createContext('')

type SettingsSearchProviderProps = PropsWithChildren<{ query: string }>

export const SettingsSearchProvider = ({
  children,
  query,
}: SettingsSearchProviderProps) => (
  <SettingsSearchContext.Provider value={query.trim().toLocaleLowerCase()}>
    {children}
  </SettingsSearchContext.Provider>
)

export const useSettingsSearch = () => useContext(SettingsSearchContext)

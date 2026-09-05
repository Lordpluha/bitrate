'use client'

import { createContext, type ReactNode, useCallback, useContext, useMemo, useState } from 'react'

export interface InputContextValue {
  isFocused: boolean
  hasValue: boolean
  setFocused: (focused: boolean) => void
  setValue: (hasValue: boolean) => void
}

export const InputContext = createContext<InputContextValue | null>(null)

export const useInputContext = () => {
  const context = useContext(InputContext)
  return context
}

type InputProviderProps = { children?: ReactNode }

export const InputProvider = ({ children }: InputProviderProps) => {
  const [isFocused, setFocused] = useState(false)
  const [hasValue, setValue] = useState(false)

  const handleSetFocused = useCallback((focused: boolean) => {
    setFocused(focused)
  }, [])

  const handleSetValue = useCallback((value: boolean) => {
    setValue(value)
  }, [])

  const value = useMemo(
    () => ({
      isFocused,
      hasValue,
      setFocused: handleSetFocused,
      setValue: handleSetValue,
    }),
    [isFocused, hasValue, handleSetFocused, handleSetValue],
  )

  return <InputContext.Provider value={value}>{children}</InputContext.Provider>
}

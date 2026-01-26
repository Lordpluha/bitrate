'use client'

import * as React from 'react'

export interface InputContextValue {
  isFocused: boolean
  hasValue: boolean
  setFocused: (focused: boolean) => void
  setValue: (hasValue: boolean) => void
}

export const InputContext = React.createContext<InputContextValue | null>(null)

export const useInputContext = () => {
  const context = React.useContext(InputContext)
  return context
}

export const InputProvider: React.FC<React.PropsWithChildren> = ({ children }) => {
  const [isFocused, setFocused] = React.useState(false)
  const [hasValue, setValue] = React.useState(false)

  const handleSetFocused = React.useCallback((focused: boolean) => {
    setFocused(focused)
  }, [])

  const handleSetValue = React.useCallback((value: boolean) => {
    setValue(value)
  }, [])

  const value = React.useMemo(
    () => ({
      isFocused,
      hasValue,
      setFocused: handleSetFocused,
      setValue: handleSetValue
    }),
    [isFocused, hasValue, handleSetFocused, handleSetValue]
  )

  return <InputContext.Provider value={value}>{children}</InputContext.Provider>
}

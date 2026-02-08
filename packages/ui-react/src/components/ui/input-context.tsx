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
  if (!context) {
    throw new Error('useInputContext use no InputProvider')
  }
  return context
}

export const InputProvider: React.FC<React.PropsWithChildren> = ({ children }) => {
  const [isFocused, setFocused] = React.useState(false)
  const [hasValue, setValue] = React.useState(false)

  const value = React.useMemo(
    () => ({
      isFocused,
      hasValue,
      setFocused,
      setValue,
    }),
    [isFocused, hasValue],
  )

  return <InputContext.Provider value={value}>{children}</InputContext.Provider>
}

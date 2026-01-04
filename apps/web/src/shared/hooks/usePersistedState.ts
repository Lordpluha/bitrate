'use client'

import type { Dispatch, SetStateAction } from 'react'
import { useCallback, useEffect, useState } from 'react'

/**
 * usePersistedState
 * Хук, который синхронизирует состояние с localStorage.
 *
 * @param key Ключ, под которым значение будет храниться в localStorage.
 * @param initialValue Начальное значение, если в localStorage ничего нет.
 * @returns Массив, аналогичный useState: [значение, функция для изменения значения, функция очистки localstorage по ключу, состояние гидрации переменной].
 */
export function usePersistedState<T>(
  key: string,
  initialValue: T,
): [T, Dispatch<SetStateAction<T>>, () => void, boolean] {
  const [hydrated, setHydrated] = useState(false)
  const [state, setState] = useState<T>(initialValue)

  useEffect(() => {
    try {
      const storedValue = localStorage.getItem(key)
      if (storedValue) {
        setState(JSON.parse(storedValue) as T)
      }
    } catch (error) {
      console.warn('Error while reading from localStorage:', error)
    } finally {
      setHydrated(true)
    }
  }, [key])

  useEffect(() => {
    if (hydrated) {
      try {
        localStorage.setItem(key, JSON.stringify(state))
      } catch (error) {
        console.warn('Error while writing into localStorage:', error)
      }
    }
  }, [key, state, hydrated])

  const clear = useCallback(() => {
    localStorage.removeItem(key)
  }, [key])

  return [state, setState, clear, hydrated] as const
}

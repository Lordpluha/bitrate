import { useEffect, useState } from 'react'

type UseDebouncedValueInput<TValue> = {
  delayMs: number
  value: TValue
}

/** `value` once it has stopped changing for `delayMs`, so typing does not fire a request per key. */
export const useDebouncedValue = <TValue>({
  delayMs,
  value,
}: UseDebouncedValueInput<TValue>) => {
  const [debouncedValue, setDebouncedValue] = useState(value)

  useEffect(() => {
    const timeoutId = window.setTimeout(() => setDebouncedValue(value), delayMs)
    return () => window.clearTimeout(timeoutId)
  }, [delayMs, value])

  return debouncedValue
}

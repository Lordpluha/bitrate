import { useLocation } from '@tanstack/react-router'
import { useMemo } from 'react'

/** `useSearchParams` from `next/navigation`: the raw query string as `URLSearchParams`. */
export const useNextSearchParams = (): URLSearchParams => {
  const searchStr = useLocation({ select: (location) => location.searchStr })

  return useMemo(() => new URLSearchParams(searchStr), [searchStr])
}

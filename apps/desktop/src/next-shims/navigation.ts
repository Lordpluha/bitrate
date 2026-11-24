import { useLocation } from '@tanstack/react-router'

/**
 * `next/navigation` for the desktop renderer. Only the hooks the reused layers call exist;
 * `redirect` and `notFound` belong to Next's page adapters, which desktop replaces with its
 * own routes, so importing them here fails the type check instead of misbehaving at runtime.
 */
export { useNextRouter as useRouter } from './useNextRouter'
export { useNextSearchParams as useSearchParams } from './useNextSearchParams'

/** `usePathname` from `next/navigation`. */
export const usePathname = (): string => useLocation({ select: (location) => location.pathname })

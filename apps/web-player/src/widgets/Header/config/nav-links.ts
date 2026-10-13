import { ROUTES } from '@shared/routes'

/** Header links on the auth and legal pages: into the player and back to landing scenes. */
export const NAV_LINKS = [
  { title: 'Web player', href: ROUTES.main },
  { title: 'Features', href: ROUTES.landingScene('rules') },
  { title: 'Discover', href: ROUTES.landingScene('discover') },
] as const

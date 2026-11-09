export const LANDING_NAV_ITEMS = [
  { id: 'product', label: 'landing.nav.product', href: '#landing-hero' },
  {
    id: 'releases',
    label: 'landing.nav.releases',
    href: '#landing-studio-stage',
  },
  { id: 'flow', label: 'landing.nav.journey', href: '#landing-signal-flow' },
  { id: 'credits', label: 'landing.nav.credits', href: '#landing-credits' },
  {
    id: 'listening',
    label: 'landing.nav.listening',
    href: '#landing-features',
  },
] as const

export type LandingSection = (typeof LANDING_NAV_ITEMS)[number]['id']

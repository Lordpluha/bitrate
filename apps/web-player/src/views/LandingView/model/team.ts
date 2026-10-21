import type { LandingCopy } from './copy'
import type { LandingKey } from './messages/en'

const REPO = 'https://github.com/Lordpluha/bitrate'

/** One bubble in the team pit: a person or a piece of the stack, with its hover card. */
export type TeamMember = {
  kind: 'person' | 'tech'
  label: string
  name: string
  meta: string
  bio: string
  links: { text: string; href: string }[]
  /** CSS background (palette token references only). */
  bg: string
  r: number
}

type TechRow = { label: string; role: LandingKey; path: string; bg: string }

const TECH: readonly TechRow[] = [
  {
    label: 'Next.js',
    role: 'team.tech_web_player',
    path: 'apps/web-player',
    bg: 'neutral-900',
  },
  {
    label: 'TanStack Start',
    role: 'team.tech_artist_portal',
    path: 'apps/web-artists',
    bg: 'magenta-500',
  },
  { label: 'NestJS', role: 'team.tech_api', path: 'apps/api', bg: 'red-600' },
  {
    label: 'Prisma',
    role: 'team.tech_data_layer',
    path: 'apps/api',
    bg: 'neutral-700',
  },
  {
    label: 'PostgreSQL',
    role: 'team.tech_database',
    path: 'apps/api',
    bg: 'blue-700',
  },
  { label: 'Redis', role: 'team.tech_cache', path: 'apps/api', bg: 'red-700' },
  {
    label: 'Svelte 5',
    role: 'team.tech_player_engine',
    path: 'packages/player',
    bg: 'amber-600',
  },
  {
    label: 'Angular',
    role: 'team.tech_admin',
    path: 'apps/admin',
    bg: 'red-800',
  },
  {
    label: 'Tauri 2',
    role: 'team.tech_desktop',
    path: 'apps/desktop',
    bg: 'blue-600',
  },
  {
    label: 'Expo',
    role: 'team.tech_mobile',
    path: 'apps/mobile',
    bg: 'neutral-800',
  },
  {
    label: 'Tailwind v4',
    role: 'team.tech_tokens',
    path: 'packages/ui-react',
    bg: 'blue-500',
  },
  {
    label: 'Turborepo',
    role: 'team.tech_monorepo',
    path: 'turbo.json',
    bg: 'purple-500',
  },
]

/** The team pit's bubbles in the landing's language: the two people first, then the stack. */
export const teamMembers = ({ copy }: { copy: LandingCopy }): TeamMember[] => [
  {
    kind: 'person',
    label: 'VT',
    name: 'Vladyslav Tesliuk',
    meta: `@Lordpluha · ${copy('team.role_author')}`,
    bio: copy('team.bio_author'),
    links: [
      { text: copy('team.github'), href: 'https://github.com/Lordpluha' },
      { text: copy('team.repository'), href: REPO },
    ],
    bg: 'linear-gradient(135deg, var(--color-purple-500), var(--color-magenta-500))',
    r: 92,
  },
  {
    kind: 'person',
    label: 'AK',
    name: 'Andrey Kalashnikov',
    meta: `@andreo-kalashnello · ${copy('team.role_contributor')}`,
    bio: copy('team.bio_contributor'),
    links: [
      {
        text: copy('team.github'),
        href: 'https://github.com/andreo-kalashnello',
      },
      { text: copy('team.repository'), href: REPO },
    ],
    bg: 'linear-gradient(135deg, var(--color-blue-500), var(--color-purple-500))',
    r: 92,
  },
  ...TECH.map(
    ({ label, role, path, bg }, i): TeamMember => ({
      kind: 'tech',
      label,
      name: label,
      meta: copy(role),
      bio: copy('team.lives_in', { path }),
      links: [
        {
          text: copy('team.open_in_repo'),
          href: `${REPO}/tree/develop/${path}`,
        },
      ],
      bg: `var(--color-${bg})`,
      r: 40 + (i % 4) * 5,
    }),
  ),
]

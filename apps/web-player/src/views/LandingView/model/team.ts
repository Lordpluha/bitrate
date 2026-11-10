import type { LandingCopy } from './copy'
import { GITHUB_REPO_URL as REPO } from './links'
import type { LandingKey } from './messages/en'

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
  {
    label: 'BullMQ',
    role: 'team.tech_queues',
    path: 'apps/api',
    bg: 'red-500',
  },
  {
    label: 'SeaweedFS',
    role: 'team.tech_storage',
    path: 'infra',
    bg: 'green-600',
  },
  {
    label: 'GSAP',
    role: 'team.tech_motion',
    path: 'apps/web-player/src/views/LandingView',
    bg: 'green-500',
  },
  {
    label: 'Three.js',
    role: 'team.tech_3d',
    path: 'apps/web-player/src/views/LandingView',
    bg: 'neutral-900',
  },
  {
    label: 'Storybook',
    role: 'team.tech_components',
    path: 'packages/ui-react',
    bg: 'magenta-500',
  },
  {
    label: 'Docusaurus',
    role: 'team.tech_docs',
    path: 'apps/docs',
    bg: 'green-700',
  },
  {
    label: 'Biome',
    role: 'team.tech_lint',
    path: 'biome.json',
    bg: 'blue-700',
  },
  {
    label: 'Vitest',
    role: 'team.tech_tests',
    path: 'apps/web-player/tests',
    bg: 'amber-500',
  },
]

/** Workspaces in the monorepo: seven apps and eight packages (`pnpm-workspace.yaml`). */
const WORKSPACES = 15

/** The team block's counters. */
export const TEAM_STATS = {
  people: 3,
  workspaces: WORKSPACES,
  palette: 1,
} as const

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
    r: 84,
  },
  {
    kind: 'person',
    label: 'AK',
    name: 'Andrii Kalashnikov',
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
    r: 84,
  },
  {
    kind: 'person',
    label: 'LA',
    name: 'lavanios',
    meta: `@lavanios · ${copy('team.role_contributor')}`,
    bio: copy('team.bio_artist_portal'),
    links: [
      { text: copy('team.github'), href: 'https://github.com/lavanios' },
      { text: copy('team.repository'), href: REPO },
    ],
    bg: 'linear-gradient(135deg, var(--color-magenta-500), var(--color-amber-500))',
    r: 72,
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
      r: 33 + (i % 4) * 4,
    }),
  ),
]

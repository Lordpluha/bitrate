import { render, screen } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { ROUTES } from '@/shared/routes'
import { ProfileMenuContent } from './ProfileMenuContent'

const notifications = vi.hoisted(() => ({
  useNotifications: vi.fn(),
}))
vi.mock('@/entities/Me', async (importOriginal) => ({
  ...(await importOriginal<typeof import('@/entities/Me')>()),
  useNotifications: notifications.useNotifications,
  useReadNotification: () => ({ mutate: vi.fn() }),
}))
vi.mock('@/entities/Me/api/client/hooks', async (importOriginal) => ({
  ...(await importOriginal<typeof import('@/entities/Me/api/client/hooks')>()),
  useReadNotification: () => ({ mutate: vi.fn() }),
}))

const page = (data: unknown[]) => ({
  data: { data, limit: 20, page: 1, total: data.length, unread: data.length },
  isError: false,
  isPending: false,
})

describe('ProfileMenuContent', () => {
  beforeEach(() => {
    notifications.useNotifications.mockReturnValue(page([]))
  })

  it('only exposes existing, unique internal destinations', () => {
    render(<ProfileMenuContent isLogoutPending={false} onLogout={vi.fn()} />)

    expect(
      screen.getAllByRole('link').map((link) => ({
        href: link.getAttribute('href'),
        label: link.textContent,
      })),
    ).toEqual([
      { href: ROUTES.profile, label: 'Profile' },
      { href: ROUTES.recents, label: 'Recents' },
      { href: ROUTES.stats, label: 'Your listening' },
      { href: ROUTES.settings, label: 'Settings' },
    ])
    expect(screen.queryByText('Support')).not.toBeInTheDocument()
    expect(screen.queryByText('Download')).not.toBeInTheDocument()
    expect(screen.queryByText('Account')).not.toBeInTheDocument()
  })
  it('previews unread notifications instead of claiming you are caught up', () => {
    notifications.useNotifications.mockReturnValue(
      page([
        {
          body: 'ann started following you',
          createdAt: new Date('2026-10-14T10:00:00.000Z'),
          id: 'n1',
          payload: { actorId: 'u1', actorUsername: 'ann' },
          readAt: null,
          title: 'New follower',
          type: 'FOLLOW',
          userId: 'me',
        },
      ]),
    )

    render(<ProfileMenuContent isLogoutPending={false} onLogout={vi.fn()} />)

    expect(screen.getByRole('link', { name: /New follower/ })).toHaveAttribute(
      'href',
      ROUTES.user('u1'),
    )
    expect(screen.queryByText("You're all caught up")).not.toBeInTheDocument()
  })
})

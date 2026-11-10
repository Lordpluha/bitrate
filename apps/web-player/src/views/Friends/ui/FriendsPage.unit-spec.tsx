import { render, screen } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

type QueryState = {
  data?: unknown[]
  isError: boolean
  isPending: boolean
  isSuccess: boolean
  refetch: () => void
}

const queries = vi.hoisted(() => ({
  friends: {} as QueryState,
  incoming: {} as QueryState,
}))

vi.mock('@/entities/Friend', () => ({
  FriendRow: () => null,
  FriendTile: () => null,
  useFriendRequests: () => queries.incoming,
  useFriends: () => queries.friends,
}))
vi.mock('@/features/RemoveFriend', () => ({ RemoveFriendMenu: () => null }))

import { FriendsPage } from './FriendsPage'

const loaded = (data: unknown[]): QueryState => ({
  data,
  isError: false,
  isPending: false,
  isSuccess: true,
  refetch: vi.fn(),
})

const failed: QueryState = {
  data: undefined,
  isError: true,
  isPending: false,
  isSuccess: false,
  refetch: vi.fn(),
}

const tabNames = () =>
  ['All', 'Online'].map(
    (name) =>
      screen.getByRole('tab', { name: new RegExp(`^${name}`) }).textContent,
  )

describe('FriendsPage tabs', () => {
  beforeEach(() => {
    queries.friends = loaded([])
    queries.incoming = loaded([])
  })

  it('counts zero friends and zero requests once both have loaded', () => {
    render(<FriendsPage />)

    expect(tabNames()).toEqual(['All · 0', 'Online · 0'])
    expect(
      screen.getByRole('link', { name: 'Requests · 0' }),
    ).toBeInTheDocument()
  })

  it('drops the counts when the friends list failed to load', () => {
    queries.friends = failed
    queries.incoming = failed

    render(<FriendsPage />)

    expect(tabNames()).toEqual(['All', 'Online'])
    expect(screen.getByRole('link', { name: 'Requests' })).toBeInTheDocument()
  })
})

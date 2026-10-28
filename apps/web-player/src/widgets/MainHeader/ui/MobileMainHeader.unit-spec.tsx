import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { MobileMainHeader } from './MobileMainHeader'

const navigation = vi.hoisted(() => ({ pathname: '/main/library' }))
vi.mock('next/navigation', () => ({
  usePathname: () => navigation.pathname,
  useRouter: () => ({ back: vi.fn(), push: vi.fn() }),
}))
vi.mock('@/widgets/MainHeader/ui/HeaderSearch', () => ({
  HeaderSearch: () => <input aria-label="Search" />,
}))
vi.mock('@/shared/hooks', () => ({
  useAuth: () => ({ isAuthenticated: false }),
}))
vi.mock('@/widgets/MainHeader/ui/BurgerMenu', () => ({
  BurgerMenu: () => <button type="button">Open menu</button>,
}))

describe('MobileMainHeader', () => {
  it('shows the account menu on a top-level page', () => {
    navigation.pathname = '/main/library'
    render(<MobileMainHeader />)

    expect(screen.getByRole('button', { name: 'Open menu' })).toBeVisible()
    expect(screen.queryByRole('button', { name: 'Back' })).toBeNull()
  })

  it.each([
    '/main/artist/ar1',
    '/main/album/al1',
    '/main/playlist/pl1',
    '/main/liked-songs',
    '/main/charts',
    '/main/recents',
    '/main/preferences',
    '/main/stats',
    '/main/notifications',
    '/main/queue',
    '/main/lyrics',
  ])('shows Back on the nested page %s', (pathname) => {
    navigation.pathname = pathname
    render(<MobileMainHeader />)

    expect(screen.getByRole('button', { name: 'Back' })).toBeVisible()
    expect(screen.queryByRole('button', { name: 'Open menu' })).toBeNull()
  })

  it('keeps the search field on the search page', () => {
    navigation.pathname = '/main/search'
    render(<MobileMainHeader />)

    expect(screen.getByRole('textbox', { name: 'Search' })).toBeVisible()
    expect(screen.queryByRole('button', { name: 'Back' })).toBeNull()
  })
})

import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { MobileMainHeader } from './MobileMainHeader'

const navigation = vi.hoisted(() => ({
  pathname: '/main/charts',
  search: '',
}))
vi.mock('next/navigation', () => ({
  usePathname: () => navigation.pathname,
  useRouter: () => ({ back: vi.fn(), push: vi.fn() }),
  useSearchParams: () => new URLSearchParams(navigation.search),
}))
vi.mock('@/shared/hooks', () => ({
  useAuth: () => ({ isAuthenticated: false }),
}))
vi.mock('@/widgets/MainHeader/ui/HeaderSearch', () => ({
  HeaderSearch: () => <input aria-label="Search" />,
}))
vi.mock('@/widgets/MainHeader/ui/BurgerMenu', () => ({
  BurgerMenu: () => <button type="button">Open menu</button>,
}))

describe('MobileMainHeader', () => {
  it('shows the account menu on a top-level page', () => {
    navigation.pathname = '/main/charts'
    render(<MobileMainHeader />)

    expect(screen.getByRole('button', { name: 'Open menu' })).toBeVisible()
    expect(screen.queryByRole('button', { name: 'Back' })).toBeNull()
  })

  it('shows Back on a nested page without a back button of its own', () => {
    navigation.pathname = '/main/artist/ar1'
    render(<MobileMainHeader />)

    expect(screen.getByRole('button', { name: 'Back' })).toBeVisible()
    expect(screen.queryByRole('button', { name: 'Open menu' })).toBeNull()
  })

  it.each(['/main/liked-songs', '/main/playlist/pl1', '/main/album/al1'])(
    'shows Back on the collection page %s, whose hero has none',
    (path) => {
      navigation.pathname = path
      navigation.search = ''
      render(<MobileMainHeader />)

      expect(screen.getByRole('button', { name: 'Back' })).toBeVisible()
      expect(screen.queryByRole('button', { name: 'Open menu' })).toBeNull()
    },
  )

  it('shows Back on a search category page but the menu on plain search', () => {
    navigation.pathname = '/main/search'
    navigation.search = 'category=rock'
    const { unmount } = render(<MobileMainHeader />)

    expect(screen.getByRole('button', { name: 'Back' })).toBeVisible()
    unmount()

    navigation.search = ''
    render(<MobileMainHeader />)

    expect(screen.getByRole('button', { name: 'Open menu' })).toBeVisible()
    expect(screen.queryByRole('button', { name: 'Back' })).toBeNull()
  })
})

import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { MobileMainHeader } from './MobileMainHeader'

const navigation = vi.hoisted(() => ({ pathname: '/main/charts' }))
vi.mock('next/navigation', () => ({
  usePathname: () => navigation.pathname,
  useRouter: () => ({ back: vi.fn(), push: vi.fn() }),
}))
vi.mock('@/shared/hooks', () => ({
  useAuth: () => ({ isAuthenticated: false }),
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
})

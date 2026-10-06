import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { LegalReacceptanceDialog } from './LegalReacceptanceDialog'

const useAuthMock = vi.fn()
const mutateAsync = vi.fn()

vi.mock('@shared/hooks', () => ({ useAuth: () => useAuthMock() }))
vi.mock('../api/useAcceptLegal', () => ({
  useAcceptLegal: () => ({ isPending: false, mutateAsync }),
}))
vi.mock('@shared/api/feedback', () => ({ showApiErrorToast: vi.fn() }))

const signedIn = (legalAcceptanceRequired: boolean) => ({
  isLogoutPending: false,
  logout: vi.fn(),
  user: { id: 'user-1', legalAcceptanceRequired },
})

describe('LegalReacceptanceDialog', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mutateAsync.mockResolvedValue(undefined)
  })

  it('renders nothing when the account already accepted the current documents', () => {
    useAuthMock.mockReturnValue(signedIn(false))

    render(<LegalReacceptanceDialog />)

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  it('renders nothing for a visitor who is not signed in', () => {
    useAuthMock.mockReturnValue({
      isLogoutPending: false,
      logout: vi.fn(),
      user: undefined,
    })

    render(<LegalReacceptanceDialog />)

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  it('blocks the app until the box is ticked, then records the acceptance', async () => {
    const user = userEvent.setup()
    useAuthMock.mockReturnValue(signedIn(true))

    render(<LegalReacceptanceDialog />)

    const submit = screen.getByRole('button', { name: 'Continue' })
    expect(screen.getByRole('dialog')).toBeInTheDocument()
    expect(submit).toBeDisabled()

    await user.click(
      screen.getByRole('checkbox', { name: /at least 16 years old/i }),
    )
    expect(submit).toBeEnabled()

    await user.click(submit)
    expect(mutateAsync).toHaveBeenCalledTimes(1)
  })

  it('names the three documents and opens them in a new tab', () => {
    useAuthMock.mockReturnValue(signedIn(true))

    render(<LegalReacceptanceDialog />)

    for (const [name, href] of [
      ['Terms of Use', '/legal/terms'],
      ['Community Guidelines', '/legal/community'],
      ['Privacy Policy', '/legal/privacy'],
    ]) {
      const link = screen.getByRole('link', { name })
      expect(link).toHaveAttribute('href', href)
      expect(link).toHaveAttribute('target', '_blank')
    }
  })

  it('lets the user sign out instead of accepting', async () => {
    const user = userEvent.setup()
    const auth = signedIn(true)
    useAuthMock.mockReturnValue(auth)

    render(<LegalReacceptanceDialog />)
    await user.click(screen.getByRole('button', { name: 'Sign out' }))

    expect(auth.logout).toHaveBeenCalledTimes(1)
    expect(mutateAsync).not.toHaveBeenCalled()
  })
})

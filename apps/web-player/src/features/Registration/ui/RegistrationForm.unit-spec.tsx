import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { RegistrationForm } from './RegistrationForm'

const mutateAsync = vi.fn()

vi.mock('@shared/api/client', () => ({
  clientFetchClient: {
    GET: vi.fn().mockResolvedValue({ response: { ok: false } }),
  },
  useMutation: () => ({ error: null, isPending: false, mutateAsync }),
}))
vi.mock('@shared/api/feedback', () => ({ showApiErrorToast: vi.fn() }))
const { trackFunnel } = vi.hoisted(() => ({ trackFunnel: vi.fn() }))
vi.mock('@shared/analytics', () => ({ trackFunnel }))
const steps = () => trackFunnel.mock.calls.map(([event]) => event.step)
vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn(), replace: vi.fn() }),
  useSearchParams: () => new URLSearchParams(),
}))

const fillAccount = async (user: ReturnType<typeof userEvent.setup>) => {
  await user.type(
    screen.getByRole('textbox', { name: 'Full Name' }),
    'Maya Rivers',
  )
  await user.type(
    screen.getByRole('textbox', { name: 'Email Address' }),
    'listener@example.com',
  )
  await user.type(screen.getByLabelText('Password'), 'Str0ng!Passw0rd')
}

const consentBox = () =>
  screen.getByRole('checkbox', { name: /at least 16 years old/i })

describe('RegistrationForm consent', () => {
  beforeEach(() => {
    mutateAsync.mockReset()
    trackFunnel.mockReset()
    mutateAsync.mockResolvedValue({})
  })

  it('does not register while the consent box is unticked', async () => {
    const user = userEvent.setup()
    render(<RegistrationForm />)

    await fillAccount(user)
    await user.click(screen.getByRole('button', { name: 'Register' }))

    await waitFor(() =>
      expect(consentBox()).toHaveAttribute('aria-invalid', 'true'),
    )
    expect(
      screen.getByText(
        'You must accept the Terms of Use and Community Guidelines',
      ),
    ).toBeInTheDocument()
    expect(mutateAsync).not.toHaveBeenCalled()
    expect(consentBox()).toHaveFocus()
  })

  it('registers once the consent box is ticked', async () => {
    const user = userEvent.setup()
    render(<RegistrationForm />)

    await fillAccount(user)
    await user.click(consentBox())
    await user.click(screen.getByRole('button', { name: 'Register' }))

    await waitFor(() =>
      expect(mutateAsync).toHaveBeenCalledWith({
        body: {
          acceptLegal: true,
          email: 'listener@example.com',
          password: 'Str0ng!Passw0rd',
          username: 'Maya Rivers',
        },
      }),
    )
  })

  describe('funnel', () => {
    it('counts the form being shown', () => {
      render(<RegistrationForm />)
      expect(trackFunnel).toHaveBeenCalledWith({
        step: 'signup.view',
        attributes: { surface: 'page' },
      })
    })

    it('counts nothing more while the consent box stops the submit', async () => {
      const user = userEvent.setup()
      render(<RegistrationForm />)
      await fillAccount(user)
      await user.click(screen.getByRole('button', { name: 'Register' }))
      await waitFor(() =>
        expect(consentBox()).toHaveAttribute('aria-invalid', 'true'),
      )
      expect(steps()).toEqual(['signup.view'])
    })

    it('counts the submit and the account being created', async () => {
      const user = userEvent.setup()
      render(<RegistrationForm />)
      await fillAccount(user)
      await user.click(consentBox())
      await user.click(screen.getByRole('button', { name: 'Register' }))
      await waitFor(() =>
        expect(steps()).toEqual([
          'signup.view',
          'signup.submit',
          'signup.success',
        ]),
      )
    })
  })
})

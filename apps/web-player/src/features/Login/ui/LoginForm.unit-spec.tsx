import { I18nProvider } from '@shared/i18n'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { LoginForm } from './LoginForm'

const mutateAsync = vi.fn()

vi.mock('@shared/api/client', () => ({
  clientFetchClient: {
    GET: vi.fn().mockResolvedValue({ response: { ok: false } }),
  },
  useMutation: () => ({ error: null, isPending: false, mutateAsync }),
}))
vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn(), replace: vi.fn() }),
  useSearchParams: () => new URLSearchParams(),
}))

const fillCredentials = async (user: ReturnType<typeof userEvent.setup>) => {
  await user.type(
    screen.getByRole('textbox', { name: 'Email Address' }),
    'listener@example.com',
  )
  await user.type(screen.getByLabelText('Password'), 'Str0ng!Passw0rd')
}

const consentBox = () =>
  screen.getByRole('checkbox', { name: /at least 16 years old/i })

describe('LoginForm consent', () => {
  beforeEach(() => {
    mutateAsync.mockReset()
    mutateAsync.mockResolvedValue({})
  })

  it('does not send the credentials while the consent box is unticked', async () => {
    const user = userEvent.setup()
    render(<LoginForm />)

    await fillCredentials(user)
    await user.click(screen.getByRole('button', { name: 'Log in' }))

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

  it('explains the missing consent in the interface language', async () => {
    const user = userEvent.setup()
    render(
      <I18nProvider locale="pl">
        <LoginForm />
      </I18nProvider>,
    )

    await user.click(screen.getByRole('button', { name: 'Zaloguj się' }))

    expect(
      await screen.findByText(
        'Musisz zaakceptować Warunki korzystania i Zasady społeczności',
      ),
    ).toBeInTheDocument()
    expect(mutateAsync).not.toHaveBeenCalled()
  })

  it('signs in once the consent box is ticked, sending only the credentials', async () => {
    const user = userEvent.setup()
    render(<LoginForm />)

    await fillCredentials(user)
    await user.click(consentBox())
    await user.click(screen.getByRole('button', { name: 'Log in' }))

    await waitFor(() =>
      expect(mutateAsync).toHaveBeenCalledWith({
        body: { email: 'listener@example.com', password: 'Str0ng!Passw0rd' },
      }),
    )
  })

  it('unlocks social sign-in with the same consent box', async () => {
    const user = userEvent.setup()
    render(<LoginForm />)

    expect(screen.getAllByRole('checkbox')).toHaveLength(1)
    expect(
      screen.getByRole('button', { name: 'Continue with Google' }),
    ).toBeDisabled()

    await user.click(consentBox())

    expect(
      screen.getByRole('link', { name: 'Continue with Google' }),
    ).toHaveAttribute('href', expect.stringContaining('acceptLegal=true'))
  })
})

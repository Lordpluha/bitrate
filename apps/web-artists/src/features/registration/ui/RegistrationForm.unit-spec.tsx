import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import type { ReactNode } from 'react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { RegistrationForm } from './RegistrationForm'

/**
 * The API client captures `fetch` when it is created, so the network stub has to be in place
 * before the form's modules load.
 */
const fetchMock = vi.hoisted(() => {
  const mock = vi.fn<typeof fetch>()
  globalThis.fetch = mock
  return mock
})

vi.mock('@tanstack/react-router', () => ({
  useNavigate: () => vi.fn(),
  Link: ({ to, children }: { to: string; children: ReactNode }) => (
    <a href={to}>{children}</a>
  ),
}))

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  })

fetchMock.mockImplementation(async (input) => {
  const url = input instanceof Request ? input.url : String(input)
  if (url.includes('/email-availability')) return json({ available: true })
  return json({ id: 'artist-1' }, 201)
})

/** Every request the form sent to the sign-up endpoint, as parsed JSON bodies. */
const registrationBodies = async () => {
  const requests = fetchMock.mock.calls
    .map(([input]) => input)
    .filter(
      (input): input is Request =>
        input instanceof Request && input.url.endsWith('/auth/registration'),
    )
  return Promise.all(requests.map((request) => request.clone().json()))
}

/** Renders sign-up, passes the email step and types a valid password. */
const reachPasswordStep = async () => {
  const user = userEvent.setup()
  render(
    <QueryClientProvider client={new QueryClient()}>
      <RegistrationForm />
    </QueryClientProvider>,
  )

  await user.type(
    screen.getByRole('textbox', { name: 'Email Address' }),
    'artist@bitrate.me',
  )
  await user.click(screen.getByRole('button', { name: 'Continue' }))
  await user.type(await screen.findByLabelText('Password'), 'correct-horse-7')
  return user
}

afterEach(() => {
  fetchMock.mockClear()
})

describe('RegistrationForm legal acceptance', () => {
  it('sends no sign-up request while the age and legal confirmation is unticked', async () => {
    const user = await reachPasswordStep()

    await user.click(
      screen.getByRole('checkbox', { name: /accept the Artist Agreement/i }),
    )
    await user.click(screen.getByRole('button', { name: 'Continue' }))

    expect(
      await screen.findByText(
        'You must accept the Terms of Use and Community Guidelines',
      ),
    ).toBeInTheDocument()
    expect(await registrationBodies()).toEqual([])
  })

  it('sends no sign-up request while the Artist Agreement is unticked', async () => {
    const user = await reachPasswordStep()

    await user.click(
      screen.getByRole('checkbox', { name: /at least 16 years old/i }),
    )
    await user.click(screen.getByRole('button', { name: 'Continue' }))

    expect(
      await screen.findByText('You must accept the Artist Agreement'),
    ).toBeInTheDocument()
    expect(await registrationBodies()).toEqual([])
  })

  it('sends the sign-up request with the acceptances once both are ticked', async () => {
    const user = await reachPasswordStep()

    await user.click(
      screen.getByRole('checkbox', { name: /at least 16 years old/i }),
    )
    await user.click(
      screen.getByRole('checkbox', { name: /accept the Artist Agreement/i }),
    )
    await user.click(screen.getByRole('button', { name: 'Continue' }))

    await waitFor(async () =>
      expect(await registrationBodies()).toEqual([
        expect.objectContaining({
          acceptArtistAgreement: true,
          acceptLegal: true,
          email: 'artist@bitrate.me',
        }),
      ]),
    )
  })
})

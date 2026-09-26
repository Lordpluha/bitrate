import { toast } from '@bitrate/ui-react'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { ForgotPasswordForm } from './ForgotPasswordForm'

vi.mock('@bitrate/ui-react', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@bitrate/ui-react')>()

  return { ...actual, toast: { success: vi.fn(), error: vi.fn() } }
})

/**
 * Integration rather than unit: this exercises the schema, react-hook-form's resolver, the
 * shared UI primitives and the submit path composed together. Only the network is stubbed —
 * everything between the keystroke and the request is the real thing.
 */
describe('ForgotPasswordForm', () => {
  let fetchMock: ReturnType<typeof vi.fn>

  beforeEach(() => {
    fetchMock = vi.fn()
    vi.stubGlobal('fetch', fetchMock)
    vi.mocked(toast.success).mockClear()
    vi.mocked(toast.error).mockClear()
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('lowercases the address before sending it', async () => {
    fetchMock.mockResolvedValue({ ok: true, json: async () => ({}) })

    render(<ForgotPasswordForm />)
    await userEvent.type(screen.getByLabelText('Email'), 'Artist@Bitrate.ME')
    await userEvent.click(
      screen.getByRole('button', { name: 'Send reset link' }),
    )

    await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(1))

    const [, init] = fetchMock.mock.calls[0] as [string, RequestInit]
    expect(JSON.parse(init.body as string)).toEqual({
      email: 'artist@bitrate.me',
    })
  })

  /**
   * Pins today's behaviour, which is not quite what the submit handler suggests: it calls
   * `.trim()`, but the schema validates the untrimmed value, so a pasted address with a
   * trailing space never reaches it. Worth deciding deliberately — either preprocess the
   * schema with a trim, or drop the trim as dead code — but not worth changing silently.
   */
  it('rejects a pasted address with surrounding whitespace before the trim can help', async () => {
    render(<ForgotPasswordForm />)
    await userEvent.type(screen.getByLabelText('Email'), ' artist@bitrate.me ')
    await userEvent.click(
      screen.getByRole('button', { name: 'Send reset link' }),
    )

    expect(
      await screen.findByText('Please enter a valid email address'),
    ).toBeVisible()
    expect(fetchMock).not.toHaveBeenCalled()
  })

  it('confirms without revealing whether the address exists', async () => {
    fetchMock.mockResolvedValue({ ok: true, json: async () => ({}) })

    render(<ForgotPasswordForm />)
    await userEvent.type(screen.getByLabelText('Email'), 'artist@bitrate.me')
    await userEvent.click(
      screen.getByRole('button', { name: 'Send reset link' }),
    )

    await waitFor(() =>
      expect(toast.success).toHaveBeenCalledWith(
        'If that email exists, a reset link was sent',
      ),
    )
  })

  describe('when the input is not an address', () => {
    it('shows the schema message and sends nothing', async () => {
      render(<ForgotPasswordForm />)
      await userEvent.type(screen.getByLabelText('Email'), 'artist-at-bitrate')
      await userEvent.click(
        screen.getByRole('button', { name: 'Send reset link' }),
      )

      expect(
        await screen.findByText('Please enter a valid email address'),
      ).toBeVisible()
      expect(fetchMock).not.toHaveBeenCalled()
    })

    it('refuses an empty field rather than posting a blank address', async () => {
      render(<ForgotPasswordForm />)
      await userEvent.click(
        screen.getByRole('button', { name: 'Send reset link' }),
      )

      expect(
        await screen.findByText('Please enter a valid email address'),
      ).toBeVisible()
      expect(fetchMock).not.toHaveBeenCalled()
    })
  })

  describe('when the request fails', () => {
    it('surfaces the API message rather than a generic one', async () => {
      fetchMock.mockResolvedValue({
        ok: false,
        json: async () => ({ message: 'Too many attempts, try later' }),
      })

      render(<ForgotPasswordForm />)
      await userEvent.type(screen.getByLabelText('Email'), 'artist@bitrate.me')
      await userEvent.click(
        screen.getByRole('button', { name: 'Send reset link' }),
      )

      await waitFor(() =>
        expect(toast.error).toHaveBeenCalledWith(
          'Too many attempts, try later',
        ),
      )
    })

    /** NestJS validation errors arrive as an array; showing "[object Object]" would be worse. */
    it('takes the first message when the API returns a list', async () => {
      fetchMock.mockResolvedValue({
        ok: false,
        json: async () => ({
          message: ['email must be an email', 'and so on'],
        }),
      })

      render(<ForgotPasswordForm />)
      await userEvent.type(screen.getByLabelText('Email'), 'artist@bitrate.me')
      await userEvent.click(
        screen.getByRole('button', { name: 'Send reset link' }),
      )

      await waitFor(() =>
        expect(toast.error).toHaveBeenCalledWith('email must be an email'),
      )
    })

    it('falls back to a readable message when the body is not JSON', async () => {
      fetchMock.mockResolvedValue({
        ok: false,
        json: async () => {
          throw new Error('not json')
        },
      })

      render(<ForgotPasswordForm />)
      await userEvent.type(screen.getByLabelText('Email'), 'artist@bitrate.me')
      await userEvent.click(
        screen.getByRole('button', { name: 'Send reset link' }),
      )

      await waitFor(() =>
        expect(toast.error).toHaveBeenCalledWith('Unable to process request'),
      )
    })

    it('reports a network failure instead of hanging silently', async () => {
      fetchMock.mockRejectedValue(new Error('Failed to fetch'))

      render(<ForgotPasswordForm />)
      await userEvent.type(screen.getByLabelText('Email'), 'artist@bitrate.me')
      await userEvent.click(
        screen.getByRole('button', { name: 'Send reset link' }),
      )

      await waitFor(() =>
        expect(toast.error).toHaveBeenCalledWith('Failed to fetch'),
      )
    })
  })
})

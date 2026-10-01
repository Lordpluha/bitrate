import { zodResolver } from '@hookform/resolvers/zod'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useForm } from 'react-hook-form'
import { describe, expect, it, vi } from 'vitest'
import {
  type RegistrationFormData,
  registrationSchema,
} from '../validation/RegistrationForm.validation'
import { RegistrationPasswordStep } from './RegistrationPasswordStep'

const RULES = { hasLetter: true, hasMinLength: true, hasNumberOrSpecial: true }

type HarnessProps = {
  onValid: (data: RegistrationFormData) => void
}

/** Step two of sign-up wired to the real schema, with a valid email and password already in. */
const Harness = ({ onValid }: HarnessProps) => {
  const form = useForm<RegistrationFormData>({
    resolver: zodResolver(registrationSchema),
    defaultValues: {
      acceptArtistAgreement: false,
      acceptLegal: false,
      email: 'artist@bitrate.me',
      password: 'correct-horse-7',
    },
  })

  return (
    <RegistrationPasswordStep
      form={form}
      isPending={false}
      onBack={() => undefined}
      onSubmit={form.handleSubmit(onValid)}
      rules={RULES}
    />
  )
}

describe('RegistrationPasswordStep legal acceptance', () => {
  it('blocks the sign-up and names both missing acceptances', async () => {
    const user = userEvent.setup()
    const onValid = vi.fn()
    render(<Harness onValid={onValid} />)

    await user.click(screen.getByRole('button', { name: 'Continue' }))

    await waitFor(() =>
      expect(
        screen.getByText(
          'You must accept the Terms of Use and Community Guidelines',
        ),
      ).toBeInTheDocument(),
    )
    expect(
      screen.getByText('You must accept the Artist Agreement'),
    ).toBeInTheDocument()
    expect(onValid).not.toHaveBeenCalled()
  })

  it('still blocks the sign-up when only one document is accepted', async () => {
    const user = userEvent.setup()
    const onValid = vi.fn()
    render(<Harness onValid={onValid} />)

    await user.click(
      screen.getByRole('checkbox', { name: /at least 16 years old/i }),
    )
    await user.click(screen.getByRole('button', { name: 'Continue' }))

    await waitFor(() =>
      expect(
        screen.getByText('You must accept the Artist Agreement'),
      ).toBeInTheDocument(),
    )
    expect(onValid).not.toHaveBeenCalled()
  })

  it('submits once both documents are accepted', async () => {
    const user = userEvent.setup()
    const onValid = vi.fn()
    render(<Harness onValid={onValid} />)

    await user.click(
      screen.getByRole('checkbox', { name: /at least 16 years old/i }),
    )
    await user.click(
      screen.getByRole('checkbox', { name: /accept the Artist Agreement/i }),
    )
    await user.click(screen.getByRole('button', { name: 'Continue' }))

    await waitFor(() => expect(onValid).toHaveBeenCalledOnce())
    expect(onValid.mock.calls[0]?.[0]).toMatchObject({
      acceptArtistAgreement: true,
      acceptLegal: true,
    })
  })

  it('links to the published documents', () => {
    render(<Harness onValid={vi.fn()} />)

    expect(screen.getByRole('link', { name: 'Terms of Use' })).toHaveAttribute(
      'href',
      '/legal/terms',
    )
    expect(
      screen.getByRole('link', { name: 'Artist Agreement' }),
    ).toHaveAttribute('href', '/legal/artist-agreement')
  })
})

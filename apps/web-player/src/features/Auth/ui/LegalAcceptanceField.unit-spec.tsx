import { Form } from '@bitrate/ui-react'
import type { RegistrationFormData } from '@entities/User'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useForm } from 'react-hook-form'
import { describe, expect, it } from 'vitest'
import { LegalAcceptanceField } from './LegalAcceptanceField'

type HarnessProps = {
  onValues?: (values: RegistrationFormData) => void
  error?: string
}

const Harness = ({ onValues, error }: HarnessProps) => {
  const form = useForm<RegistrationFormData>({
    defaultValues: {
      acceptLegal: false,
      confirmPassword: '',
      email: '',
      fullName: '',
      password: '',
    },
  })
  onValues?.(form.watch())

  return (
    <Form {...form}>
      <form>
        <LegalAcceptanceField control={form.control} id="accept-legal" />
        {error ? (
          <button
            onClick={() => form.setError('acceptLegal', { message: error })}
            type="button"
          >
            fail
          </button>
        ) : null}
      </form>
    </Form>
  )
}

describe('LegalAcceptanceField', () => {
  it('starts unchecked and names the documents the user accepts', () => {
    render(<Harness />)

    expect(
      screen.getByRole('checkbox', { name: /at least 16 years old/i }),
    ).not.toBeChecked()
    expect(screen.getByRole('link', { name: 'Terms of Use' })).toHaveAttribute(
      'href',
      '/legal/terms',
    )
    expect(
      screen.getByRole('link', { name: 'Privacy Policy' }),
    ).toHaveAttribute('href', '/legal/privacy')
    expect(
      screen.getByRole('link', { name: 'Community Guidelines' }),
    ).toHaveAttribute('href', '/legal/community')
  })

  it('opens the documents in a new tab so the typed form data is kept', () => {
    render(<Harness />)

    for (const name of [
      'Terms of Use',
      'Community Guidelines',
      'Privacy Policy',
    ]) {
      expect(screen.getByRole('link', { name })).toHaveAttribute(
        'target',
        '_blank',
      )
    }
  })

  it('records the acceptance in the form when the box is ticked', async () => {
    const user = userEvent.setup()
    let latest: RegistrationFormData | undefined
    render(<Harness onValues={(values) => (latest = values)} />)

    await user.click(
      screen.getByRole('checkbox', { name: /at least 16 years old/i }),
    )

    expect(latest?.acceptLegal).toBe(true)
  })

  it('toggles from the label text as well as the box', async () => {
    const user = userEvent.setup()
    render(<Harness />)

    await user.click(screen.getByText(/I am at least 16 years old/))

    expect(
      screen.getByRole('checkbox', { name: /at least 16 years old/i }),
    ).toBeChecked()
  })

  it('shows a validation message and marks the box invalid', async () => {
    const user = userEvent.setup()
    render(
      <Harness error="You must accept the Terms of Use and Community Guidelines" />,
    )

    await user.click(screen.getByRole('button', { name: 'fail' }))

    await waitFor(() =>
      expect(
        screen.getByText(
          'You must accept the Terms of Use and Community Guidelines',
        ),
      ).toBeInTheDocument(),
    )
    expect(
      screen.getByRole('checkbox', { name: /at least 16 years old/i }),
    ).toHaveAttribute('aria-invalid', 'true')
  })
})

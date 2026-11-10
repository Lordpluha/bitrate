import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import { QuickGoogleSignIn } from './QuickGoogleSignIn'

const GOOGLE = 'Continue with Google'

describe('QuickGoogleSignIn', () => {
  it('offers only Google, locked until the documents are accepted', () => {
    render(<QuickGoogleSignIn />)

    expect(
      screen.getByRole('checkbox', { name: /at least 16 years old/i }),
    ).not.toBeChecked()
    expect(screen.getByRole('button', { name: GOOGLE })).toBeDisabled()
    expect(screen.queryByRole('link', { name: GOOGLE })).not.toBeInTheDocument()
    /* one quick way in, not the full provider list */
    expect(screen.queryByText(/more options/i)).not.toBeInTheDocument()
  })

  it('starts Google sign-in with the acceptance once the box is ticked', async () => {
    const user = userEvent.setup()
    render(<QuickGoogleSignIn />)

    await user.click(
      screen.getByRole('checkbox', { name: /at least 16 years old/i }),
    )

    expect(screen.getByRole('link', { name: GOOGLE })).toHaveAttribute(
      'href',
      expect.stringContaining('/api/v1/auth/oauth/google?acceptLegal=true'),
    )
  })
})

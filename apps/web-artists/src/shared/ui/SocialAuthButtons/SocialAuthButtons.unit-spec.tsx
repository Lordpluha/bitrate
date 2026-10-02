import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import { SocialAuthButtons } from './SocialAuthButtons'

const CHECKBOX = /at least 16 years old/i

describe('SocialAuthButtons', () => {
  it('keeps both providers locked until the documents are accepted', () => {
    render(<SocialAuthButtons />)

    expect(screen.getByRole('checkbox', { name: CHECKBOX })).not.toBeChecked()
    for (const label of ['Continue with Google', 'Continue with Facebook']) {
      expect(screen.getByRole('button', { name: label })).toBeDisabled()
      expect(
        screen.queryByRole('link', { name: label }),
      ).not.toBeInTheDocument()
    }
  })

  it.each([
    ['Continue with Google', '/api/v1/artists/auth/oauth/google'],
    ['Continue with Facebook', '/api/v1/artists/auth/oauth/facebook'],
  ])('%s starts the flow with both acceptances once ticked', async (label, path) => {
    const user = userEvent.setup()
    render(<SocialAuthButtons />)

    await user.click(screen.getByRole('checkbox', { name: CHECKBOX }))

    const href = screen.getByRole('link', { name: label }).getAttribute('href')
    expect(href).toContain(path)
    expect(href).toContain('?acceptLegal=true&acceptArtistAgreement=true')
  })

  it('links the checkbox text to all three documents', () => {
    render(<SocialAuthButtons />)

    expect(screen.getByRole('link', { name: 'Terms of Use' })).toHaveAttribute(
      'href',
      '/legal/terms',
    )
    expect(
      screen.getByRole('link', { name: 'Privacy Policy' }),
    ).toHaveAttribute('href', '/legal/privacy')
    expect(
      screen.getByRole('link', { name: 'Artist Agreement' }),
    ).toHaveAttribute('href', '/legal/artist-agreement')
    expect(
      screen.getByRole('link', { name: 'Community Guidelines' }),
    ).toHaveAttribute('href', '/legal/community')
  })

  it('opens the documents in a new tab', () => {
    render(<SocialAuthButtons />)

    for (const link of screen.getAllByRole('link')) {
      expect(link).toHaveAttribute('target', '_blank')
    }
  })
})

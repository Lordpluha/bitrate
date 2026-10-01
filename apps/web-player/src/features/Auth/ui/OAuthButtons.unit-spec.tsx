import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import { OAuthButtons } from './OAuthButtons'

const GOOGLE = 'Continue with Google'

describe('OAuthButtons', () => {
  describe('on its own (sign-in)', () => {
    it('keeps the social buttons locked until the documents are accepted', () => {
      render(<OAuthButtons />)

      expect(
        screen.getByRole('checkbox', { name: /at least 16 years old/i }),
      ).not.toBeChecked()
      expect(screen.getByRole('button', { name: GOOGLE })).toBeDisabled()
      expect(
        screen.queryByRole('link', { name: GOOGLE }),
      ).not.toBeInTheDocument()
    })

    it('unlocks them, with the acceptance in the start URL, once ticked', async () => {
      const user = userEvent.setup()
      render(<OAuthButtons />)

      await user.click(
        screen.getByRole('checkbox', { name: /at least 16 years old/i }),
      )

      expect(screen.getByRole('link', { name: GOOGLE })).toHaveAttribute(
        'href',
        expect.stringContaining('/api/v1/auth/oauth/google?acceptLegal=true'),
      )
    })

    it('links the checkbox text to both documents', () => {
      render(<OAuthButtons />)

      expect(
        screen.getByRole('link', { name: 'Terms of Use' }),
      ).toHaveAttribute('href', '/legal/terms')
      expect(
        screen.getByRole('link', { name: 'Privacy Policy' }),
      ).toHaveAttribute('href', '/legal/privacy')
    })
  })

  describe('under a form that already has the checkbox (registration)', () => {
    it('adds no second checkbox and stays locked while the form box is empty', () => {
      render(<OAuthButtons accepted={false} />)

      expect(screen.queryByRole('checkbox')).not.toBeInTheDocument()
      expect(screen.getByRole('button', { name: GOOGLE })).toBeDisabled()
    })

    it('unlocks as soon as the form box is ticked', () => {
      render(<OAuthButtons accepted />)

      expect(screen.getByRole('link', { name: GOOGLE })).toHaveAttribute(
        'href',
        expect.stringContaining('acceptLegal=true'),
      )
    })
  })
})

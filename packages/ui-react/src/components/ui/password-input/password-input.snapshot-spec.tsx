import { render } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { PasswordInput } from './password-input'

describe('PasswordInput snapshots', () => {
  it('matches snapshot — hidden', () => {
    const { container } = render(<PasswordInput placeholder="Password" />)
    expect(container.firstChild).toMatchSnapshot()
  })

  it('matches snapshot — visible', () => {
    const { container } = render(<PasswordInput showPassword placeholder="Password" />)
    expect(container.firstChild).toMatchSnapshot()
  })
})

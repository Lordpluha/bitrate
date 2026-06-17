import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import { Input } from '../input'
import { InputProvider } from '../input-context'
import { DynamicLabel } from './dynamic-label'

describe('DynamicLabel integration', () => {
  it('floats to the top when the related input gains focus', async () => {
    render(
      <InputProvider>
        <div className="relative">
          <DynamicLabel htmlFor="email">Email</DynamicLabel>
          <Input id="email" />
        </div>
      </InputProvider>,
    )
    const label = screen.getByText('Email')
    expect(label).toHaveClass('top-1/2')

    await userEvent.click(screen.getByRole('textbox'))
    expect(label).toHaveClass('-top-2')
  })

  it('stays floating once the input has a value', async () => {
    render(
      <InputProvider>
        <div className="relative">
          <DynamicLabel htmlFor="email">Email</DynamicLabel>
          <Input id="email" />
        </div>
      </InputProvider>,
    )
    const input = screen.getByRole('textbox')
    await userEvent.type(input, 'hi')
    await userEvent.tab()
    expect(screen.getByText('Email')).toHaveClass('-top-2')
  })
})

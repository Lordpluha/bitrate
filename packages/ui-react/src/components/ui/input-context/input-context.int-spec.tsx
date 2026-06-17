import { act, render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { InputProvider, useInputContext } from './input-context'

const Probe = () => {
  const ctx = useInputContext()
  return (
    <div>
      <span data-testid="focused">{String(ctx?.isFocused)}</span>
      <span data-testid="hasValue">{String(ctx?.hasValue)}</span>
      <button type="button" onClick={() => ctx?.setFocused(true)}>
        focus
      </button>
      <button type="button" onClick={() => ctx?.setValue(true)}>
        value
      </button>
    </div>
  )
}

describe('InputContext integration', () => {
  it('updates focused and hasValue state through the setters', () => {
    render(
      <InputProvider>
        <Probe />
      </InputProvider>,
    )
    act(() => {
      screen.getByText('focus').click()
      screen.getByText('value').click()
    })
    expect(screen.getByTestId('focused')).toHaveTextContent('true')
    expect(screen.getByTestId('hasValue')).toHaveTextContent('true')
  })
})

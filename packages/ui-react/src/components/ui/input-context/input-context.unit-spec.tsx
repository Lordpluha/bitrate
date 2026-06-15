import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { InputProvider, useInputContext } from './input-context'

const Consumer = () => {
  const ctx = useInputContext()
  return (
    <div>
      <span data-testid="focused">{String(ctx?.isFocused)}</span>
      <span data-testid="hasValue">{String(ctx?.hasValue)}</span>
    </div>
  )
}

describe('InputContext', () => {
  it('returns null when used outside a provider', () => {
    render(<Consumer />)
    expect(screen.getByTestId('focused')).toHaveTextContent('undefined')
  })

  it('provides default state values inside the provider', () => {
    render(
      <InputProvider>
        <Consumer />
      </InputProvider>,
    )
    expect(screen.getByTestId('focused')).toHaveTextContent('false')
    expect(screen.getByTestId('hasValue')).toHaveTextContent('false')
  })

  it('exposes setters from the context', () => {
    let setters: ReturnType<typeof useInputContext> = null
    const Grab = () => {
      setters = useInputContext()
      return null
    }
    render(
      <InputProvider>
        <Grab />
      </InputProvider>,
    )
    expect(typeof setters?.setFocused).toBe('function')
    expect(typeof setters?.setValue).toBe('function')
  })
})

import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { type InputContextValue, InputProvider, useInputContext } from './input-context'

const Consumer = () => {
  const ctx = useInputContext()
  return (
    <div>
      <span data-testid="focused">{String(ctx?.isFocused)}</span>
      <span data-testid="hasValue">{String(ctx?.hasValue)}</span>
    </div>
  )
}

type GrabProps = {
  onContext: (context: ReturnType<typeof useInputContext>) => void
}

const Grab = ({ onContext }: GrabProps) => {
  onContext(useInputContext())
  return null
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
    let setFocused: InputContextValue['setFocused'] | undefined
    let setValue: InputContextValue['setValue'] | undefined
    render(
      <InputProvider>
        <Grab
          onContext={(context) => {
            setFocused = context?.setFocused
            setValue = context?.setValue
          }}
        />
      </InputProvider>,
    )
    expect(typeof setFocused).toBe('function')
    expect(typeof setValue).toBe('function')
  })
})

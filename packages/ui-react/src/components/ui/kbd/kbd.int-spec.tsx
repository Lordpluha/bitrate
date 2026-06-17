import { render } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { Kbd, KbdGroup } from './kbd'

describe('Kbd integration', () => {
  it('renders a multi-key shortcut composition in order', () => {
    render(
      <KbdGroup>
        <Kbd>⌘</Kbd>
        <Kbd>Shift</Kbd>
        <Kbd>P</Kbd>
      </KbdGroup>,
    )
    const group = document.querySelector('[data-slot="kbd-group"]')
    expect(group?.textContent).toBe('⌘ShiftP')
  })
})

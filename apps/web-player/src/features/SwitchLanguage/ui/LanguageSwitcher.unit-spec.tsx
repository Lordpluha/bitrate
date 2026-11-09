import { useSettingsStore } from '@entities/Settings'
import { I18nProvider } from '@shared/i18n'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it } from 'vitest'
import { LanguageSwitcher } from './LanguageSwitcher'

/** The app wires the provider to the store the same way (`app/_provider.tsx`). */
const Harness = () => {
  const locale = useSettingsStore((state) => state.language)
  return (
    <I18nProvider locale={locale}>
      <LanguageSwitcher />
    </I18nProvider>
  )
}

describe('LanguageSwitcher', () => {
  beforeEach(() => {
    useSettingsStore.getState().reset()
  })

  it('offers the three languages and marks the current one', () => {
    render(<Harness />)

    expect(
      screen.getByRole('group', { name: 'Interface language' }),
    ).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'English' })).toHaveAttribute(
      'aria-pressed',
      'true',
    )
    expect(screen.getByRole('button', { name: 'Українська' })).toHaveAttribute(
      'aria-pressed',
      'false',
    )
    expect(screen.getByRole('button', { name: 'Polski' })).toHaveTextContent(
      'PL',
    )
  })

  it('switches the interface language through the settings store', async () => {
    const user = userEvent.setup()
    render(<Harness />)

    await user.click(screen.getByRole('button', { name: 'Українська' }))

    expect(useSettingsStore.getState().language).toBe('uk')
    expect(
      screen.getByRole('group', { name: 'Мова інтерфейсу' }),
    ).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Українська' })).toHaveAttribute(
      'aria-pressed',
      'true',
    )
  })
})

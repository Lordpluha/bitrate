import { I18nProvider } from '@shared/i18n'
import { saveLocale } from '@shared/i18n/model/saveLocale'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { LanguagePreference } from './LanguagePreference'

vi.mock('@shared/i18n/model/saveLocale', () => ({
  saveLocale: vi.fn(() => Promise.resolve()),
}))

describe('LanguagePreference', () => {
  it('switches the workspace language and saves it for the next visit', async () => {
    const user = userEvent.setup()
    render(
      <I18nProvider initialLocale="en">
        <LanguagePreference />
      </I18nProvider>,
    )

    await user.selectOptions(screen.getByLabelText('Interface language'), 'uk')

    expect(screen.getByLabelText('Мова інтерфейсу')).toHaveValue('uk')
    expect(document.documentElement.lang).toBe('uk')
    expect(saveLocale).toHaveBeenCalledWith({ data: 'uk' })
  })
})

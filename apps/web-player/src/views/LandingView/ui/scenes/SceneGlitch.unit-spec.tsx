import { I18nProvider, type Locale } from '@shared/i18n'
import { render } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { SceneDevices } from './SceneDevices'
import { SceneSignal } from './SceneSignal'

const glitchTexts = (locale: Locale) => {
  const { container, unmount } = render(
    <I18nProvider locale={locale}>
      <SceneSignal signedIn={false} />
      <SceneDevices />
    </I18nProvider>,
  )
  const pairs = [
    ...container.querySelectorAll<HTMLElement>('.glitch[data-text]'),
  ].map((el) => [el.dataset.text, el.textContent])
  unmount()
  return pairs
}

describe('landing glitch labels', () => {
  it.each<Locale>(['en', 'uk', 'pl'])(
    'ghost the localised label in %s',
    (locale) => {
      const pairs = glitchTexts(locale)
      expect(pairs.length).toBeGreaterThan(0)
      for (const [ghost, text] of pairs) expect(ghost).toBe(text)
    },
  )
})

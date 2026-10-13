import { describe, expect, it } from 'vitest'
import { pickLandingCopy } from './copy'

describe('pickLandingCopy', () => {
  it('uses the English catalog for en', () => {
    expect(pickLandingCopy('en')('hero.open_web_player')).toBe(
      'Open web player',
    )
  })

  it('translates landing copy for uk and pl', () => {
    expect(pickLandingCopy('uk')('hero.open_web_player')).toBe(
      'Відкрити вебплеєр',
    )
    expect(pickLandingCopy('pl')('hero.open_web_player')).toBe(
      'Otwórz odtwarzacz',
    )
  })

  it('falls back to English for keys a catalog leaves out (track and artist names)', () => {
    expect(pickLandingCopy('uk')('hero.night_signal')).toBe('Night Signal')
    expect(pickLandingCopy('pl')('library.luma_vale')).toBe('Luma Vale')
  })

  it('shows the landing in English for app locales it does not cover (de, ru)', () => {
    expect(pickLandingCopy('de')('hero.open_web_player')).toBe(
      'Open web player',
    )
    expect(pickLandingCopy('ru')('cta.ready_when_you_are')).toBe(
      'READY WHEN YOU ARE',
    )
  })

  it('interpolates values', () => {
    expect(pickLandingCopy('en')('chrome.go_to', { scene: 'Library' })).toBe(
      'Go to Library',
    )
    expect(pickLandingCopy('uk')('chrome.go_to', { scene: 'Бібліотека' })).toBe(
      'Перейти до: Бібліотека',
    )
  })
})

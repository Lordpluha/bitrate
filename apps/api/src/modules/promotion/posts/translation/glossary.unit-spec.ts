import { describe, expect, it } from '@jest/globals'
import { buildTranslationRequest } from './build-translation-request'
import { findMissingTerms } from './find-missing-terms'
import { glossaryTerms } from './glossary-terms'

const source =
  'Afterglow by Demo Artist is out on Bitrate. https://bitrate.me/a/1 #afterglow #indie'

describe('glossaryTerms', () => {
  it('protects names found in the source, Bitrate, links and hashtags', () => {
    expect(glossaryTerms(source, ['Afterglow', 'Demo Artist', 'Night Signal'])).toEqual([
      'Afterglow',
      'Demo Artist',
      'Bitrate',
      'https://bitrate.me/a/1',
      '#afterglow',
      '#indie',
    ])
  })
})

describe('findMissingTerms', () => {
  it('reports each protected term the translation dropped or changed', () => {
    const translation = 'Afterglow від Demo Artist вже на Бітрейті. #afterglow'
    expect(findMissingTerms(translation, ['Afterglow', 'Bitrate', '#afterglow', '#indie'])).toEqual(
      [
        { kind: 'term', value: 'Bitrate' },
        { kind: 'term', value: '#indie' },
      ],
    )
  })
})

describe('buildTranslationRequest', () => {
  it('names the language, lists the protected terms and accepts the source as facts', () => {
    const { prompt, facts } = buildTranslationRequest(source, 'pl', ['Afterglow'])
    expect(prompt).toContain('Translate into Polish.')
    expect(prompt).toContain('Protected terms: "Afterglow".')
    expect(facts).toEqual([source, 'Afterglow'])
  })
})

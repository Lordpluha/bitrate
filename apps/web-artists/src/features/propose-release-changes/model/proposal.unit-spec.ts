import { describe, expect, it } from 'vitest'
import { buildProposal } from './proposal'

const current = {
  title: 'First light',
  recordings: [
    { id: 'r1', title: 'Night drive' },
    { id: 'r2', title: 'Ocean' },
  ],
}

const cover = new File(['png'], 'cover.png', { type: 'image/png' })

describe('buildProposal', () => {
  it('sends only the values the artist changed, trimmed', () => {
    expect(
      buildProposal(current, {
        title: '  Second light ',
        recordings: { r1: 'Night drive', r2: ' Ocean (Edit) ' },
        cover,
      }),
    ).toEqual({
      ok: true,
      proposal: {
        title: 'Second light',
        recordings: [{ id: 'r2', title: 'Ocean (Edit)' }],
        cover,
      },
    })
  })

  it('reports nothing to send when every value is unchanged', () => {
    expect(
      buildProposal(current, {
        title: 'First light',
        recordings: { r1: 'Night drive ' },
      }),
    ).toEqual({ ok: false, error: 'releaseChanges.form.nothingChanged' })
  })

  it('refuses an empty title', () => {
    expect(buildProposal(current, { title: '   ', recordings: {} })).toEqual({
      ok: false,
      error: 'releaseChanges.form.titleRequired',
    })
  })

  it('refuses a title longer than the API accepts', () => {
    expect(
      buildProposal(current, {
        title: 'x'.repeat(256),
        recordings: {},
      }),
    ).toEqual({ ok: false, error: 'releaseChanges.form.titleTooLong' })
  })

  it('checks recording titles too', () => {
    expect(
      buildProposal(current, { title: 'First light', recordings: { r1: '' } }),
    ).toEqual({ ok: false, error: 'releaseChanges.form.titleRequired' })
  })
})

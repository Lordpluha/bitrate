import { describe, expect, it } from '@jest/globals'
import { findContactDetails } from './contact-details'

describe('findContactDetails', () => {
  it('passes ordinary post text', () => {
    expect(findContactDetails('Wrote this one at 3 a.m. It sounds like it. 15 seconds.')).toEqual(
      [],
    )
  })

  it.each([
    ['DM me at hello@band.com', ['email']],
    ['Tickets: https://tix.example/abc', ['url']],
    ['link in bio: band.fm', ['url']],
    ['Call +380 67 123 45 67', ['phone']],
    ['Follow @demoartist', ['handle']],
  ])('finds the contact detail in %j', (text, expected) => {
    expect(findContactDetails(text)).toEqual(expected)
  })

  it('does not count an email as a handle as well', () => {
    expect(findContactDetails('me@band.com')).toEqual(['email'])
  })
})

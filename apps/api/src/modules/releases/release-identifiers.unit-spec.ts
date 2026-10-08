import { describe, expect, it } from '@jest/globals'
import { isValidUpc, normalizeIsrc } from './release-identifiers'

describe('release identifiers', () => {
  it.each([
    '036000291452', // UPC-A
    '4006381333931', // EAN-13
  ])('accepts the barcode %s with a valid check digit', (upc) => {
    expect(isValidUpc(upc)).toBe(true)
  })

  it.each([
    ['a wrong check digit', '036000291453'],
    ['too few digits', '03600029145'],
    ['too many digits', '40063813339310'],
    ['letters', '03600029145A'],
    ['separators', '0-36000-29145-2'],
  ])('rejects a barcode with %s', (_reason, upc) => {
    expect(isValidUpc(upc)).toBe(false)
  })

  it.each([
    ['US-RC1-76-07839', 'USRC17607839'],
    ['usrc17607839', 'USRC17607839'],
    [' GB-AYE-06-00001 ', 'GBAYE0600001'],
  ])('stores %p as %p', (input, stored) => {
    expect(normalizeIsrc(input)).toBe(stored)
  })

  it.each([
    ['a short designation', 'US-RC1-76-0783'],
    ['a numeric country code', '12RC17607839'],
    ['a non-numeric year', 'USRC1AB07839'],
    ['misplaced separators', 'USR-C17-607839'],
    ['punctuation in the registrant', 'USR_117607839'],
  ])('rejects an ISRC with %s', (_reason, isrc) => {
    expect(normalizeIsrc(isrc)).toBeNull()
  })
})

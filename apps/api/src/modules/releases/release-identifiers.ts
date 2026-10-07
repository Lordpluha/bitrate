/** UPC-A (12 digits) or EAN-13 (13 digits), both GTIN barcodes with a trailing check digit. */
const UPC_PATTERN = /^\d{12,13}$/
/** Stored barcodes are GTIN-13, so a UPC-A and its EAN-13 spelling are one value. */
const GTIN_13_LENGTH = 13
/** ISO 3901: country (2 letters), registrant (3 alphanumerics), year (2 digits), designation (5 digits). */
const ISRC_PATTERN = /^[A-Z]{2}[A-Z0-9]{3}\d{7}$/
/** The hyphenated display form; separators are accepted only at their standard positions. */
const DISPLAY_ISRC_PATTERN = /^[A-Z]{2}-[A-Z0-9]{3}-\d{2}-\d{5}$/

/** Returns the stored GTIN-13, or null when the input is not a barcode with a valid check digit. */
export function normalizeUpc(value: string): string | null {
  const code = value.trim()
  if (!UPC_PATTERN.test(code)) return null
  const digits = [...code].map(Number)
  const check = digits.pop()
  // GTIN weights alternate 3, 1 from the digit nearest the check digit.
  const sum = digits
    .reverse()
    .reduce((total, digit, index) => total + digit * (index % 2 === 0 ? 3 : 1), 0)
  return (10 - (sum % 10)) % 10 === check ? code.padStart(GTIN_13_LENGTH, '0') : null
}

/** Returns the compact stored ISRC, or null when the input is not a valid ISRC. */
export function normalizeIsrc(value: string): string | null {
  const upper = value.trim().toUpperCase()
  const compact = DISPLAY_ISRC_PATTERN.test(upper) ? upper.replaceAll('-', '') : upper
  return ISRC_PATTERN.test(compact) ? compact : null
}

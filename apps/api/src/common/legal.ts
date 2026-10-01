/**
 * Revision of the Terms of Use and Privacy Policy that registration records as accepted.
 * One value covers the pair; bump it to the effective date of each new revision.
 */
export const LEGAL_VERSION = '2026-10-01'

/** Revision of the Artist Agreement that artist registration records as accepted. */
export const ARTIST_AGREEMENT_VERSION = '2026-10-01'

/**
 * Thrown when a new account would be created through social sign-in without the legal
 * documents having been accepted. The sign-in controllers turn it into a redirect back to
 * login rather than an error response, because the caller is a browser mid-redirect.
 */
export class LegalAcceptanceRequiredError extends Error {
  constructor() {
    super('The legal documents must be accepted before an account is created')
    this.name = 'LegalAcceptanceRequiredError'
  }
}

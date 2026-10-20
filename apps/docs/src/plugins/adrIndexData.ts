/** Shared between the build-time plugin and the browser; keep Node imports out of this file. */

/** One architecture decision record, as the home page lists it. */
export type AdrSummary = {
  /** Four-digit record number, e.g. "0020". */
  number: string
  title: string
  /** Docs plugin id; Docusaurus strips the number prefix from the file name. */
  docId: string
}

export type AdrIndex = { adrs: AdrSummary[] }

export const ADR_INDEX_PLUGIN = 'adr-index'

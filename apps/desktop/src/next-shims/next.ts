/**
 * Type-only stand-in for the `next` package. The reused code imports `Metadata` for page
 * metadata builders that desktop never renders; a desktop window has one title.
 */
export type Metadata = Record<string, unknown>

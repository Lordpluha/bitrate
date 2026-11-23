/** A knowledge source that must not be ingested: bad front matter, wrong folder, a draft. */
export class KnowledgeSourceError extends Error {
  constructor(
    readonly path: string,
    detail: string,
  ) {
    super(`${path}: ${detail}`)
    this.name = 'KnowledgeSourceError'
  }
}

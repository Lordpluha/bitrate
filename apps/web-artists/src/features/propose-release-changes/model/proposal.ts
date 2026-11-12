import type { TranslationKey } from '@shared/i18n'

/** Mirrors the API's title limit, so the form refuses what the API would. */
const MAX_TITLE_LENGTH = 255

export interface ProposalBase {
  title: string
  recordings: { id: string; title: string }[]
}

export interface ProposalValues {
  title: string
  /** Edited recording titles by recording id; untouched recordings may be left out. */
  recordings: Record<string, string>
  cover?: File
}

interface Proposal {
  title?: string
  recordings?: { id: string; title: string }[]
  cover?: File
}

export type ProposalResult =
  | { ok: true; proposal: Proposal }
  | { ok: false; error: TranslationKey }

function titleProblem(title: string): TranslationKey | null {
  if (!title) return 'releaseChanges.form.titleRequired'
  if (title.length > MAX_TITLE_LENGTH) return 'releaseChanges.form.titleTooLong'
  return null
}

/** The changes to send: each value the artist actually changed, or why the form cannot be sent. */
export function buildProposal(
  current: ProposalBase,
  values: ProposalValues,
): ProposalResult {
  const proposal: Proposal = {}
  const title = values.title.trim()
  if (title !== current.title) {
    const problem = titleProblem(title)
    if (problem) return { ok: false, error: problem }
    proposal.title = title
  }
  const recordings: { id: string; title: string }[] = []
  for (const recording of current.recordings) {
    const edited = values.recordings[recording.id]
    if (edited === undefined) continue
    const next = edited.trim()
    if (next === recording.title) continue
    const problem = titleProblem(next)
    if (problem) return { ok: false, error: problem }
    recordings.push({ id: recording.id, title: next })
  }
  if (recordings.length) proposal.recordings = recordings
  if (values.cover) proposal.cover = values.cover
  if (Object.keys(proposal).length === 0)
    return { ok: false, error: 'releaseChanges.form.nothingChanged' }
  return { ok: true, proposal }
}

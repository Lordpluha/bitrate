type TrackActionKind = 'isrc' | 'track-audio' | 'track-rename' | 'track-remove'

/** Everything the workspace asks its page to open; the page shows one dialog per action. */
export type WorkspaceAction =
  | { kind: 'edit' }
  | { kind: 'schedule' }
  /** `file` is artwork dropped on the header, opened ready to save. */
  | { kind: 'cover'; file?: File }
  | { kind: 'rights' }
  | { kind: 'upc' }
  | { kind: 'splits' }
  | { kind: 'track-add' }
  | { kind: TrackActionKind; trackId: string }
  | { kind: 'contributor-add' }
  | { kind: 'contributor-edit'; contributorId: string }
  | { kind: 'contributor-remove'; contributorId: string }
  | { kind: 'contributor-self' }
  /** The read-only summary that ends in submitting the draft for review. */
  | { kind: 'submit' }

export type WorkspaceActionHandler = (action: WorkspaceAction) => void

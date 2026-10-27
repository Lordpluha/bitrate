type TrackActionKind = 'isrc' | 'track-audio' | 'track-rename' | 'track-remove'

/** Everything the workspace asks its page to open; the page shows one dialog per action. */
export type WorkspaceAction =
  | { kind: 'edit' }
  | { kind: 'schedule' }
  | { kind: 'cover' }
  | { kind: 'rights' }
  | { kind: 'upc' }
  | { kind: 'splits' }
  | { kind: 'track-add' }
  | { kind: TrackActionKind; trackId: string }
  | { kind: 'contributor-add' }
  | { kind: 'contributor-edit'; contributorId: string }
  | { kind: 'contributor-remove'; contributorId: string }
  | { kind: 'contributor-self' }

export type WorkspaceActionHandler = (action: WorkspaceAction) => void

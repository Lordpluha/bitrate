import type { ReleaseWorkspace } from '@entities/release'
import { Info } from 'lucide-react'

export function WorkspaceNextStep({ release }: { release: ReleaseWorkspace }) {
  const draft = release.status === 'DRAFT'
  return (
    <section
      aria-labelledby="release-next-heading"
      className="artist-release-workspace-panel artist-release-next-step"
    >
      <h2 id="release-next-heading">Next step</h2>
      <div className="artist-release-inset">
        <Info aria-hidden="true" className="size-5 shrink-0 text-accent" />
        <div>
          <h3>{draft ? 'Prepare the release details' : 'Release details'}</h3>
          <p>
            {draft
              ? 'Add the artwork and a master for every track, then confirm rights. Review feedback is coming soon.'
              : 'Review feedback is coming soon.'}
          </p>
          <p>
            {release.isDemo
              ? 'Illustrative demo release.'
              : 'Your release is saved in Music.'}
          </p>
        </div>
      </div>
    </section>
  )
}

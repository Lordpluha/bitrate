import { Button } from '@bitrate/ui-react'
import {
  type ReleaseWorkspace,
  releaseStatusLabels,
  releaseTypeLabels,
} from '@entities/release'
import { ROUTES } from '@shared/routes/routes'
import { Link } from '@tanstack/react-router'
import { Info, Music2 } from 'lucide-react'
import { WorkspaceParticipants } from './WorkspaceParticipants'
import { WorkspaceTracks } from './WorkspaceTracks'

const formatter = new Intl.DateTimeFormat('en-US', {
  dateStyle: 'medium',
  timeStyle: 'short',
  timeZone: 'UTC',
})
const date = (value: string) => formatter.format(new Date(value))

interface ReleaseWorkspaceContentProps {
  release: ReleaseWorkspace
  onEdit: () => void
  onSchedule: () => void
  onAddContributor: () => void
  onEditContributor: (id: string) => void
}

export function ReleaseWorkspaceContent({
  release,
  onEdit,
  onSchedule,
  onAddContributor,
  onEditContributor,
}: ReleaseWorkspaceContentProps) {
  const draft = release.status === 'DRAFT'
  return (
    <>
      <header className="artist-release-page-heading">
        <h1>{release.title}</h1>
        <p>
          {releaseTypeLabels[release.type]} ·{' '}
          {releaseStatusLabels[release.status]}
        </p>
      </header>
      <Link
        className="artist-release-back lg:hidden"
        search={{ tab: 'releases', page: 1 }}
        to={ROUTES.dashboard.music}
      >
        Back to music
      </Link>
      <div className="artist-release-workspace-panels">
        <section
          aria-label="Release summary"
          className="artist-release-workspace-panel artist-release-overview"
        >
          <img
            alt=""
            aria-hidden="true"
            className="artist-release-waveform"
            src="/artwork/releases/release-waveform.png"
          />
          <div className="artist-release-identity">
            {release.cover ? (
              <img
                alt={`${release.title} artwork`}
                className="artist-release-cover"
                src={release.cover}
              />
            ) : (
              <div className="artist-release-cover artist-release-cover-placeholder">
                <Music2 aria-hidden="true" />
              </div>
            )}
            <div className="min-w-0">
              <h2>{release.title}</h2>
              <p>
                {release.artistName} · {releaseTypeLabels[release.type]} ·{' '}
                {release.trackCount}{' '}
                {release.trackCount === 1 ? 'track' : 'tracks'}
              </p>
              <span className="artist-release-status">
                {releaseStatusLabels[release.status]}
              </span>
              <p className="artist-release-updated">
                Updated {date(release.updatedAt)} UTC
              </p>
            </div>
          </div>
          <div className="artist-release-next-action">
            <div>
              <p className="artist-release-eyebrow">Next action</p>
              <h3>
                {draft
                  ? 'Continue preparing your release'
                  : 'Check your release details'}
              </h3>
              <p className="artist-release-next-description">
                {draft
                  ? 'You can update the title and release type.'
                  : 'This release is available to view.'}
              </p>
            </div>
            {draft ? (
              <Button
                className="artist-workspace-primary rounded-full"
                onClick={onEdit}
                variant="primary"
              >
                Edit draft
              </Button>
            ) : (
              <Button
                asChild
                className="artist-workspace-primary rounded-full"
                variant="primary"
              >
                <a href="#release-tracks-heading">View tracks</a>
              </Button>
            )}
          </div>
        </section>
        <section
          aria-labelledby="release-stages-heading"
          className="artist-release-workspace-panel artist-release-stages"
        >
          <h2 id="release-stages-heading">Release timeline</h2>
          <p>Review and delivery are coming soon.</p>
          <ol>
            {['Draft', 'Review', 'Prepare', 'Deliver', 'Launch'].map(
              (stage, index) => (
                <li
                  aria-current={index === 0 && draft ? 'step' : undefined}
                  key={stage}
                >
                  <span className="artist-release-stage-number">
                    {index + 1}
                  </span>
                  <span>{stage}</span>
                  <small>
                    {index === 0
                      ? draft
                        ? 'Current'
                        : 'Saved'
                      : 'Coming soon'}
                  </small>
                </li>
              ),
            )}
          </ol>
        </section>
        <section
          aria-labelledby="release-next-heading"
          className="artist-release-workspace-panel artist-release-next-step"
        >
          <h2 id="release-next-heading">Next step</h2>
          <div className="artist-release-inset">
            <Info aria-hidden="true" className="size-5 shrink-0 text-accent" />
            <div>
              <h3>
                {draft ? 'Prepare the release details' : 'Release details'}
              </h3>
              <p>
                Audio uploads, artwork editing and review feedback are coming
                soon.
              </p>
              <p>
                {release.isDemo
                  ? 'Illustrative demo release.'
                  : 'Your release is saved in Music.'}
              </p>
            </div>
          </div>
        </section>
        <section
          aria-labelledby="release-preparation-heading"
          className="artist-release-workspace-panel artist-release-preparation"
        >
          <h2 id="release-preparation-heading">Preparation summary</h2>
          {draft && (
            <Button
              className="mt-3"
              onClick={onSchedule}
              size="sm"
              variant="outline"
            >
              Edit schedule
            </Button>
          )}
          <dl>
            <div>
              <dt>Tracks linked</dt>
              <dd>{release.trackCount}</dd>
            </div>
            <div>
              <dt>Artwork</dt>
              <dd>{release.cover ? 'Added' : 'Not added'}</dd>
            </div>
            <div>
              <dt>Scheduled date</dt>
              <dd>
                {release.scheduledAt
                  ? `${date(release.scheduledAt)} UTC`
                  : 'Not scheduled'}
              </dd>
            </div>
          </dl>
        </section>
        <WorkspaceTracks release={release} />
        <WorkspaceParticipants
          onAddContributor={onAddContributor}
          onEditContributor={onEditContributor}
          release={release}
        />
      </div>
      <p className="artist-release-disclaimer">
        <Info aria-hidden="true" className="size-4 shrink-0" />
        {release.isDemo ? 'Illustrative demo data. ' : ''}Preparation details do
        not confirm approval or external delivery.
      </p>
    </>
  )
}

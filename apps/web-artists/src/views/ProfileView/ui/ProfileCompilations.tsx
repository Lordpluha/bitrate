import { Button } from '@bitrate/ui-react'
import {
  CreateReleaseFeedback,
  useCreateReleaseAction,
} from '@features/create-release'
import { useI18n } from '@shared/i18n'
import { PanelIcon } from '@shared/ui'
import { ArrowUpRight, Disc3, Library, LoaderCircle } from 'lucide-react'

/** The profile owns the entry point; the release workspace remains the compilation editor. */
export function ProfileCompilations({ artistId }: { artistId: string }) {
  const { t } = useI18n()
  const action = useCreateReleaseAction(artistId, 'COMPILATION')
  return (
    <section
      aria-labelledby="profile-compilations-heading"
      className="artist-release-workspace-panel artist-profile-compilations"
    >
      <div aria-hidden="true" className="artist-profile-compilations-art">
        <span>
          <Disc3 />
        </span>
        <span>
          <Disc3 />
        </span>
        <span>
          <Disc3 />
        </span>
      </div>
      <div className="min-w-0 flex-1">
        <h2 id="profile-compilations-heading">
          <PanelIcon icon={Library} />
          {t('profile.compilations.title')}
        </h2>
        <p className="mt-2 max-w-xl">{t('profile.compilations.description')}</p>
        <p className="artist-profile-compilations-note">
          {t('profile.compilations.note')}
        </p>
      </div>
      <Button
        aria-busy={action.pending}
        className="artist-workspace-primary shrink-0 gap-2 rounded-full"
        disabled={action.pending}
        onClick={() => void action.create()}
        variant="primary"
      >
        {t(
          action.pending
            ? 'music.create.submitting'
            : 'profile.compilations.create',
        )}
        {action.pending ? (
          <LoaderCircle
            aria-hidden="true"
            className="size-4 animate-spin motion-reduce:animate-none"
          />
        ) : (
          <ArrowUpRight aria-hidden="true" className="size-4" />
        )}
      </Button>
      <CreateReleaseFeedback action={action} />
    </section>
  )
}

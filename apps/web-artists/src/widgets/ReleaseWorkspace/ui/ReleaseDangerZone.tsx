import { Button } from '@bitrate/ui-react'
import { useI18n } from '@shared/i18n'
import { Trash2 } from 'lucide-react'

export function ReleaseDangerZone({ onDelete }: { onDelete: () => void }) {
  const { t } = useI18n()
  return (
    <section
      aria-labelledby="release-danger-heading"
      className="artist-release-workspace-panel border-destructive/40"
    >
      <h2 id="release-danger-heading">{t('workspace.danger.title')}</h2>
      <p>{t('workspace.danger.description')}</p>
      <Button className="mt-4 gap-2" onClick={onDelete} variant="destructive">
        <Trash2 aria-hidden="true" className="size-4" />
        {t('music.item.deleteRelease')}
      </Button>
    </section>
  )
}

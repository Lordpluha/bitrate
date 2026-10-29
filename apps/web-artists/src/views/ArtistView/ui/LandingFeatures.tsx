import { useI18n } from '@shared/i18n'
import { LANDING_FEATURES } from '../config/features'

export const LandingFeatures = () => {
  const { t } = useI18n()
  return (
    <section
      aria-label={t('landing.features')}
      className="mx-auto max-w-7xl px-4 pb-16 sm:px-8 lg:pb-20"
    >
      <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4 lg:gap-8">
        {LANDING_FEATURES.map(({ icon: Icon, title, description }) => (
          <li className="flex gap-3.5" key={title}>
            <span className="flex size-11 shrink-0 items-center justify-center rounded-full border border-ring text-accent">
              <Icon aria-hidden="true" className="size-5" />
            </span>
            <div className="flex flex-col gap-1">
              <h2 className="text-base font-semibold">{t(title)}</h2>
              <p className="text-sm text-text-secondary">{t(description)}</p>
            </div>
          </li>
        ))}
      </ul>
    </section>
  )
}

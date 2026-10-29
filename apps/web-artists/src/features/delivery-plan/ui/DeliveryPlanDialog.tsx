import { Input } from '@bitrate/ui-react'
import { type ReleaseDelivery, useSaveDeliveryPlan } from '@entities/delivery'
import { countries, countryName } from '@shared/constants/countries'
import {
  type DeliveryDestination,
  deliveryDestinations,
  destinationLabels,
} from '@shared/constants/destinations'
import { type TranslationKey, useI18n } from '@shared/i18n'
import { WorkspaceFormModal } from '@shared/ui/WorkspaceFormModal/WorkspaceFormModal'
import { useId, useState } from 'react'

interface DeliveryPlanDialogProps {
  artistId: string
  delivery: ReleaseDelivery
  /** The release version the plan is saved against. */
  expectedUpdatedAt: string
  onClose: () => void
  onSaved: () => void
}

type TerritoryMode = ReleaseDelivery['territories']['mode']

/** Chooses stores and territories; saving a plan sends nothing anywhere. */
export function DeliveryPlanDialog({
  artistId,
  delivery,
  expectedUpdatedAt,
  onClose,
  onSaved,
}: DeliveryPlanDialogProps) {
  const id = useId()
  const save = useSaveDeliveryPlan(artistId)
  const { t } = useI18n()
  const [stores, setStores] = useState<Set<DeliveryDestination>>(
    () =>
      new Set(
        delivery.destinations
          .filter((item) => item.planned)
          .map((item) => item.destination),
      ),
  )
  const [mode, setMode] = useState<TerritoryMode>(delivery.territories.mode)
  const [selected, setSelected] = useState<Set<string>>(
    () => new Set(delivery.territories.countries),
  )
  const [query, setQuery] = useState('')
  const [problem, setProblem] = useState<TranslationKey | null>(null)
  const filter = query.trim().toLowerCase()
  const shown = filter
    ? countries.filter(
        (country) =>
          country.name.toLowerCase().includes(filter) ||
          country.code.toLowerCase() === filter,
      )
    : countries

  const toggle = <T,>(set: Set<T>, value: T) => {
    const next = new Set(set)
    if (next.has(value)) next.delete(value)
    else next.add(value)
    return next
  }

  const submit = async () => {
    if (mode === 'SELECTED' && selected.size === 0) {
      setProblem('delivery.chooseCountry')
      return
    }
    try {
      await save.mutateAsync({
        id: delivery.releaseId,
        input: {
          destinations: deliveryDestinations.filter((item) => stores.has(item)),
          territories:
            mode === 'WORLDWIDE'
              ? { mode: 'WORLDWIDE' }
              : { mode: 'SELECTED', countries: [...selected].sort() },
          expectedUpdatedAt,
        },
      })
      onSaved()
    } catch {
      // Keep the choices when the write is rejected or unconfirmed.
    }
  }

  return (
    <WorkspaceFormModal
      error={save.error}
      onClose={onClose}
      onSubmit={submit}
      pending={save.isPending}
      submitLabel={t('delivery.savePlan')}
      title={t('delivery.title')}
    >
      <p className="text-sm text-text-secondary">{t('delivery.planIntro')}</p>
      <fieldset className="space-y-2">
        <legend className="text-sm font-medium">{t('delivery.stores')}</legend>
        <div className="grid gap-2 sm:grid-cols-2">
          {deliveryDestinations.map((destination, index) => (
            <label
              className="flex items-center gap-2 rounded-md border border-border px-3 py-2 text-sm"
              key={destination}
            >
              <input
                checked={stores.has(destination)}
                data-initial-focus={index === 0 ? true : undefined}
                disabled={save.isPending}
                onChange={() => {
                  save.reset()
                  setStores((current) => toggle(current, destination))
                }}
                type="checkbox"
              />
              {destinationLabels[destination]}
            </label>
          ))}
        </div>
      </fieldset>
      <fieldset className="space-y-3">
        <legend className="text-sm font-medium">
          {t('delivery.territories')}
        </legend>
        <div className="flex flex-wrap gap-4 text-sm">
          {(['WORLDWIDE', 'SELECTED'] as const).map((value) => (
            <label className="flex items-center gap-2" key={value}>
              <input
                checked={mode === value}
                disabled={save.isPending}
                name={`${id}-territories`}
                onChange={() => {
                  save.reset()
                  setProblem(null)
                  setMode(value)
                }}
                type="radio"
              />
              {value === 'WORLDWIDE'
                ? t('delivery.worldwide')
                : t('delivery.selectedCountries')}
            </label>
          ))}
        </div>
        {mode === 'SELECTED' && (
          <div className="space-y-2">
            <label className="sr-only" htmlFor={`${id}-country-search`}>
              {t('delivery.searchCountries')}
            </label>
            <Input
              autoComplete="off"
              disabled={save.isPending}
              id={`${id}-country-search`}
              onChange={(event) => setQuery(event.target.value)}
              placeholder={t('delivery.searchCountries')}
              value={query}
            />
            <p aria-live="polite" className="text-xs text-text-secondary">
              {selected.size === 0
                ? t('delivery.noCountries')
                : t('delivery.selected', {
                    count: selected.size,
                    names: `${[...selected].slice(0, 6).map(countryName).join(', ')}${selected.size > 6 ? '…' : ''}`,
                  })}
            </p>
            <ul className="max-h-56 space-y-1 overflow-y-auto rounded-md border border-border p-2">
              {shown.map((country) => (
                <li key={country.code}>
                  <label className="flex items-center gap-2 px-1 py-0.5 text-sm">
                    <input
                      checked={selected.has(country.code)}
                      disabled={save.isPending}
                      onChange={() => {
                        save.reset()
                        setProblem(null)
                        setSelected((current) => toggle(current, country.code))
                      }}
                      type="checkbox"
                    />
                    {country.name}
                  </label>
                </li>
              ))}
              {shown.length === 0 && (
                <li className="px-1 text-sm text-text-secondary">
                  {t('delivery.noMatch', { query })}
                </li>
              )}
            </ul>
          </div>
        )}
        {problem && (
          <p className="text-sm text-destructive" role="alert">
            {t(problem)}
          </p>
        )}
      </fieldset>
    </WorkspaceFormModal>
  )
}

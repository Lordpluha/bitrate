import { Button, Input } from '@bitrate/ui-react'
import {
  countries,
  countryName,
  type DeliveryDestination,
  deliveryDestinations,
  destinationLabels,
  type ReleaseDelivery,
  useSaveDeliveryPlan,
} from '@entities/delivery'
import { WorkspaceModal } from '@shared/ui/WorkspaceModal/WorkspaceModal'
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
  const [problem, setProblem] = useState<string | null>(null)
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
      setProblem('Choose at least one country, or deliver worldwide.')
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
    <WorkspaceModal
      canClose={!save.isPending}
      className="artist-release-credit-modal"
      onClose={onClose}
      title="Delivery plan"
    >
      <form
        aria-busy={save.isPending}
        className="space-y-6"
        noValidate
        onSubmit={(event) => {
          event.preventDefault()
          void submit()
        }}
      >
        <p className="text-sm text-text-secondary">
          Plan where this release should go. Saving the plan sends nothing:
          delivery starts only once a distribution partner is connected.
        </p>
        <fieldset className="space-y-2">
          <legend className="text-sm font-medium">Stores</legend>
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
          <legend className="text-sm font-medium">Territories</legend>
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
                {value === 'WORLDWIDE' ? 'Worldwide' : 'Selected countries'}
              </label>
            ))}
          </div>
          {mode === 'SELECTED' && (
            <div className="space-y-2">
              <label className="sr-only" htmlFor={`${id}-country-search`}>
                Search countries
              </label>
              <Input
                autoComplete="off"
                disabled={save.isPending}
                id={`${id}-country-search`}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search countries"
                value={query}
              />
              <p aria-live="polite" className="text-xs text-text-secondary">
                {selected.size === 0
                  ? 'No countries selected'
                  : `${selected.size} selected: ${[...selected]
                      .slice(0, 6)
                      .map(countryName)
                      .join(', ')}${selected.size > 6 ? '…' : ''}`}
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
                          setSelected((current) =>
                            toggle(current, country.code),
                          )
                        }}
                        type="checkbox"
                      />
                      {country.name}
                    </label>
                  </li>
                ))}
                {shown.length === 0 && (
                  <li className="px-1 text-sm text-text-secondary">
                    No country matches “{query}”.
                  </li>
                )}
              </ul>
            </div>
          )}
          {problem && (
            <p className="text-sm text-destructive" role="alert">
              {problem}
            </p>
          )}
        </fieldset>
        {save.error && (
          <p className="text-sm text-destructive" role="alert">
            {save.error.message}
          </p>
        )}
        <div className="flex flex-wrap justify-end gap-3">
          <Button
            disabled={save.isPending}
            onClick={onClose}
            type="button"
            variant="outline"
          >
            Cancel
          </Button>
          <Button
            className="artist-workspace-primary"
            disabled={save.isPending}
            type="submit"
            variant="primary"
          >
            {save.isPending ? 'Saving…' : 'Save plan'}
          </Button>
        </div>
      </form>
    </WorkspaceModal>
  )
}

import { cn } from '@bitrate/ui-react'

type ChipClassNameInput = {
  isActive: boolean
}

/**
 * The design's Chip look: a pill that fills with the primary colour when chosen. Exported for
 * the few chip rows with their own semantics (search's arrow-key tabs, multi-select tags).
 */
export const chipClassName = ({ isActive }: ChipClassNameInput) =>
  cn(
    'flex h-8 shrink-0 items-center whitespace-nowrap rounded-full border px-3.5 text-[13px] transition-colors',
    isActive
      ? 'border-primary bg-primary font-semibold text-primary-foreground'
      : 'border-border text-foreground hover:bg-surface',
  )

type FilterChip<TId extends string> = {
  id: TId
  label: string
}

type FilterChipsProps<TId extends string> = {
  /** Names the group for assistive technology. */
  ariaLabel: string
  chips: ReadonlyArray<FilterChip<TId>>
  className?: string
  onChange: (id: TId) => void
  value: TId
}

/**
 * A row of chips that filters the list below it; one is always chosen. Tabs that switch to a
 * different view use `SegmentedTabs` instead.
 */
export const FilterChips = <TId extends string>({
  ariaLabel,
  chips,
  className,
  onChange,
  value,
}: FilterChipsProps<TId>) => (
  <fieldset
    aria-label={ariaLabel}
    className={cn('m-0 flex min-w-0 gap-2 border-0 p-0', className)}
  >
    {chips.map(({ id, label }) => (
      <button
        aria-pressed={value === id}
        className={chipClassName({ isActive: value === id })}
        key={id}
        onClick={() => onChange(id)}
        type="button"
      >
        {label}
      </button>
    ))}
  </fieldset>
)

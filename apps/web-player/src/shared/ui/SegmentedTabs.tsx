import { cn } from '@bitrate/ui-react'

type SegmentedTabClassNameInput = {
  isActive: boolean
}

/** The design's Segmented Tab look; also styles a tab-like link that sits beside the tabs. */
export const segmentedTabClassName = ({
  isActive,
}: SegmentedTabClassNameInput) =>
  cn(
    'flex h-9 shrink-0 items-center rounded-md px-3 text-sm font-medium transition-colors',
    isActive
      ? 'bg-secondary text-foreground'
      : 'text-muted-foreground hover:bg-surface hover:text-foreground',
  )

export type SegmentedTab<TId extends string> = {
  id: TId
  label: string
}

type SegmentedTabsProps<TId extends string> = {
  /** Names the tablist for assistive technology. */
  ariaLabel: string
  className?: string
  onChange: (id: TId) => void
  tabs: ReadonlyArray<SegmentedTab<TId>>
  value: TId
}

/** A row of tabs that switches what the page below shows. */
export const SegmentedTabs = <TId extends string>({
  ariaLabel,
  className,
  onChange,
  tabs,
  value,
}: SegmentedTabsProps<TId>) => (
  <div
    aria-label={ariaLabel}
    className={cn('flex gap-1', className)}
    role="tablist"
  >
    {tabs.map(({ id, label }) => (
      <button
        aria-selected={value === id}
        className={segmentedTabClassName({ isActive: value === id })}
        key={id}
        onClick={() => onChange(id)}
        role="tab"
        type="button"
      >
        {label}
      </button>
    ))}
  </div>
)

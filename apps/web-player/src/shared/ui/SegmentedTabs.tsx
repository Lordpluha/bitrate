import { cn } from '@bitrate/ui-react'

type SegmentedTabClassNameInput = {
  /** Phones show the design's Chip pill instead (Chip/Active, Chip/Default). */
  chipsOnMobile?: boolean
  isActive: boolean
}

/** The design's Segmented Tab look; also styles a tab-like link that sits beside the tabs. */
export const segmentedTabClassName = ({
  chipsOnMobile = false,
  isActive,
}: SegmentedTabClassNameInput) =>
  cn(
    'flex h-9 shrink-0 items-center rounded-md px-3 text-sm font-medium whitespace-nowrap transition-colors',
    isActive
      ? 'bg-secondary text-foreground'
      : 'text-muted-foreground hover:bg-surface hover:text-foreground',
    chipsOnMobile && [
      'max-md:h-8 max-md:rounded-full max-md:border max-md:px-3.5 max-md:text-[13px]',
      isActive
        ? 'max-md:border-primary max-md:bg-primary max-md:font-semibold max-md:text-primary-foreground'
        : 'max-md:border-border max-md:font-normal max-md:text-foreground',
    ],
  )

export type SegmentedTab<TId extends string> = {
  id: TId
  label: string
}

type SegmentedTabsProps<TId extends string> = {
  /** Names the tablist for assistive technology. */
  ariaLabel: string
  /** The design draws these tabs as a row of chips on phones (Library, Charts, Friends). */
  chipsOnMobile?: boolean
  className?: string
  onChange: (id: TId) => void
  tabs: ReadonlyArray<SegmentedTab<TId>>
  value: TId
}

/** A row of tabs that switches what the page below shows. */
export const SegmentedTabs = <TId extends string>({
  ariaLabel,
  chipsOnMobile = false,
  className,
  onChange,
  tabs,
  value,
}: SegmentedTabsProps<TId>) => (
  <div
    aria-label={ariaLabel}
    className={cn('flex gap-1', chipsOnMobile && 'max-md:gap-2', className)}
    role="tablist"
  >
    {tabs.map(({ id, label }) => (
      <button
        aria-selected={value === id}
        className={segmentedTabClassName({
          chipsOnMobile,
          isActive: value === id,
        })}
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

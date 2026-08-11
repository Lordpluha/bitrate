import { cn } from '@spotify/ui-react'
import { ChevronDown } from 'lucide-react'
import { useSettingsSelect } from '@/views/Settings/model/useSettingsSelect'

export type SettingsSelectOption<TValue extends string> = {
  label: string
  value: TValue
}

type SettingsSelectProps<TValue extends string> = {
  ariaLabel: string
  onChange: (value: TValue) => void
  options: ReadonlyArray<SettingsSelectOption<TValue>>
  value: TValue
  widthClassName?: string
}

export const SettingsSelect = <TValue extends string>({
  ariaLabel,
  onChange,
  options,
  value,
  widthClassName,
}: SettingsSelectProps<TValue>) => {
  const selectedIndex = Math.max(
    options.findIndex((option) => option.value === value),
    0,
  )
  const selectedLabel = options[selectedIndex]?.label ?? value
  const select = useSettingsSelect({
    optionCount: options.length,
    selectedIndex,
  })

  return (
    <fieldset
      className={cn(
        'relative z-10 border-0 p-0 max-[700px]:w-full max-[700px]:min-w-0',
        widthClassName,
      )}
      onBlur={(event) => {
        const nextFocus = event.relatedTarget
        if (
          !(nextFocus instanceof Node) ||
          !event.currentTarget.contains(nextFocus)
        ) {
          select.close()
        }
      }}
    >
      <button
        aria-controls={select.listboxId}
        aria-expanded={select.isOpen}
        aria-haspopup="listbox"
        aria-label={ariaLabel}
        className="flex h-10 w-full items-center justify-between gap-4 rounded bg-surface px-4 text-left text-sm text-text outline-none transition-colors hover:bg-surface-hover focus:ring-2 focus:ring-white/25"
        onClick={() => {
          if (select.isOpen) select.close()
          else select.openAt(selectedIndex)
        }}
        onKeyDown={select.handleTriggerKeyDown}
        ref={select.triggerRef}
        type="button"
      >
        <span className="truncate">{selectedLabel}</span>
        <ChevronDown
          className={cn(
            'shrink-0 text-text-subdued transition-transform',
            select.isOpen && 'rotate-180',
          )}
          size={16}
        />
      </button>

      {select.isOpen && (
        <div
          className="absolute left-0 top-full z-[110] mt-1 max-h-56 w-full overflow-hidden rounded bg-background-tinted py-1 shadow-2xl ring-1 ring-border"
          id={select.listboxId}
          onKeyDown={select.handleListboxKeyDown}
          role="listbox"
        >
          {options.map((option, index) => (
            <button
              aria-selected={option.value === value}
              className={cn(
                'w-full px-4 py-2 text-left text-sm transition-colors hover:bg-surface-hover',
                option.value === value
                  ? 'bg-surface text-text'
                  : 'text-text-subdued',
              )}
              key={option.value}
              onClick={() => {
                onChange(option.value)
                select.close(true)
              }}
              ref={(element) => {
                select.optionRefs.current[index] = element
              }}
              role="option"
              tabIndex={select.activeIndex === index ? 0 : -1}
              type="button"
            >
              {option.label}
            </button>
          ))}
        </div>
      )}
    </fieldset>
  )
}

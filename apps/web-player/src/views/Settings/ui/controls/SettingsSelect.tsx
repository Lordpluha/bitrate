import { cn } from '@spotify/ui-react'
import { ChevronDown } from 'lucide-react'
import { useState } from 'react'

type SettingsSelectProps = {
  ariaLabel: string
  onChange: (value: string) => void
  options: string[]
  value: string
  widthClassName?: string
}

export const SettingsSelect = ({
  ariaLabel,
  onChange,
  options,
  value,
  widthClassName,
}: SettingsSelectProps) => {
  const [isOpen, setIsOpen] = useState(false)

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
          setIsOpen(false)
        }
      }}
    >
      <button
        aria-expanded={isOpen}
        aria-label={ariaLabel}
        className="flex h-10 w-full items-center justify-between gap-4 rounded bg-surface px-4 text-left text-sm text-text outline-none transition-colors hover:bg-surface-hover focus:ring-2 focus:ring-white/25"
        onClick={() => setIsOpen((current) => !current)}
        type="button"
      >
        <span className="truncate">{value}</span>
        <ChevronDown
          className={cn(
            'shrink-0 text-text-subdued transition-transform',
            isOpen && 'rotate-180',
          )}
          size={16}
        />
      </button>

      {isOpen && (
        <div className="absolute left-0 top-full z-[110] mt-1 max-h-56 w-full overflow-hidden rounded bg-background-tinted py-1 shadow-2xl ring-1 ring-border">
          {options.map((option) => (
            <button
              aria-selected={option === value}
              className={cn(
                'w-full px-4 py-2 text-left text-sm transition-colors hover:bg-surface-hover',
                option === value ? 'bg-surface text-text' : 'text-text-subdued',
              )}
              key={option}
              onClick={() => {
                onChange(option)
                setIsOpen(false)
              }}
              role="option"
              type="button"
            >
              {option}
            </button>
          ))}
        </div>
      )}
    </fieldset>
  )
}

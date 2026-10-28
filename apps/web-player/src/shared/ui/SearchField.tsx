'use client'

import { cn, Input } from '@bitrate/ui-react'
import { Search } from 'lucide-react'
import { useId } from 'react'

type SearchFieldProps = {
  className?: string
  id?: string
  /** Read by assistive technology; the placeholder is only a hint. */
  label: string
  onChange: (value: string) => void
  placeholder?: string
  value: string
}

/**
 * A search or filter field inside a page: ui-react's Input with the search glyph. The header
 * search keeps its own pill-shaped field.
 */
export const SearchField = ({
  className,
  id,
  label,
  onChange,
  placeholder,
  value,
}: SearchFieldProps) => {
  const generatedId = useId()
  const inputId = id ?? generatedId

  return (
    <div className={cn('relative', className)}>
      <label className="sr-only" htmlFor={inputId}>
        {label}
      </label>
      <Search
        aria-hidden="true"
        className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-muted-foreground"
        size={16}
      />
      <Input
        className="h-9 pl-9 [&::-webkit-search-cancel-button]:appearance-none"
        id={inputId}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        type="search"
        value={value}
      />
    </div>
  )
}

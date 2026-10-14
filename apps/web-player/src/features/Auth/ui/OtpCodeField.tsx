'use client'

import { cn } from '@bitrate/ui-react'
import { CircleAlert, CircleCheck } from 'lucide-react'
import { useState } from 'react'

export const OTP_LENGTH = 6

/** Stable keys for the six cells; the cells never reorder. */
const CELL_KEYS = ['d1', 'd2', 'd3', 'd4', 'd5', 'd6'] as const

type OtpCodeFieldProps = {
  /** "error" and "success" colour the cells and the hint under them. */
  hint?: string
  id: string
  label: string
  onChange: (code: string) => void
  status?: 'idle' | 'error' | 'success'
  value: string
}

/**
 * A six-digit code: one real input (paste and autofill keep working) drawn as six cells,
 * three and three.
 */
export const OtpCodeField = ({
  hint = 'Paste works too — all six digits at once.',
  id,
  label,
  onChange,
  status = 'idle',
  value,
}: OtpCodeFieldProps) => {
  const [isFocused, setIsFocused] = useState(false)
  const activeIndex = Math.min(value.length, OTP_LENGTH - 1)
  const hintId = `${id}-hint`

  return (
    <div className="flex flex-col gap-2">
      <label className="text-[13px] font-medium text-foreground" htmlFor={id}>
        {label}
      </label>
      <div className="relative w-fit">
        <input
          aria-describedby={hintId}
          aria-invalid={status === 'error'}
          autoComplete="one-time-code"
          className="absolute inset-0 z-10 h-full w-full cursor-text opacity-0"
          id={id}
          inputMode="numeric"
          maxLength={OTP_LENGTH}
          name={id}
          onBlur={() => setIsFocused(false)}
          onChange={(event) =>
            onChange(event.target.value.replace(/\D/g, '').slice(0, OTP_LENGTH))
          }
          onFocus={() => setIsFocused(true)}
          pattern="[0-9]{6}"
          required
          value={value}
        />
        <div aria-hidden="true" className="flex items-center gap-1.5">
          {CELL_KEYS.map((cellKey, index) => {
            const digit = value[index]
            const isActive =
              isFocused && status === 'idle' && index === activeIndex
            return (
              <div className="contents" key={cellKey}>
                {index === OTP_LENGTH / 2 ? (
                  <span className="h-0.5 w-2.5 rounded-full bg-border" />
                ) : null}
                <span
                  className={cn(
                    'flex h-13.5 w-11 items-center justify-center rounded-xl border font-[family-name:var(--font-landing-display)] text-[22px] font-semibold',
                    status === 'error'
                      ? 'border-destructive bg-background text-destructive'
                      : 'bg-card text-foreground',
                    status === 'success' && 'border-success-border',
                    status === 'idle' &&
                      (isActive
                        ? 'border-ring shadow-[0_0_12px_var(--color-ring)]'
                        : digit
                          ? 'border-border'
                          : 'border-input'),
                  )}
                >
                  {digit ??
                    (isActive ? (
                      <span className="h-6 w-0.5 animate-pulse rounded-full bg-primary" />
                    ) : null)}
                </span>
              </div>
            )
          })}
        </div>
      </div>
      <p
        className={cn(
          'flex items-center gap-1.5 text-xs',
          status === 'error' && 'text-destructive',
          status === 'success' && 'text-success-text',
          status === 'idle' && 'text-muted-foreground',
        )}
        id={hintId}
        role={status === 'idle' ? undefined : 'status'}
      >
        {status === 'error' ? (
          <CircleAlert aria-hidden="true" className="size-3.5" />
        ) : null}
        {status === 'success' ? (
          <CircleCheck aria-hidden="true" className="size-3.5" />
        ) : null}
        {hint}
      </p>
    </div>
  )
}

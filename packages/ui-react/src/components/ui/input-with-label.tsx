'use client'

import * as React from 'react'
import { InputProvider, useInputContext } from './input-context'
import { Input, type InputProps, inputVariants } from './input'
import { DynamicLabel, type DynamicLabelProps } from './dynamic-label'
import { cn } from '@/lib/utils'

export interface InputWithLabelProps extends InputProps {
  label: string
  labelProps?: Omit<DynamicLabelProps, 'children' | 'htmlFor'>
}

const InputWithContext: React.FC<InputProps> = ({ className, type, variant, ...props }) => {
  const { setFocused, setValue } = useInputContext()

  const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    setFocused(true)
    props.onFocus?.(e)
  }

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    setFocused(false)
    setValue(!!e.target.value)
    props.onBlur?.(e)
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setValue(!!e.target.value)
    props.onChange?.(e)
  }

  return (
    <input
      type={type}
      className={cn(inputVariants({ variant, className }))}
      onFocus={handleFocus}
      onBlur={handleBlur}
      onChange={handleChange}
      {...props}
    />
  )
}

export const InputWithLabel: React.FC<InputWithLabelProps> = ({
  label,
  labelProps,
  id,
  ...inputProps
}) => {
  const generatedId = React.useId()
  const inputId = id || generatedId

  return (
    <InputProvider>
      <div className='relative'>
        <DynamicLabel htmlFor={inputId} {...labelProps}>
          {label}
        </DynamicLabel>
        <InputWithContext id={inputId} {...inputProps} />
      </div>
    </InputProvider>
  )
}

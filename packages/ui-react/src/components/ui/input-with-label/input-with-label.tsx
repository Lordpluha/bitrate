'use client'

import * as React from 'react'
import { DynamicLabel, type DynamicLabelProps } from './dynamic-label'
import { Input, type InputProps } from './input'
import { InputProvider } from './input-context'

export interface InputWithLabelProps extends InputProps {
  label: string
  labelProps?: Omit<DynamicLabelProps, 'children' | 'htmlFor'>
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
      <div className="relative">
        <DynamicLabel htmlFor={inputId} {...labelProps}>
          {label}
        </DynamicLabel>
        <Input id={inputId} {...inputProps} />
      </div>
    </InputProvider>
  )
}

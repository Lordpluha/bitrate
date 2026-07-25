'use client'

import {
  DynamicLabel,
  FormControl,
  InputProvider,
  useFormField,
} from '@spotify/ui-react'
import type { ReactElement } from 'react'

type FloatingAuthFieldProps = {
  label: string
  children: ReactElement
}

export const FloatingAuthField = ({
  label,
  children,
}: FloatingAuthFieldProps) => {
  const { formItemId } = useFormField()

  return (
    <InputProvider>
      <div className="relative">
        <DynamicLabel
          className="!text-grey-500"
          htmlFor={formItemId}
          variant="contrast"
        >
          {label}
        </DynamicLabel>
        <FormControl>{children}</FormControl>
      </div>
    </InputProvider>
  )
}

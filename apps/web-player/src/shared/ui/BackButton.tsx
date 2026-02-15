'use client'

import { useRouter } from 'next/navigation'
import type { ComponentPropsWithRef } from 'react'

export const BackButton = ({
  onClick,
  ...props
}: ComponentPropsWithRef<'button'>) => {
  const router = useRouter()

  return (
    <button
      type="button"
      onClick={(e) => {
        onClick?.(e)
        router.back()
      }}
      {...props}
    >
      BackButton
    </button>
  )
}

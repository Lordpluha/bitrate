'use client'

import { useRouter } from 'next/navigation'
import type { ComponentPropsWithRef } from 'react'

export const BackButton = ({
  onClick,
  children,
  ...props
}: ComponentPropsWithRef<'button'>) => {
  const router = useRouter()

  return (
    <button
      onClick={(e) => {
        onClick?.(e)
        router.back()
      }}
      type="button"
      {...props}
    >
      {children}
    </button>
  )
}

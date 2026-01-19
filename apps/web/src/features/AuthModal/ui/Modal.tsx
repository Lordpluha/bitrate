'use client'

import React, { type ComponentProps, useEffect } from 'react'
import { cn } from '@spotify/ui-react'

interface ModalProps extends ComponentProps<'div'> {
  isOpen: boolean
  onOpenChange: (open: boolean) => void
}

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onOpenChange: toggleIsOpen,
  children,
  className
}) => {
  // Close on Escape key
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isOpen) {
        toggleIsOpen(false)
      }
    }

    if (isOpen) {
      document.addEventListener('keydown', handleEscape)
      document.body.style.overflow = 'hidden'
    }

    return () => {
      document.removeEventListener('keydown', handleEscape)
      document.body.style.overflow = 'unset'
    }
  }, [isOpen, toggleIsOpen])

  if (!isOpen) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      onClick={() => toggleIsOpen(false)}
    >
      <div className="absolute inset-0 w-[100vw] bg-black/60 backdrop-blur-sm" />

      <div
        className={cn(
          'relative z-10 max-h-[90vh] max-w-[90vw] overflow-auto rounded-lg shadow-xl',
          'animate-in zoom-in-95 duration-200',
          className
        )}
        onClick={(e) => e.stopPropagation()}
      >
        {children}
      </div>
    </div>
  )
}


